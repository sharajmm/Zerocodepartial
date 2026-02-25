import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { BrowserWindow } from 'electron';
import { IPC } from '../shared/constants';
import { EvidenceManager } from './evidence-manager';

let currentTestProcess: ChildProcess | null = null;
let currentTempFile: string | null = null;

export async function runPlaywrightTest(
    mainWindow: BrowserWindow,
    code: string,
    url: string,
    _steps: any[], // Needed for step reference later
    sessionId: string
) {
    // Abort any currently running test
    abortPlaywrightTest();

    const evidenceDir = EvidenceManager.getEvidenceDir(sessionId);

    // Transform the @playwright/test code to a standalone runnable node script
    const bodyMatch = code.match(/test\([^,]+,\s*async\s*\(\{\s*page\s*\}\)\s*=>\s*\{([\s\S]*?)\}\);/);
    let innerCode = bodyMatch ? bodyMatch[1] : code;

    // Remove any remaining require/import statements from the inner code just in case
    innerCode = innerCode.replace(/const\s+\{.*\}\s*=\s*require\([^)]+\);/g, '');
    innerCode = innerCode.replace(/import\s+.*from\s+.*;/g, '');

    // Inject console.log after each 'await page.' or 'await expect('
    let stepIdCounter = 0;
    innerCode = innerCode.replace(/(await\s+(?:page|expect)[^;]+;?)/g, (match) => {
        const logStr = `\n    console.log('STEP_RESULT:', JSON.stringify({ stepIndex: ${stepIdCounter}, status: 'passed' }));`;
        stepIdCounter++;
        return match + logStr;
    });

    const standaloneCode = `
import { chromium } from 'playwright-core';
import path from 'path';

// Minimal expect polyfill for standalone execution
function expect(locator) {
    return {
        toBeVisible: async () => {
            const isVisible = await locator.isVisible();
            if (!isVisible) throw new Error("Element not visible: " + locator.toString());
        },
        toHaveText: async (expected) => {
            const text = await locator.innerText();
            if (typeof expected === 'string' && text !== expected) throw new Error("Expected " + expected + " but got " + text);
        }
    }
}

(async () => {
    let currentStepProps = { stepIndex: 0, status: 'running' };
    
    // Connect to the embedded ZeroCode Electron browser instead of launching a new one
    const cdpPort = process.env.VITE_CDP_PORT || '9222';
    const browser = await chromium.connectOverCDP(\`http://localhost:\${cdpPort}\`);
    const context = browser.contexts()[0];
    
    // Find the BrowserView page (filter out the main ZeroCode UI)
    let page = context.pages().find(p => {
        const u = p.url();
        return u && !u.includes('localhost:5173') && !u.includes('dist/index.html');
    });
    
    if (!page) {
        page = context.pages()[0] || await context.newPage();
    }
    
    // Listen for step results logic is embedded in the try block
    try {
        await page.goto('${url.replace(/'/g, "\\'")}');
        console.log('STEP_RESULT:', JSON.stringify({ stepIndex: 0, status: 'passed' }));
        // redefine console.log intercept logic dynamically?
        // Actually we just use the injected step logs.
        ${innerCode}
        
        console.log('TEST_COMPLETE:', JSON.stringify({ success: true }));
    } catch(error) {
        // We know what failed sequentially because the node engine will abort on the exact line.
        const errorScreenshotUrl = path.join('${evidenceDir.replace(/\\/g, '\\\\')}', \`step-CURRENT-\${Date.now()}.png\`);
        await page.screenshot({ path: errorScreenshotUrl });
        console.log('STEP_RESULT:', JSON.stringify({ stepIndex: 'CURRENT', status: 'failed', error: error.message, screenshotPath: errorScreenshotUrl }));
    } finally {
        await browser.close();
    }
})();
`;

    // MUST write to cwd so Node can resolve node_modules local to the zero-code project vs os.tmpdir
    currentTempFile = path.join(process.cwd(), `zerocode-test-run-${Date.now()}.mjs`);
    fs.writeFileSync(currentTempFile, standaloneCode);

    currentTestProcess = spawn('node', [currentTempFile]);

    // We need to keep track of the *current* step from our own counter
    let clientStepIndex = 1; // 0 was the goto statement

    currentTestProcess.stdout?.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
            if (line.includes('STEP_RESULT:')) {
                try {
                    const jsonStr = line.split('STEP_RESULT: ')[1];
                    const result = JSON.parse(jsonStr);

                    if (result.status === 'failed') {
                        // Failed the current step we were waiting for
                        mainWindow.webContents.send(IPC.TEST_STEP_RESULT, {
                            stepIndex: clientStepIndex,
                            status: 'failed',
                            error: result.error,
                            screenshotPath: result.screenshotPath
                        });
                        mainWindow.webContents.send(IPC.TEST_COMPLETE, { success: false, totalPassed: clientStepIndex });
                    } else if (result.status === 'passed') {
                        mainWindow.webContents.send(IPC.TEST_STEP_RESULT, {
                            stepIndex: clientStepIndex,
                            status: 'passed'
                        });
                        clientStepIndex++;
                    }
                } catch (e) {
                    console.error("Failed to parse step result JSON:", e);
                }
            } else if (line.includes('TEST_COMPLETE:')) {
                mainWindow.webContents.send(IPC.TEST_COMPLETE, { success: true, totalPassed: clientStepIndex });
            }
        }
    });

    currentTestProcess.stderr?.on('data', (data) => {
        console.error(`Playwright Error: ${data}`);
    });

    currentTestProcess.on('close', (code) => {
        if (code !== 0) {
            console.log(`Test exited with code ${code}`);
        }
        cleanup();
    });
}

export function abortPlaywrightTest() {
    if (currentTestProcess) {
        currentTestProcess.kill();
        currentTestProcess = null;
    }
    cleanup();
}

function cleanup() {
    if (currentTempFile && fs.existsSync(currentTempFile)) {
        try {
            fs.unlinkSync(currentTempFile);
        } catch (e) {
            console.error("Failed to delete temp playright script", e);
        }
    }
    currentTempFile = null;
}
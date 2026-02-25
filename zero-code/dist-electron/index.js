import { BrowserView, app, shell, ipcMain, BrowserWindow } from "electron";
import path$1 from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
const IPC = {
  OLLAMA_HEALTH: "ollama:health",
  OLLAMA_LIST_MODELS: "ollama:list-models",
  OLLAMA_GENERATE: "ollama:generate",
  OLLAMA_GENERATE_TOKEN: "ollama:generate:token",
  OLLAMA_GENERATE_ERROR: "ollama:generate:error",
  DOM_SCRAPE: "dom:scrape",
  BROWSER_NAVIGATE: "browser:navigate",
  BROWSER_GET_URL: "browser:get-url",
  BROWSER_GO_BACK: "browser:go-back",
  BROWSER_GO_FORWARD: "browser:go-forward",
  BROWSER_RELOAD: "browser:reload",
  BROWSER_MOUNT: "browser:mount",
  BROWSER_RESIZE: "browser:resize",
  BROWSER_NAVIGATED: "browser:navigated",
  // emitted when URL changes
  TEST_START: "test:start",
  TEST_STEP_RESULT: "test:step-result",
  TEST_COMPLETE: "test:complete",
  TEST_ABORT: "test:abort",
  REPORT_GENERATE: "report:generate",
  REPORT_EXPORT: "report:export",
  EVIDENCE_OPEN_FOLDER: "evidence:open-folder",
  PICKER_START: "picker:start",
  PICKER_STOP: "picker:stop",
  PICKER_ELEMENT_SELECTED: "picker:element-selected"
};
const OLLAMA_BASE_URL = "http://localhost:11434";
const DOM_SCRAPE_SCRIPT = `
(() => {
  const interactiveSelectors = 'button, a, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="tab"]';
  const elements = Array.from(document.querySelectorAll(interactiveSelectors));

  // Filter 1: Element must be physically visible in the viewport or layout
  const isVisible = (el) => {
    // Check bounding rect
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    
    // Check computed styles
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    
    return true;
  };

  // Filter 2: Element must have some semantic meaning/reason to interact
  const hasMeaning = (el) => {
    // Interactive inputs always have meaning
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) return true;
    
    // Check for readable text or aria labels
    const text = (el.innerText || '').trim();
    const aria = el.getAttribute('aria-label');
    const title = el.getAttribute('title');
    
    return text.length > 0 || aria !== null || title !== null;
  };

  // Run filters
  const validElements = elements.filter(el => isVisible(el) && hasMeaning(el));

  return validElements.slice(0, 200).map((el) => {
    const computeSelector = (el) => {
      if (el.id) return '#' + el.id;
      if (el.getAttribute('data-testid')) return '[data-testid="' + el.getAttribute('data-testid') + '"]';
      if (el.getAttribute('aria-label')) return '[aria-label="' + el.getAttribute('aria-label') + '"]';
      
      const tag = el.tagName.toLowerCase();
      const parent = el.parentElement;
      if (!parent) return tag;
      const siblings = Array.from(parent.querySelectorAll(':scope > ' + tag));
      const index = siblings.indexOf(el) + 1;
      return tag + ':nth-of-type(' + index + ')';
    };
    return {
      tag: el.tagName,
      id: el.id || null,
      classes: el.className || null,
      text: (el.innerText || '').trim().substring(0, 80),
      placeholder: el.placeholder || null,
      href: el.href || null,
      ariaLabel: el.getAttribute('aria-label') || null,
      selector: computeSelector(el)
    };
  });
})()
`;
class BrowserViewController {
  view = null;
  mainWindow;
  constructor(mainWindow2) {
    this.mainWindow = mainWindow2;
  }
  init() {
    this.view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });
  }
  mount(bounds) {
    if (!this.view) return;
    this.mainWindow.addBrowserView(this.view);
    this.setBounds(bounds);
    this.view.webContents.loadURL("https://example.com");
    this.setupListeners();
  }
  setBounds(bounds) {
    if (!this.view) return;
    this.view.setBounds({
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height)
    });
  }
  async navigate(url) {
    if (!this.view) return { success: false, url: "" };
    try {
      let finalUrl = url;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        finalUrl = "https://" + url;
      }
      await this.view.webContents.loadURL(finalUrl);
      return { success: true, url: this.view.webContents.getURL() };
    } catch (error) {
      console.error("Navigation failed:", error);
      return { success: false, url: "" };
    }
  }
  async scrapeDOM() {
    if (!this.view) return { elements: [] };
    try {
      const elements = await this.view.webContents.executeJavaScript(DOM_SCRAPE_SCRIPT);
      return { elements };
    } catch (error) {
      console.error("DOM scrape failed:", error);
      return { elements: [] };
    }
  }
  async getUrl() {
    if (!this.view) return { url: "" };
    return { url: this.view.webContents.getURL() };
  }
  async startPicker() {
    if (!this.view) return;
    const highlightScript = `
      (() => {
        if (window.__pickerActive) return;
        window.__pickerActive = true;
        
        const overlay = document.createElement('div');
        overlay.id = '__zero_code_overlay';
        overlay.style.position = 'fixed';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '999999';
        overlay.style.border = '2px solid #3b82f6';
        overlay.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        overlay.style.display = 'none';
        document.body.appendChild(overlay);

        const tooltip = document.createElement('div');
        tooltip.id = '__zero_code_tooltip';
        tooltip.style.position = 'fixed';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '1000000';
        tooltip.style.backgroundColor = '#15151e';
        tooltip.style.color = 'white';
        tooltip.style.padding = '4px 8px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontFamily = 'monospace';
        tooltip.style.fontSize = '12px';
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);

        const computeSelector = (el) => {
          if (el.id) return '#' + el.id;
          if (el.getAttribute('data-testid')) return '[data-testid="' + el.getAttribute('data-testid') + '"]';
          if (el.getAttribute('aria-label')) return '[aria-label="' + el.getAttribute('aria-label') + '"]';
          return el.tagName.toLowerCase();
        };

        window.__mousemoveHandler = (e) => {
          const target = e.target;
          if (target === document.body || target === document.documentElement) {
            overlay.style.display = 'none';
            tooltip.style.display = 'none';
            return;
          }
          const rect = target.getBoundingClientRect();
          overlay.style.display = 'block';
          overlay.style.top = rect.top + 'px';
          overlay.style.left = rect.left + 'px';
          overlay.style.width = rect.width + 'px';
          overlay.style.height = rect.height + 'px';

          tooltip.style.display = 'block';
          tooltip.style.top = (rect.bottom + 5) + 'px';
          tooltip.style.left = rect.left + 'px';
          tooltip.innerText = computeSelector(target);
          target.style.cursor = 'crosshair';
        };

        window.__clickHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const target = e.target;
          const selector = computeSelector(target);
          const data = {
            selector,
            tagName: target.tagName,
            text: target.innerText?.substring(0, 30) || ''
          };
          window.postMessage({ type: 'ELEMENT_PICKED', data }, '*');
        };

        document.addEventListener('mousemove', window.__mousemoveHandler, true);
        document.addEventListener('click', window.__clickHandler, true);
      })();
    `;
    await this.view.webContents.executeJavaScript(highlightScript);
    const emitScript = `
      window.addEventListener('message', (e) => {
        if(e.data && e.data.type === 'ELEMENT_PICKED') {
          console.log('__ZERO_CODE_PICKED__', JSON.stringify(e.data.data));
        }
      });
    `;
    await this.view.webContents.executeJavaScript(emitScript);
    this.view.webContents.on("console-message", (_event, _level, message, _line, _sourceId) => {
      if (message.startsWith("__ZERO_CODE_PICKED__")) {
        const json = message.replace("__ZERO_CODE_PICKED__ ", "");
        try {
          const data = JSON.parse(json);
          this.mainWindow.webContents.send(IPC.PICKER_ELEMENT_SELECTED, data);
          this.stopPicker();
        } catch (e) {
        }
      }
    });
  }
  async stopPicker() {
    if (!this.view) return;
    const cleanupScript = `
      (() => {
        window.__pickerActive = false;
        const overlay = document.getElementById('__zero_code_overlay');
        const tooltip = document.getElementById('__zero_code_tooltip');
        if (overlay) overlay.remove();
        if (tooltip) tooltip.remove();
        if (window.__mousemoveHandler) {
          document.removeEventListener('mousemove', window.__mousemoveHandler, true);
        }
        if (window.__clickHandler) {
          document.removeEventListener('click', window.__clickHandler, true);
        }
      })();
    `;
    await this.view.webContents.executeJavaScript(cleanupScript);
    this.view.webContents.removeAllListeners("console-message");
  }
  setupListeners() {
    if (!this.view) return;
    this.view.webContents.on("did-navigate", (_, url) => {
      this.mainWindow.webContents.send(IPC.BROWSER_NAVIGATED, { url });
    });
    this.view.webContents.on("did-navigate-in-page", (_, url) => {
      this.mainWindow.webContents.send(IPC.BROWSER_NAVIGATED, { url });
    });
  }
  goBack() {
    if (this.view?.webContents.canGoBack()) {
      this.view.webContents.goBack();
    }
  }
  goForward() {
    if (this.view?.webContents.canGoForward()) {
      this.view.webContents.goForward();
    }
  }
  reload() {
    this.view?.webContents.reload();
  }
}
class OllamaClient {
  mainWindow;
  constructor(mainWindow2) {
    this.mainWindow = mainWindow2;
  }
  async checkHealth() {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        return { status: "ok", models: data.models || [] };
      }
      return { status: "error", models: [] };
    } catch (e) {
      return { status: "error", models: [] };
    }
  }
  async listModels() {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        return data.models || [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }
  async generate(model, messages) {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          options: {
            temperature: 0.1,
            // Lower temperature for more deterministic, code-focused output
            num_ctx: 1e4
            // Optimize context window for average DOM parsing without lagging system
          }
        })
      });
      if (!response.ok) {
        throw new Error(`Ollama HTTP error! status: ${response.status}`);
      }
      if (!response.body) {
        throw new Error("No response body stream");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.trim() === "") continue;
            try {
              const data = JSON.parse(line);
              if (data.done) {
                this.mainWindow.webContents.send(IPC.OLLAMA_GENERATE_TOKEN, { token: "", done: true });
              } else {
                this.mainWindow.webContents.send(IPC.OLLAMA_GENERATE_TOKEN, { token: data.message?.content || "", done: false });
              }
            } catch (err) {
              console.error("Error parsing line:", err, line);
            }
          }
        }
      }
      if (buffer.trim() !== "") {
        try {
          const data = JSON.parse(buffer);
          if (data.done) {
            this.mainWindow.webContents.send(IPC.OLLAMA_GENERATE_TOKEN, { token: "", done: true });
          } else {
            this.mainWindow.webContents.send(IPC.OLLAMA_GENERATE_TOKEN, { token: data.message?.content || "", done: false });
          }
        } catch (err) {
        }
      }
      this.mainWindow.webContents.send(IPC.OLLAMA_GENERATE_TOKEN, { token: "", done: true });
    } catch (e) {
      console.error("Ollama generate error:", e);
      this.mainWindow.webContents.send(IPC.OLLAMA_GENERATE_ERROR, { error: e.message });
    }
  }
}
class EvidenceManager {
  static getEvidenceDir(sessionId) {
    const baseDir = path.join(app.getPath("userData"), "zero-code-evidence");
    const sessionDir = path.join(baseDir, sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    return sessionDir;
  }
  static saveErrorLog(sessionId, logData) {
    const sessionDir = this.getEvidenceDir(sessionId);
    const logPath = path.join(sessionDir, `session-${sessionId}.json`);
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
  }
  static async openFolder(folderPath) {
    await shell.openPath(folderPath);
  }
}
let currentTestProcess = null;
let currentTempFile = null;
async function runPlaywrightTest(mainWindow2, code, url, _steps, sessionId) {
  abortPlaywrightTest();
  const evidenceDir = EvidenceManager.getEvidenceDir(sessionId);
  const bodyMatch = code.match(/test\([^,]+,\s*async\s*\(\{\s*page\s*\}\)\s*=>\s*\{([\s\S]*?)\}\);/);
  let innerCode = bodyMatch ? bodyMatch[1] : code;
  innerCode = innerCode.replace(/const\s+\{.*\}\s*=\s*require\([^)]+\);/g, "");
  innerCode = innerCode.replace(/import\s+.*from\s+.*;/g, "");
  let stepIdCounter = 0;
  innerCode = innerCode.replace(/(await\s+(?:page|expect)[^;]+;?)/g, (match) => {
    const logStr = `
    console.log('STEP_RESULT:', JSON.stringify({ stepIndex: ${stepIdCounter}, status: 'passed' }));`;
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
    const browser = await chromium.connectOverCDP('http://localhost:9222');
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
        const errorScreenshotUrl = path.join('${evidenceDir.replace(/\\/g, "\\\\")}', \`step-CURRENT-\${Date.now()}.png\`);
        await page.screenshot({ path: errorScreenshotUrl });
        console.log('STEP_RESULT:', JSON.stringify({ stepIndex: 'CURRENT', status: 'failed', error: error.message, screenshotPath: errorScreenshotUrl }));
    } finally {
        await browser.close();
    }
})();
`;
  currentTempFile = path.join(process.cwd(), `zerocode-test-run-${Date.now()}.mjs`);
  fs.writeFileSync(currentTempFile, standaloneCode);
  currentTestProcess = spawn("node", [currentTempFile]);
  let clientStepIndex = 1;
  currentTestProcess.stdout?.on("data", (data) => {
    const lines = data.toString().split("\n");
    for (const line of lines) {
      if (line.includes("STEP_RESULT:")) {
        try {
          const jsonStr = line.split("STEP_RESULT: ")[1];
          const result = JSON.parse(jsonStr);
          if (result.status === "failed") {
            mainWindow2.webContents.send(IPC.TEST_STEP_RESULT, {
              stepIndex: clientStepIndex,
              status: "failed",
              error: result.error,
              screenshotPath: result.screenshotPath
            });
            mainWindow2.webContents.send(IPC.TEST_COMPLETE, { success: false, totalPassed: clientStepIndex });
          } else if (result.status === "passed") {
            mainWindow2.webContents.send(IPC.TEST_STEP_RESULT, {
              stepIndex: clientStepIndex,
              status: "passed"
            });
            clientStepIndex++;
          }
        } catch (e) {
          console.error("Failed to parse step result JSON:", e);
        }
      } else if (line.includes("TEST_COMPLETE:")) {
        mainWindow2.webContents.send(IPC.TEST_COMPLETE, { success: true, totalPassed: clientStepIndex });
      }
    }
  });
  currentTestProcess.stderr?.on("data", (data) => {
    console.error(`Playwright Error: ${data}`);
  });
  currentTestProcess.on("close", (code2) => {
    if (code2 !== 0) {
      console.log(`Test exited with code ${code2}`);
    }
    cleanup();
  });
}
function abortPlaywrightTest() {
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
function registerIpcHandlers(_mainWindow, browserViewController2, ollamaClient2) {
  ipcMain.handle(IPC.BROWSER_MOUNT, async (_, bounds) => {
    browserViewController2.mount(bounds);
  });
  ipcMain.handle(IPC.BROWSER_RESIZE, async (_, bounds) => {
    browserViewController2.setBounds(bounds);
  });
  ipcMain.handle(IPC.BROWSER_NAVIGATE, async (_, { url }) => {
    return await browserViewController2.navigate(url);
  });
  ipcMain.handle(IPC.BROWSER_GET_URL, async () => {
    return await browserViewController2.getUrl();
  });
  ipcMain.handle(IPC.BROWSER_GO_BACK, () => {
    browserViewController2.goBack();
  });
  ipcMain.handle(IPC.BROWSER_GO_FORWARD, () => {
    browserViewController2.goForward();
  });
  ipcMain.handle(IPC.BROWSER_RELOAD, () => {
    browserViewController2.reload();
  });
  ipcMain.handle(IPC.DOM_SCRAPE, async () => {
    return await browserViewController2.scrapeDOM();
  });
  ipcMain.handle(IPC.PICKER_START, async () => {
    await browserViewController2.startPicker();
  });
  ipcMain.handle(IPC.PICKER_STOP, async () => {
    await browserViewController2.stopPicker();
  });
  ipcMain.handle(IPC.OLLAMA_HEALTH, async () => {
    return await ollamaClient2.checkHealth();
  });
  ipcMain.handle(IPC.OLLAMA_LIST_MODELS, async () => {
    return await ollamaClient2.listModels();
  });
  ipcMain.handle(IPC.OLLAMA_GENERATE, async (_, { model, messages }) => {
    ollamaClient2.generate(model, messages);
    return { success: true };
  });
  ipcMain.handle(IPC.TEST_START, async (_, { code, url, steps, sessionId }) => {
    runPlaywrightTest(_mainWindow, code, url, steps, sessionId);
  });
  ipcMain.handle(IPC.TEST_ABORT, async () => {
    abortPlaywrightTest();
  });
  ipcMain.handle(IPC.EVIDENCE_OPEN_FOLDER, async (_, { folderPath }) => {
    await EvidenceManager.openFolder(folderPath);
  });
}
const __dirname$1 = path$1.dirname(fileURLToPath(import.meta.url));
let mainWindow = null;
let browserViewController = null;
let ollamaClient = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    frame: true,
    show: false,
    // Don't show until ready
    backgroundColor: "#000000",
    // Set dark background
    webPreferences: {
      preload: path$1.join(__dirname$1, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path$1.join(__dirname$1, "../dist/index.html"));
  }
  mainWindow.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    if (level >= 2) {
      console.error(`[Renderer Console] ${message} at ${sourceId}:${line}`);
    }
  });
  browserViewController = new BrowserViewController(mainWindow);
  browserViewController.init();
  ollamaClient = new OllamaClient(mainWindow);
  registerIpcHandlers(mainWindow, browserViewController, ollamaClient);
}
app.commandLine.appendSwitch("remote-debugging-port", "9222");
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

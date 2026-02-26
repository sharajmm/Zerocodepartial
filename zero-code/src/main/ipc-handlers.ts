import { BrowserWindow, ipcMain, dialog } from 'electron';
import { IPC } from '../shared/constants';
import { BrowserViewController } from './browser-view';
import { OllamaClient } from './ollama-client';
import { runPlaywrightTest, abortPlaywrightTest } from './playwright-engine';
import { EvidenceManager } from './evidence-manager';
import { generateReport } from './report-generator';
import { hostRoom, stopRoom } from './websocket-server';
import fs from 'fs';
import path from 'path';

export function registerIpcHandlers(_mainWindow: BrowserWindow, browserViewController: BrowserViewController, ollamaClient: OllamaClient) {

    ipcMain.handle(IPC.BROWSER_MOUNT, async (_, bounds) => {
        browserViewController.mount(bounds);
    });

    ipcMain.handle(IPC.BROWSER_RESIZE, async (_, bounds) => {
        browserViewController.setBounds(bounds);
    });

    ipcMain.handle(IPC.BROWSER_NAVIGATE, async (_, { url }) => {
        return await browserViewController.navigate(url);
    });

    ipcMain.handle(IPC.BROWSER_GET_URL, async () => {
        return await browserViewController.getUrl();
    });

    ipcMain.handle(IPC.BROWSER_CAPTURE, async () => {
        return await browserViewController.capturePage();
    });

    ipcMain.handle(IPC.BROWSER_GO_BACK, () => {
        browserViewController.goBack();
    });

    ipcMain.handle(IPC.BROWSER_GO_FORWARD, () => {
        browserViewController.goForward();
    });

    ipcMain.handle(IPC.BROWSER_RELOAD, () => {
        browserViewController.reload();
    });

    ipcMain.handle(IPC.BROWSER_GO_HOME, () => {
        browserViewController.goHome();
    });

    ipcMain.handle(IPC.DOM_SCRAPE, async () => {
        return await browserViewController.scrapeDOM();
    });

    ipcMain.handle(IPC.PICKER_START, async () => {
        await browserViewController.startPicker();
    });

    ipcMain.handle(IPC.PICKER_STOP, async () => {
        await browserViewController.stopPicker();
    });

    // Ollama endpoints
    ipcMain.handle(IPC.OLLAMA_HEALTH, async () => {
        return await ollamaClient.checkHealth();
    });

    ipcMain.handle(IPC.OLLAMA_LIST_MODELS, async () => {
        return await ollamaClient.listModels();
    });

    ipcMain.handle(IPC.OLLAMA_GENERATE, async (_, { model, messages }) => {
        // Doesn't return directly, streams back via event
        ollamaClient.generate(model, messages);
        return { success: true };
    });

    // Test execution
    ipcMain.handle(IPC.TEST_START, async (_, { code, url, steps, sessionId }) => {
        runPlaywrightTest(_mainWindow, code, url, steps, sessionId);
    });

    ipcMain.handle(IPC.TEST_ABORT, async () => {
        abortPlaywrightTest();
    });

    ipcMain.handle(IPC.EVIDENCE_OPEN_FOLDER, async (_, { folderPath }) => {
        await EvidenceManager.openFolder(folderPath);
    });

    ipcMain.handle(IPC.REPORT_GENERATE, async (_, session) => {
        try {
            const activeFolder = session.activeFolder || null;
            EvidenceManager.writeSessionLog(session.sessionId, session, activeFolder);
            const pdfPath = await generateReport(session, activeFolder);
            return { pdfPath };
        } catch (error) {
            console.error('Failed to generate report:', error);
            throw error;
        }
    });

    ipcMain.handle(IPC.REPORT_EXPORT, async (_, { pdfPath }) => {
        if (!fs.existsSync(pdfPath)) return { savedTo: null };

        const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'Export Test Report',
            defaultPath: `ZeroCode-Report-${Date.now()}.pdf`,
            filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
        });

        if (!canceled && filePath) {
            fs.copyFileSync(pdfPath, filePath);
            return { savedTo: filePath };
        }
        return { savedTo: null };
    });

    // Local Collaboration WS Server
    ipcMain.handle(IPC.ROOM_HOST, async () => {
        return await hostRoom();
    });

    ipcMain.handle(IPC.ROOM_STOP, () => {
        stopRoom();
    });

    // History endpoints
    const HISTORY_DIR = path.join('C:', 'zerocode', 'history');

    ipcMain.handle(IPC.HISTORY_SAVE, async (_, messages) => {
        try {
            if (!fs.existsSync(HISTORY_DIR)) {
                fs.mkdirSync(HISTORY_DIR, { recursive: true });
            }
            // Always overwrite current active session
            fs.writeFileSync(path.join(HISTORY_DIR, 'chat-history.json'), JSON.stringify(messages, null, 2));

            // Also save/update the active session envelope
            if (messages && messages.length > 0) {
                const firstUserMsg = messages.find((m: any) => m.role === 'user');
                const excerpt = firstUserMsg ? firstUserMsg.content.substring(0, 50) : 'Session';
                const sessionData = {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    excerpt,
                    messages
                };
                fs.writeFileSync(path.join(HISTORY_DIR, 'session-active.json'), JSON.stringify(sessionData, null, 2));
            }
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    });

    ipcMain.handle(IPC.HISTORY_LOAD, async (_, sessionFile?: string) => {
        try {
            const filePath = sessionFile || path.join(HISTORY_DIR, 'chat-history.json');
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                const parsed = JSON.parse(data);
                // If it's a session envelope { id, date, excerpt, messages }, return messages
                if (parsed.messages && Array.isArray(parsed.messages)) return parsed.messages;
                // If it's a raw messages array
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
        return [];
    });

    ipcMain.handle(IPC.HISTORY_LIST, async () => {
        try {
            if (!fs.existsSync(HISTORY_DIR)) return [];

            const files = fs.readdirSync(HISTORY_DIR)
                .filter((f: string) => f.startsWith('session-') && f.endsWith('.json'));

            const sessions: { id: string; date: string; excerpt: string; filePath: string }[] = [];

            for (const file of files) {
                try {
                    const filePath = path.join(HISTORY_DIR, file);
                    const raw = fs.readFileSync(filePath, 'utf8');
                    const data = JSON.parse(raw);
                    sessions.push({
                        id: data.id || file,
                        date: data.date || '',
                        excerpt: data.excerpt || 'Session',
                        filePath
                    });
                } catch {
                    // skip corrupt files
                }
            }

            sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return sessions;
        } catch (error) {
            console.error('Failed to list history:', error);
            return [];
        }
    });

    // Workspace handlers
    ipcMain.handle(IPC.WORKSPACE_OPEN_FOLDER, async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog(_mainWindow, {
            title: 'Open Workspace Folder',
            properties: ['openDirectory', 'createDirectory']
        });
        if (canceled || filePaths.length === 0) return null;
        return filePaths[0];
    });

    ipcMain.handle(IPC.WORKSPACE_READ_FILE, async (_, filePath: string) => {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            console.error('Failed to read file:', error);
            return '';
        }
    });

    ipcMain.handle(IPC.WORKSPACE_SAVE_FILE, async (_, { filePath, content }: { filePath: string; content: string }) => {
        try {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(filePath, content, 'utf8');
        } catch (error) {
            console.error('Failed to save file:', error);
        }
    });

    ipcMain.handle(IPC.WORKSPACE_UPLOAD_RTM, async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog(_mainWindow, {
            title: 'Upload RTM Document',
            filters: [
                { name: 'Documents', extensions: ['txt', 'csv', 'md', 'json'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            properties: ['openFile']
        });
        if (canceled || filePaths.length === 0) return null;
        try {
            const content = fs.readFileSync(filePaths[0], 'utf8');
            const fileName = path.basename(filePaths[0]);
            return { fileName, content };
        } catch (error) {
            console.error('Failed to read RTM file:', error);
            return null;
        }
    });
}
import { BrowserWindow, ipcMain, dialog } from 'electron';
import { IPC } from '../shared/constants';
import { BrowserViewController } from './browser-view';
import { OllamaClient } from './ollama-client';
import { runPlaywrightTest, abortPlaywrightTest } from './playwright-engine';
import { EvidenceManager } from './evidence-manager';
import { generateReport } from './report-generator';
import { hostRoom, stopRoom } from './websocket-server';
import fs from 'fs';

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
            EvidenceManager.writeSessionLog(session.sessionId, session);
            const pdfPath = await generateReport(session);
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
    ipcMain.handle(IPC.HISTORY_SAVE, async (_, messages) => {
        try {
            const historyDir = 'C:\\zerocode\\history';
            if (!fs.existsSync(historyDir)) {
                fs.mkdirSync(historyDir, { recursive: true });
            }
            fs.writeFileSync(`${historyDir}\\chat-history.json`, JSON.stringify(messages, null, 2));
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    });

    ipcMain.handle(IPC.HISTORY_LOAD, async () => {
        try {
            const historyFile = 'C:\\zerocode\\history\\chat-history.json';
            if (fs.existsSync(historyFile)) {
                const data = fs.readFileSync(historyFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
        return [];
    });
}
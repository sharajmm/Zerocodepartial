import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BrowserViewController } from './browser-view';
import { OllamaClient } from './ollama-client';
import { registerIpcHandlers } from './ipc-handlers';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;
let browserViewController: BrowserViewController | null = null;
let ollamaClient: OllamaClient | null = null;

function createWindow() {
    // Hide initially to prevent white flash
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        frame: true,
        show: false, // Don't show until ready
        backgroundColor: '#000000', // Set dark background
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
        if (level >= 2) {
            console.error(`[Renderer Console] ${message} at ${sourceId}:${line}`);
        }
    });

    browserViewController = new BrowserViewController(mainWindow);
    browserViewController.init();
    ollamaClient = new OllamaClient(mainWindow);
    registerIpcHandlers(mainWindow, browserViewController, ollamaClient);
}

app.commandLine.appendSwitch('remote-debugging-port', '9222');

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

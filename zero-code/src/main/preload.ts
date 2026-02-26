import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/constants';

contextBridge.exposeInMainWorld('electronAPI', {
    // Browser
    browserMount: (bounds: any) => ipcRenderer.invoke(IPC.BROWSER_MOUNT, bounds),
    browserResize: (bounds: any) => ipcRenderer.invoke(IPC.BROWSER_RESIZE, bounds),
    browserNavigate: (url: string) => ipcRenderer.invoke(IPC.BROWSER_NAVIGATE, { url }),
    browserGetUrl: () => ipcRenderer.invoke(IPC.BROWSER_GET_URL),
    browserCapture: () => ipcRenderer.invoke(IPC.BROWSER_CAPTURE),
    browserGoBack: () => ipcRenderer.invoke(IPC.BROWSER_GO_BACK),
    browserGoForward: () => ipcRenderer.invoke(IPC.BROWSER_GO_FORWARD),
    browserReload: () => ipcRenderer.invoke(IPC.BROWSER_RELOAD),
    browserGoHome: () => ipcRenderer.invoke(IPC.BROWSER_GO_HOME),

    onBrowserNavigated: (cb: (data: any) => void) => {
        ipcRenderer.on(IPC.BROWSER_NAVIGATED, (_, data) => cb(data));
    },

    // History
    historySave: (messages: any[]) => ipcRenderer.invoke(IPC.HISTORY_SAVE, messages),
    historyLoad: () => ipcRenderer.invoke(IPC.HISTORY_LOAD),

    // DOM
    domScrape: () => ipcRenderer.invoke(IPC.DOM_SCRAPE),

    // Picker
    pickerStart: () => ipcRenderer.invoke(IPC.PICKER_START),
    pickerStop: () => ipcRenderer.invoke(IPC.PICKER_STOP),
    onPickerElement: (cb: (data: any) => void) => {
        ipcRenderer.on(IPC.PICKER_ELEMENT_SELECTED, (_, data) => cb(data));
    },

    // Ollama
    ollamaHealth: () => ipcRenderer.invoke(IPC.OLLAMA_HEALTH),
    ollamaListModels: () => ipcRenderer.invoke(IPC.OLLAMA_LIST_MODELS),
    ollamaGenerate: (model: string, messages: any[]) => ipcRenderer.invoke(IPC.OLLAMA_GENERATE, { model, messages }),
    onOllamaToken: (cb: (data: { token: string; done: boolean }) => void) => {
        ipcRenderer.on(IPC.OLLAMA_GENERATE_TOKEN, (_, data) => cb(data));
    },
    onOllamaError: (cb: (data: { error: string }) => void) => {
        ipcRenderer.on(IPC.OLLAMA_GENERATE_ERROR, (_, data) => cb(data));
    },

    // Test Execution
    // Test Execution
    testStart: (payload: { code: string; url: string; steps: any[]; sessionId: string }) =>
        ipcRenderer.invoke(IPC.TEST_START, payload),
    testAbort: () => ipcRenderer.invoke(IPC.TEST_ABORT),
    onTestStepResult: (cb: (data: any) => void) => {
        ipcRenderer.on(IPC.TEST_STEP_RESULT, (_, data) => cb(data));
    },
    onTestComplete: (cb: (data: any) => void) => {
        ipcRenderer.on(IPC.TEST_COMPLETE, (_, data) => cb(data));
    },
    evidenceOpenFolder: (folderPath: string) => ipcRenderer.invoke(IPC.EVIDENCE_OPEN_FOLDER, { folderPath }),

    // Report
    reportGenerate: (session: any) => ipcRenderer.invoke(IPC.REPORT_GENERATE, session),
    reportExport: (pdfPath: string) => ipcRenderer.invoke(IPC.REPORT_EXPORT, { pdfPath }),

    // Local Collab
    roomHost: () => ipcRenderer.invoke(IPC.ROOM_HOST),
    roomStop: () => ipcRenderer.invoke(IPC.ROOM_STOP),

    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    }
});

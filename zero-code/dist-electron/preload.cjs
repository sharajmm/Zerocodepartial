"use strict";
const electron = require("electron");
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
  BROWSER_GO_HOME: "browser:go-home",
  BROWSER_MOUNT: "browser:mount",
  BROWSER_RESIZE: "browser:resize",
  BROWSER_NAVIGATED: "browser:navigated",
  // emitted when URL changes
  BROWSER_CAPTURE: "browser:capture",
  TEST_START: "test:start",
  TEST_STEP_RESULT: "test:step-result",
  TEST_COMPLETE: "test:complete",
  TEST_ABORT: "test:abort",
  REPORT_GENERATE: "report:generate",
  REPORT_EXPORT: "report:export",
  EVIDENCE_OPEN_FOLDER: "evidence:open-folder",
  PICKER_START: "picker:start",
  PICKER_STOP: "picker:stop",
  PICKER_ELEMENT_SELECTED: "picker:element-selected",
  ROOM_HOST: "room:host",
  ROOM_STOP: "room:stop",
  HISTORY_SAVE: "history:save",
  HISTORY_LOAD: "history:load"
};
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Browser
  browserMount: (bounds) => electron.ipcRenderer.invoke(IPC.BROWSER_MOUNT, bounds),
  browserResize: (bounds) => electron.ipcRenderer.invoke(IPC.BROWSER_RESIZE, bounds),
  browserNavigate: (url) => electron.ipcRenderer.invoke(IPC.BROWSER_NAVIGATE, { url }),
  browserGetUrl: () => electron.ipcRenderer.invoke(IPC.BROWSER_GET_URL),
  browserCapture: () => electron.ipcRenderer.invoke(IPC.BROWSER_CAPTURE),
  browserGoBack: () => electron.ipcRenderer.invoke(IPC.BROWSER_GO_BACK),
  browserGoForward: () => electron.ipcRenderer.invoke(IPC.BROWSER_GO_FORWARD),
  browserReload: () => electron.ipcRenderer.invoke(IPC.BROWSER_RELOAD),
  browserGoHome: () => electron.ipcRenderer.invoke(IPC.BROWSER_GO_HOME),
  onBrowserNavigated: (cb) => {
    electron.ipcRenderer.on(IPC.BROWSER_NAVIGATED, (_, data) => cb(data));
  },
  // History
  historySave: (messages) => electron.ipcRenderer.invoke(IPC.HISTORY_SAVE, messages),
  historyLoad: () => electron.ipcRenderer.invoke(IPC.HISTORY_LOAD),
  // DOM
  domScrape: () => electron.ipcRenderer.invoke(IPC.DOM_SCRAPE),
  // Picker
  pickerStart: () => electron.ipcRenderer.invoke(IPC.PICKER_START),
  pickerStop: () => electron.ipcRenderer.invoke(IPC.PICKER_STOP),
  onPickerElement: (cb) => {
    electron.ipcRenderer.on(IPC.PICKER_ELEMENT_SELECTED, (_, data) => cb(data));
  },
  // Ollama
  ollamaHealth: () => electron.ipcRenderer.invoke(IPC.OLLAMA_HEALTH),
  ollamaListModels: () => electron.ipcRenderer.invoke(IPC.OLLAMA_LIST_MODELS),
  ollamaGenerate: (model, messages) => electron.ipcRenderer.invoke(IPC.OLLAMA_GENERATE, { model, messages }),
  onOllamaToken: (cb) => {
    electron.ipcRenderer.on(IPC.OLLAMA_GENERATE_TOKEN, (_, data) => cb(data));
  },
  onOllamaError: (cb) => {
    electron.ipcRenderer.on(IPC.OLLAMA_GENERATE_ERROR, (_, data) => cb(data));
  },
  // Test Execution
  // Test Execution
  testStart: (payload) => electron.ipcRenderer.invoke(IPC.TEST_START, payload),
  testAbort: () => electron.ipcRenderer.invoke(IPC.TEST_ABORT),
  onTestStepResult: (cb) => {
    electron.ipcRenderer.on(IPC.TEST_STEP_RESULT, (_, data) => cb(data));
  },
  onTestComplete: (cb) => {
    electron.ipcRenderer.on(IPC.TEST_COMPLETE, (_, data) => cb(data));
  },
  evidenceOpenFolder: (folderPath) => electron.ipcRenderer.invoke(IPC.EVIDENCE_OPEN_FOLDER, { folderPath }),
  // Report
  reportGenerate: (session) => electron.ipcRenderer.invoke(IPC.REPORT_GENERATE, session),
  reportExport: (pdfPath) => electron.ipcRenderer.invoke(IPC.REPORT_EXPORT, { pdfPath }),
  // Local Collab
  roomHost: () => electron.ipcRenderer.invoke(IPC.ROOM_HOST),
  roomStop: () => electron.ipcRenderer.invoke(IPC.ROOM_STOP),
  removeAllListeners: (channel) => {
    electron.ipcRenderer.removeAllListeners(channel);
  }
});

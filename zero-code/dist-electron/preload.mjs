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
  BROWSER_MOUNT: "browser:mount",
  BROWSER_RESIZE: "browser:resize",
  BROWSER_NAVIGATED: "browser:navigated",
  // emitted when URL changes
  TEST_START: "test:start",
  TEST_STEP_RESULT: "test:step-result",
  TEST_COMPLETE: "test:complete",
  TEST_ABORT: "test:abort",
  EVIDENCE_OPEN_FOLDER: "evidence:open-folder",
  PICKER_START: "picker:start",
  PICKER_STOP: "picker:stop",
  PICKER_ELEMENT_SELECTED: "picker:element-selected"
};
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Browser
  browserMount: (bounds) => electron.ipcRenderer.invoke(IPC.BROWSER_MOUNT, bounds),
  browserResize: (bounds) => electron.ipcRenderer.invoke(IPC.BROWSER_RESIZE, bounds),
  browserNavigate: (url) => electron.ipcRenderer.invoke(IPC.BROWSER_NAVIGATE, { url }),
  browserGetUrl: () => electron.ipcRenderer.invoke(IPC.BROWSER_GET_URL),
  browserGoBack: () => electron.ipcRenderer.invoke(IPC.BROWSER_GO_BACK),
  browserGoForward: () => electron.ipcRenderer.invoke(IPC.BROWSER_GO_FORWARD),
  browserReload: () => electron.ipcRenderer.invoke(IPC.BROWSER_RELOAD),
  onBrowserNavigated: (cb) => {
    electron.ipcRenderer.on(IPC.BROWSER_NAVIGATED, (_, data) => cb(data));
  },
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
  removeAllListeners: (channel) => {
    electron.ipcRenderer.removeAllListeners(channel);
  }
});

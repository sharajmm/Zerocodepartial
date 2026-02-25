export const IPC = {
    OLLAMA_HEALTH: 'ollama:health',
    OLLAMA_LIST_MODELS: 'ollama:list-models',
    OLLAMA_GENERATE: 'ollama:generate',
    OLLAMA_GENERATE_TOKEN: 'ollama:generate:token',
    OLLAMA_GENERATE_ERROR: 'ollama:generate:error',
    DOM_SCRAPE: 'dom:scrape',
    BROWSER_NAVIGATE: 'browser:navigate',
    BROWSER_GET_URL: 'browser:get-url',
    BROWSER_GO_BACK: 'browser:go-back',
    BROWSER_GO_FORWARD: 'browser:go-forward',
    BROWSER_RELOAD: 'browser:reload',
    BROWSER_MOUNT: 'browser:mount',
    BROWSER_RESIZE: 'browser:resize',
    BROWSER_NAVIGATED: 'browser:navigated', // emitted when URL changes
    TEST_START: 'test:start',
    TEST_STEP_RESULT: 'test:step-result',
    TEST_COMPLETE: 'test:complete',
    TEST_ABORT: 'test:abort',
    REPORT_GENERATE: 'report:generate',
    REPORT_EXPORT: 'report:export',
    EVIDENCE_OPEN_FOLDER: 'evidence:open-folder',
    PICKER_START: 'picker:start',
    PICKER_STOP: 'picker:stop',
    PICKER_ELEMENT_SELECTED: 'picker:element-selected',
} as const;

export const DEFAULT_MODEL = 'qwen2.5-coder:7b';
export const OLLAMA_BASE_URL = 'http://localhost:11434';
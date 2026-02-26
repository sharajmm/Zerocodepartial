import type { DOMElement } from '../types/dom';
import type { TestSession } from '../types/test';

export interface ElectronAPI {
    // Browser
    browserMount: (bounds: { x: number; y: number; width: number; height: number }) => Promise<void>;
    browserResize: (bounds: { x: number; y: number; width: number; height: number }) => Promise<void>;
    browserNavigate: (url: string) => Promise<{ success: boolean; url: string }>;
    browserGetUrl: () => Promise<{ url: string }>;
    browserCapture: () => Promise<string | null>;
    browserGoBack: () => Promise<void>;
    browserGoForward: () => Promise<void>;
    browserReload: () => Promise<void>;
    browserGoHome: () => Promise<void>;
    onBrowserNavigated: (cb: (data: { url: string }) => void) => void;

    // History
    historySave: (messages: any[]) => Promise<void>;
    historyLoad: () => Promise<any[]>;

    // DOM
    domScrape: () => Promise<{ elements: DOMElement[] }>;

    // Picker
    pickerStart: () => Promise<void>;
    pickerStop: () => Promise<void>;
    onPickerElement: (cb: (data: { selector: string; tagName: string; text: string }) => void) => void;

    // Ollama
    ollamaHealth: () => Promise<{ status: string; models: any[] }>;
    ollamaListModels: () => Promise<any[]>;
    ollamaGenerate: (model: string, messages: any[]) => Promise<{ success: boolean }>;
    onOllamaToken: (cb: (data: { token: string; done: boolean }) => void) => void;
    onOllamaError: (cb: (data: { error: string }) => void) => void;

    // Test Execution
    testStart: (payload: { code: string; url: string; steps: any[]; sessionId: string }) => Promise<void>;
    testAbort: () => Promise<void>;
    onTestStepResult: (cb: (data: { stepIndex: number | 'CURRENT'; status: 'passed' | 'failed'; error?: string; screenshotPath?: string }) => void) => void;
    onTestComplete: (cb: (data: { success: boolean; totalPassed: number }) => void) => void;
    evidenceOpenFolder: (folderPath: string) => Promise<void>;

    // Report
    reportGenerate: (session: TestSession) => Promise<{ pdfPath: string }>;
    reportExport: (pdfPath: string) => Promise<{ savedTo: string | null }>;

    // Collab
    roomHost: () => Promise<string>;
    roomStop: () => Promise<void>;

    // Clean up listeners
    removeAllListeners: (channel: string) => void;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
export interface TestSession {
    sessionId: string;
    url: string;
    description: string;
    date: string;
    steps: {
        index: number;
        label: string;
        type: 'action' | 'assertion';
        status: 'passed' | 'failed' | 'pending';
        error?: string;
        screenshotPath?: string;
    }[];
    code: string;
    totalPassed: number;
    totalFailed: number;
}
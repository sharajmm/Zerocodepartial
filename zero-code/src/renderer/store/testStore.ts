import { create } from 'zustand';
import type { FlowchartNode, FlowchartEdge } from '../types/flowchart';

export interface TestState {
    rawAiResponse: string;
    hasFlowchart: boolean;
    nodes: FlowchartNode[];
    edges: FlowchartEdge[];
    code: string;
    activeView: 'flowchart' | 'code';
    stepStatuses: Record<string, 'pending' | 'running' | 'passed' | 'failed'>;
    screenshotPaths: Record<string, string>;
    isRunning: boolean;
    sessionId: string;

    setRawAiResponse: (res: string) => void;
    setHasFlowchart: (has: boolean) => void;
    setTestData: (nodes: FlowchartNode[], edges: FlowchartEdge[], code: string) => void;
    setStepStatus: (nodeId: string, status: 'pending' | 'running' | 'passed' | 'failed', screenshotPath?: string) => void;
    setActiveView: (view: 'flowchart' | 'code') => void;
    setIsRunning: (isRunning: boolean) => void;
    resetStepStatuses: () => void;
}

export const useTestStore = create<TestState>((set) => ({
    rawAiResponse: '',
    hasFlowchart: false,
    nodes: [],
    edges: [],
    code: '',
    activeView: 'flowchart',
    stepStatuses: {},
    screenshotPaths: {},
    isRunning: false,
    sessionId: '',

    setRawAiResponse: (res) => set({ rawAiResponse: res, hasFlowchart: res.length > 0 }),
    setHasFlowchart: (has) => set({ hasFlowchart: has }),
    setTestData: (nodes, edges, code) => set({
        nodes, edges, code, hasFlowchart: true, activeView: 'flowchart', stepStatuses: {}, screenshotPaths: {}, isRunning: false, sessionId: ''
    }),
    setStepStatus: (nodeId, status, screenshotPath) => set((state) => {
        const newStatuses = { ...state.stepStatuses, [nodeId]: status };
        let newPaths = state.screenshotPaths;
        if (screenshotPath) {
            newPaths = { ...state.screenshotPaths, [nodeId]: screenshotPath };
        }
        return { stepStatuses: newStatuses, screenshotPaths: newPaths };
    }),
    setActiveView: (view) => set({ activeView: view }),
    setIsRunning: (isRunning) => set({ isRunning: isRunning }),
    resetStepStatuses: () => set((state) => {
        const resetStatuses: Record<string, 'pending'> = {};
        state.nodes.forEach(n => resetStatuses[n.id] = 'pending');
        return { stepStatuses: resetStatuses, screenshotPaths: {} };
    })
}));
import { create } from 'zustand';

export interface RTMTask {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    codeFile?: string;
}

interface WorkspaceState {
    activeFolder: string | null;
    rtmTasks: RTMTask[];
    rtmFileName: string | null;
    setActiveFolder: (folder: string | null) => void;
    setRtmTasks: (tasks: RTMTask[]) => void;
    setRtmFileName: (name: string | null) => void;
    updateTaskStatus: (taskId: string, status: RTMTask['status'], codeFile?: string) => void;
    clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    activeFolder: null,
    rtmTasks: [],
    rtmFileName: null,

    setActiveFolder: (folder) => set({ activeFolder: folder }),
    setRtmTasks: (tasks) => set({ rtmTasks: tasks }),
    setRtmFileName: (name) => set({ rtmFileName: name }),
    updateTaskStatus: (taskId, status, codeFile) => set((state) => ({
        rtmTasks: state.rtmTasks.map((t) =>
            t.id === taskId ? { ...t, status, codeFile: codeFile || t.codeFile } : t
        ),
    })),
    clearWorkspace: () => set({ activeFolder: null, rtmTasks: [], rtmFileName: null }),
}));

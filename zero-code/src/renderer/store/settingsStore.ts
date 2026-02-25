import { create } from 'zustand';
import { DEFAULT_MODEL } from '../../shared/constants';

interface SettingsState {
    selectedModel: string;
    ollamaStatus: 'ok' | 'error' | 'checking';
    installedModels: string[];

    setSelectedModel: (model: string) => void;
    setOllamaStatus: (status: 'ok' | 'error' | 'checking') => void;
    setInstalledModels: (models: string[]) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    selectedModel: DEFAULT_MODEL,
    ollamaStatus: 'checking',
    installedModels: [],

    setSelectedModel: (model) => set({ selectedModel: model }),
    setOllamaStatus: (status) => set({ ollamaStatus: status }),
    setInstalledModels: (models) => set({ installedModels: models }),
}));
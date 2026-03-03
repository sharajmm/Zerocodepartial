import { useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { ChevronDown, RefreshCw } from 'lucide-react';

export default function ModelSwitcher() {
    const { selectedModel, setSelectedModel, installedModels, setInstalledModels } = useSettingsStore();

    const fetchModels = async () => {
        const modelsInfo = await window.electronAPI.ollamaListModels();
        setInstalledModels(modelsInfo.map((m: any) => m.name));
    };

    useEffect(() => { fetchModels(); }, []);

    return (
        <div className="flex items-center gap-1">
            <div className="relative">
                <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-transparent text-text-muted text-[9px] focus:outline-none appearance-none cursor-pointer pr-3 font-mono max-w-[100px] truncate hover:text-text-secondary transition-colors"
                >
                    {installedModels.length === 0 ? (
                        <option value={selectedModel}>{selectedModel}</option>
                    ) : (
                        installedModels.map((model) => (
                            <option key={model} value={model} className="bg-surface text-text-primary">
                                {model}
                            </option>
                        ))
                    )}
                </select>
                <ChevronDown size={7} className="absolute right-0 top-1/2 -translate-y-1/2 text-text-muted/40 pointer-events-none" />
            </div>
            <button onClick={fetchModels} className="p-0.5 text-text-muted/40 hover:text-text-muted rounded transition-colors" title="Refresh">
                <RefreshCw size={7} />
            </button>
        </div>
    );
}
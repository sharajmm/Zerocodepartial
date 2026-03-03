import { useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { ChevronDown, RefreshCw } from 'lucide-react';

export default function ModelSwitcher() {
    const { selectedModel, setSelectedModel, installedModels, setInstalledModels } = useSettingsStore();

    const fetchModels = async () => {
        const modelsInfo = await window.electronAPI.ollamaListModels();
        setInstalledModels(modelsInfo.map((m: any) => m.name));
    };

    useEffect(() => {
        fetchModels();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex items-center gap-1.5 h-full">
            <div className="relative">
                <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-transparent text-text-secondary text-[10px] focus:outline-none appearance-none cursor-pointer pr-4 font-mono max-w-[120px] truncate hover:text-text-primary transition-colors"
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
                <ChevronDown size={9} className="absolute right-0 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
            <button
                onClick={fetchModels}
                className="p-0.5 text-text-muted hover:text-text-secondary rounded transition-colors"
                title="Refresh"
            >
                <RefreshCw size={9} />
            </button>
        </div>
    );
}
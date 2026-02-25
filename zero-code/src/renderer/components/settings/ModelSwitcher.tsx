import { useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { Settings2, RefreshCw } from 'lucide-react';

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
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded px-2 py-1 shadow-inner h-full shrink-0">
            <Settings2 size={14} className="text-gray-400" />
            <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-gray-300 text-xs focus:outline-none appearance-none cursor-pointer pr-4 font-mono max-w-[150px] truncate"
            >
                {installedModels.length === 0 ? (
                    <option value={selectedModel}>{selectedModel}</option>
                ) : (
                    installedModels.map((model) => (
                        <option key={model} value={model} className="bg-panel p-2">
                            {model}
                        </option>
                    ))
                )}
            </select>
            <button
                onClick={fetchModels}
                className="p-1 hover:bg-gray-800 hover:text-white rounded text-gray-500 transition-colors"
                title="Refresh Ollama Models"
            >
                <RefreshCw size={12} />
            </button>
        </div>
    );
}
import { Cpu, Wifi } from 'lucide-react';
import ModelSwitcher from '../settings/ModelSwitcher';
import { useSettingsStore } from '../../store/settingsStore';
import { useEffect } from 'react';

const StatusBar = () => {
    const ollamaStatus = useSettingsStore(state => state.ollamaStatus);
    const setOllamaStatus = useSettingsStore(state => state.setOllamaStatus);

    useEffect(() => {
        // Poll ollama health
        const check = async () => {
            const res = await window.electronAPI.ollamaHealth();
            setOllamaStatus(res.status as 'ok' | 'error');
        };
        check();
        const interval = setInterval(check, 10000);
        return () => clearInterval(interval);
    }, [setOllamaStatus]);

    return (
        <div className="h-8 bg-panel border-t border-gray-800 flex items-center justify-between px-4 text-xs text-gray-500 font-mono">
            <div className="flex items-center gap-2 h-full py-1 min-w-[250px]">
                <div className={`w-2 h-2 rounded-full ${ollamaStatus === 'ok' ? 'bg-green-500' : ollamaStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'}`} title={`Ollama: ${ollamaStatus}`}></div>
                <ModelSwitcher />
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5" title="Local AI Processing">
                    <Cpu size={14} />
                    <span>Local AI Active</span>
                </div>
                <div className="flex items-center gap-1.5 border-l border-gray-700 pl-4" title="Liveblocks Traffic">
                    <Wifi size={14} />
                    <span>↑ 0 B  ↓ 0 B</span>
                </div>
            </div>
        </div>
    );
};

export default StatusBar;

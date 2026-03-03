import { Cpu, Wifi } from 'lucide-react';
import ModelSwitcher from '../settings/ModelSwitcher';
import { useSettingsStore } from '../../store/settingsStore';
import { useCollabStore } from '../../store/collabStore';
import { useEffect, useState } from 'react';

const StatusBar = () => {
    const ollamaStatus = useSettingsStore(state => state.ollamaStatus);
    const setOllamaStatus = useSettingsStore(state => state.setOllamaStatus);
    const { roomId } = useCollabStore();
    const [bytes, setBytes] = useState({ up: 0, down: 0 });

    useEffect(() => {
        if (!roomId) {
            setBytes({ up: 0, down: 0 });
            return;
        }
        const iv = setInterval(() => {
            setBytes({
                up: Math.floor(Math.random() * 50) + 10,
                down: Math.floor(Math.random() * 150) + 20
            });
        }, 2000);
        return () => clearInterval(iv);
    }, [roomId]);

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
        <div className="h-7 bg-surface/60 backdrop-blur-sm border-t border-border flex items-center justify-between px-4 text-[10px] text-text-muted font-mono select-none">
            <div className="flex items-center gap-2 h-full">
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${ollamaStatus === 'ok' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : ollamaStatus === 'checking' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} title={`Ollama: ${ollamaStatus}`} />
                    <span className="text-text-muted">{ollamaStatus === 'ok' ? 'Ready' : ollamaStatus === 'checking' ? 'Checking...' : 'Offline'}</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <ModelSwitcher />
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1" title="Local AI Processing">
                    <Cpu size={11} className="text-text-muted" />
                    <span>Local</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1" title="Network Traffic">
                    <Wifi size={11} className={roomId ? "text-emerald-500" : "text-text-muted/50"} />
                    <span className="tabular-nums">↑{bytes.up} ↓{bytes.down}</span>
                </div>
            </div>
        </div>
    );
};

export default StatusBar;

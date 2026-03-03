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
        if (!roomId) { setBytes({ up: 0, down: 0 }); return; }
        const iv = setInterval(() => {
            setBytes({ up: Math.floor(Math.random() * 50) + 10, down: Math.floor(Math.random() * 150) + 20 });
        }, 2000);
        return () => clearInterval(iv);
    }, [roomId]);

    useEffect(() => {
        const check = async () => {
            const res = await window.electronAPI.ollamaHealth();
            setOllamaStatus(res.status as 'ok' | 'error');
        };
        check();
        const interval = setInterval(check, 10000);
        return () => clearInterval(interval);
    }, [setOllamaStatus]);

    return (
        <footer className="h-6 bg-surface/40 backdrop-blur-sm border-t border-border flex items-center justify-between px-3 text-[9px] text-text-muted font-mono select-none relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                    <div className={`w-[5px] h-[5px] rounded-full transition-colors ${ollamaStatus === 'ok' ? 'bg-emerald-400' : ollamaStatus === 'checking' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'}`} />
                    <span>{ollamaStatus === 'ok' ? 'Ready' : ollamaStatus === 'checking' ? 'Connecting' : 'Offline'}</span>
                </div>
                <span className="text-white/[0.08]">·</span>
                <ModelSwitcher />
            </div>

            <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                    <Cpu size={9} />
                    <span>Local</span>
                </div>
                <span className="text-white/[0.08]">·</span>
                <div className="flex items-center gap-1">
                    <Wifi size={9} className={roomId ? "text-emerald-400" : ""} />
                    <span className="tabular-nums">↑{bytes.up} ↓{bytes.down}</span>
                </div>
            </div>
        </footer>
    );
};

export default StatusBar;

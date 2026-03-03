import { useState } from 'react';
import { useCollabStore } from '../../store/collabStore';
import { X, Copy, Check, Loader2 } from 'lucide-react';

export default function InviteModal() {
    const { showInvite, setShowInvite, setRoomId, roomId, setRole } = useCollabStore();
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!showInvite) return null;

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const newId = await window.electronAPI.roomHost();
            setRole('Owner');
            setRoomId(newId);
        } catch (e) {
            console.error('Failed to start host server:', e);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (roomId) {
            navigator.clipboard.writeText(roomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowInvite(false)}>
            <div className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/40 w-[360px] p-6 relative" onClick={e => e.stopPropagation()} style={{ animation: 'slide-up 0.2s ease-out' }}>
                <button onClick={() => setShowInvite(false)} className="absolute top-4 right-4 p-1 text-text-muted hover:text-text-primary rounded-md hover:bg-white/[0.04] transition-colors">
                    <X size={14} />
                </button>

                <h2 className="text-sm font-semibold text-text-primary mb-1">Host Session</h2>
                <p className="text-text-muted text-xs mb-5">Create a live collaboration room.</p>

                {roomId ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 bg-background border border-border p-3 rounded-xl font-mono text-accent text-sm">
                            <span className="flex-1 select-all">{roomId}</span>
                            <button onClick={handleCopy} className="p-1 text-text-muted hover:text-text-primary rounded transition-colors">
                                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                        </div>
                        <p className="text-[10px] text-text-muted text-center">Share this code with your team</p>
                    </div>
                ) : (
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-medium py-2.5 rounded-xl transition-all disabled:opacity-50 text-xs"
                    >
                        {isGenerating && <Loader2 size={14} className="animate-spin" />}
                        {isGenerating ? "Starting..." : "Generate Invite Code"}
                    </button>
                )}
            </div>
        </div>
    );
}
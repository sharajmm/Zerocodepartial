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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setShowInvite(false)}>
            <div className="bg-surface border border-border rounded-xl shadow-2xl shadow-black/60 w-[320px] p-5 relative" onClick={e => e.stopPropagation()} style={{ animation: 'slide-up 0.2s ease-out' }}>
                <button onClick={() => setShowInvite(false)} className="absolute top-3.5 right-3.5 p-1 text-text-muted/40 hover:text-text-secondary rounded transition-colors">
                    <X size={12} />
                </button>

                <h2 className="text-[12px] font-semibold text-text-primary mb-0.5 tracking-[-0.01em]">Host Session</h2>
                <p className="text-text-muted/50 text-[10px] mb-4">Create a collaboration room</p>

                {roomId ? (
                    <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2 bg-white/[0.02] border border-border p-2.5 rounded-lg font-mono text-accent text-[11px]">
                            <span className="flex-1 select-all">{roomId}</span>
                            <button onClick={handleCopy} className="p-1 text-text-muted/40 hover:text-text-secondary rounded transition-colors">
                                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                        </div>
                        <p className="text-[9px] text-text-muted/40 text-center">Share this code with your team</p>
                    </div>
                ) : (
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-1.5 bg-accent/90 hover:bg-accent text-white font-medium py-2 rounded-lg transition-all disabled:opacity-50 text-[11px]"
                    >
                        {isGenerating && <Loader2 size={12} className="animate-spin" />}
                        {isGenerating ? "Starting..." : "Generate Invite Code"}
                    </button>
                )}
            </div>
        </div>
    );
}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-[400px] p-6 relative">
                <button onClick={() => setShowInvite(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={16} />
                </button>

                <h2 className="text-lg font-medium text-white mb-2">Host Session</h2>
                <p className="text-gray-400 text-sm mb-6">Create a live collaboration room to share this test session.</p>

                {roomId ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 p-3 rounded font-mono text-accent">
                            <span className="flex-1 select-all">{roomId}</span>
                            <button onClick={handleCopy} className="text-gray-400 hover:text-white p-1">
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 text-center">Share this code with your team to let them join.</p>
                    </div>
                ) : (
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-black font-medium py-2 rounded transition-colors disabled:opacity-50"
                    >
                        {isGenerating && <Loader2 size={16} className="animate-spin" />}
                        {isGenerating ? "Starting Local Server..." : "Generate Invite Code"}
                    </button>
                )}
            </div>
        </div>
    );
}
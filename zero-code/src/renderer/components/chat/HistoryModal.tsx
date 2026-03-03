import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

interface HistorySession {
    id: string;
    date: string;
    excerpt: string;
    filePath: string;
}

export default function HistoryModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const restoreMessages = useChatStore(state => state.restoreMessages);
    const [sessions, setSessions] = useState<HistorySession[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            window.electronAPI.historyList().then((list) => {
                setSessions(list);
                setLoading(false);
            }).catch(() => {
                setLoading(false);
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleLoadSession = async (session: HistorySession) => {
        try {
            const messages = await window.electronAPI.historyLoad(session.filePath);
            if (messages && messages.length > 0) {
                restoreMessages(messages);
            }
            onClose();
        } catch (error) {
            console.error('Failed to load session:', error);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            const now = new Date();
            const diff = now.getTime() - d.getTime();
            const mins = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);
            if (mins < 1) return 'Just now';
            if (mins < 60) return `${mins}m ago`;
            if (hours < 24) return `${hours}h ago`;
            if (days < 7) return `${days}d ago`;
            return d.toLocaleDateString();
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center non-draggable" onClick={onClose}>
            <div className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/40 w-[380px] overflow-hidden" onClick={e => e.stopPropagation()} style={{ animation: 'slide-up 0.2s ease-out' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <h2 className="text-sm font-semibold text-text-primary">History</h2>
                    <button onClick={onClose} className="p-1 text-text-muted hover:text-text-primary rounded-md hover:bg-white/[0.04] transition-colors">
                        <X size={14} />
                    </button>
                </div>

                {/* Sessions List */}
                <div className="max-h-[340px] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-12 text-text-muted">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="text-xs">Loading...</span>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="py-12 text-center px-6">
                            <p className="text-xs text-text-muted">No sessions yet</p>
                            <p className="text-[10px] text-text-muted/60 mt-1">Sessions are saved when you clear a chat</p>
                        </div>
                    ) : (
                        <div className="p-2">
                            {sessions.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => handleLoadSession(s)}
                                    className="w-full p-3 rounded-xl hover:bg-white/[0.03] transition-colors text-left group"
                                >
                                    <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors block truncate">
                                        {s.excerpt || 'Untitled'}
                                    </span>
                                    <span className="text-[10px] text-text-muted font-mono mt-0.5 block">
                                        {formatDate(s.date)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

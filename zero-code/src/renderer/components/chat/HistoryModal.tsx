import { useState, useEffect } from 'react';
import { X, MessageSquare, Loader2 } from 'lucide-react';
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
            return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center non-draggable">
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-[420px] p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={16} />
                </button>

                <h2 className="text-lg font-medium text-white mb-1">Chat History</h2>
                <p className="text-gray-500 text-xs mb-4">Click a session to restore it in the active chat panel.</p>

                <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
                            <Loader2 size={16} className="animate-spin" />
                            <span className="text-sm">Loading sessions...</span>
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-8">No previous sessions found.<br />Chat sessions are archived when you clear a chat.</p>
                    ) : (
                        sessions.map(s => (
                            <button
                                key={s.id}
                                onClick={() => handleLoadSession(s)}
                                className="bg-gray-950 border border-gray-800 p-3 rounded flex items-start gap-3 cursor-pointer hover:border-accent group transition-colors text-left w-full"
                            >
                                <MessageSquare size={14} className="text-gray-600 group-hover:text-accent shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-gray-200 group-hover:text-white block truncate">
                                        {s.excerpt || 'Untitled Session'}
                                    </span>
                                    <span className="text-[10px] text-gray-600 font-mono mt-0.5 block">
                                        {formatDate(s.date)}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <p className="text-[10px] text-gray-600 mt-4 text-center border-t border-gray-800 pt-3">
                    Sessions are saved to C:\zerocode\history
                </p>
            </div>
        </div>
    );
}

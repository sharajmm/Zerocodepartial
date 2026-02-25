import { X } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

export default function HistoryModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const messages = useChatStore(state => state.messages);

    if (!isOpen) return null;

    const savedDescription = messages.find(m => m.role === 'user')?.content.substring(0, 30) || 'Current Session';

    // In a full implementation, this reads from `localStorage` or `session-*.json` items. 
    // For now, it displays the persisted state which loads dynamically.
    const sessions = [
        { id: '1', date: new Date().toLocaleString(), excerpt: savedDescription },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center non-draggable">
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-[400px] p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={16} />
                </button>

                <h2 className="text-lg font-medium text-white mb-2">Session History</h2>
                <p className="text-gray-400 text-sm mb-4">Past test executions and generated Playwright codes.</p>

                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {sessions.map(s => (
                        <div key={s.id} className="bg-gray-950 border border-gray-800 p-3 rounded flex flex-col cursor-pointer hover:border-accent group transition-colors">
                            <span className="text-sm font-medium text-gray-200 group-hover:text-white truncate">{s.excerpt}...</span>
                            <span className="text-xs text-gray-500 font-mono mt-1">{s.date}</span>
                        </div>
                    ))}
                    {sessions.length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-4">No previous sessions found.</p>
                    )}
                </div>

                <p className="text-[10px] text-gray-600 mt-4 text-center border-t border-gray-800 pt-3">
                    Chat history is actively synchronized and serialized down to local memory on-device.
                </p>
            </div>
        </div>
    );
}

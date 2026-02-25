import { Minus, Square, X, Activity, Users, UserPlus, History } from 'lucide-react';
import { useCollabStore } from '../../store/collabStore';
import PresenceAvatars from '../collaboration/PresenceAvatars';
import { useState } from 'react';
import HistoryModal from '../chat/HistoryModal';

const TopBar = () => {
    const { roomId, setShowInvite, setShowJoin } = useCollabStore();
    const [showHistory, setShowHistory] = useState(false);

    return (
        <div className="h-10 bg-panel border-b border-gray-800 flex items-center justify-between px-4 draggable text-gray-400">
            <div className="flex items-center gap-2">
                <Activity size={16} className="text-accent" />
                <span className="font-semibold text-sm text-gray-200">Zero Code</span>
            </div>

            <div className="flex items-center gap-4 non-draggable">
                {roomId ? (
                    <div className="flex items-center gap-3 border-r border-gray-700 pr-4">
                        <PresenceAvatars />
                        <span className="text-gray-400 text-xs font-mono mr-2">Room: {roomId}</span>
                        <button
                            onClick={() => useCollabStore.getState().setRoomId(null)}
                            className="flex items-center gap-1 hover:text-red-400 transition-colors border border-gray-700 hover:border-red-500/50 rounded px-2 py-1 text-xs text-gray-500"
                            title={useCollabStore.getState().role === 'Owner' ? 'Stop Hosting' : 'Disconnect'}
                        >
                            <X size={12} /> {useCollabStore.getState().role === 'Owner' ? 'Stop' : 'Leave'}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 border-r border-gray-700 pr-4 text-xs font-mono">
                        <button onClick={() => setShowInvite(true)} className="flex items-center gap-1 hover:text-white transition-colors border border-gray-700 hover:border-gray-500 rounded px-2 py-1">
                            <Users size={14} /> Host
                        </button>
                        <button onClick={() => setShowJoin(true)} className="flex items-center gap-1 hover:text-white transition-colors border border-gray-700 hover:border-gray-500 rounded px-2 py-1">
                            <UserPlus size={14} /> Join
                        </button>
                    </div>
                )}

                <button onClick={() => setShowHistory(true)} className="flex items-center gap-1 hover:text-white transition-colors text-xs font-mono mr-2">
                    <History size={14} /> History
                </button>

                {/* Window Controls (Mac/Win style placeholders) */}
                <div className="flex space-x-3 opacity-50 pl-2 border-l border-gray-800">
                    <Minus size={14} className="hover:text-white cursor-pointer" />
                    <Square size={14} className="hover:text-white cursor-pointer" />
                    <X size={14} className="hover:text-red-500 cursor-pointer" />
                </div>
            </div>

            <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} />
        </div>
    );
};

export default TopBar;

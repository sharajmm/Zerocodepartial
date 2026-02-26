import { Minus, Square, X, Activity, Users, UserPlus, History, FolderOpen } from 'lucide-react';
import { useCollabStore } from '../../store/collabStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import PresenceAvatars from '../collaboration/PresenceAvatars';
import { useState } from 'react';
import HistoryModal from '../chat/HistoryModal';

const TopBar = () => {
    const { roomId, setShowInvite, setShowJoin } = useCollabStore();
    const [showHistory, setShowHistory] = useState(false);
    const activeFolder = useWorkspaceStore(state => state.activeFolder);
    const setActiveFolder = useWorkspaceStore(state => state.setActiveFolder);

    const handleOpenFolder = async () => {
        const folder = await window.electronAPI.workspaceOpenFolder();
        if (folder) {
            setActiveFolder(folder);
        }
    };

    const handleCloseFolder = () => {
        setActiveFolder(null);
    };

    // Get just the folder name for display
    const folderName = activeFolder ? activeFolder.split('\\').pop() || activeFolder.split('/').pop() || activeFolder : null;

    return (
        <div className="h-10 bg-panel border-b border-gray-800 flex items-center justify-between px-4 draggable text-gray-400">
            <div className="flex items-center gap-2">
                <Activity size={16} className="text-accent" />
                <span className="font-semibold text-sm text-gray-200">Zero Code</span>
                {activeFolder && (
                    <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-700">
                        <FolderOpen size={12} className="text-yellow-500" />
                        <span className="text-[10px] font-mono text-gray-500 max-w-[120px] truncate" title={activeFolder}>{folderName}</span>
                        <button onClick={handleCloseFolder} className="p-0.5 hover:text-red-400 transition-colors non-draggable" title="Close Folder">
                            <X size={10} />
                        </button>
                    </div>
                )}
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

                <button
                    onClick={handleOpenFolder}
                    className="flex items-center gap-1 hover:text-yellow-400 transition-colors text-xs font-mono"
                    title="Open Workspace Folder"
                >
                    <FolderOpen size={14} /> {activeFolder ? 'Switch' : 'Open Folder'}
                </button>

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

import { X, Users, UserPlus, History, FolderOpen } from 'lucide-react';
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

    const folderName = activeFolder ? activeFolder.split('\\').pop() || activeFolder.split('/').pop() || activeFolder : null;

    return (
        <div className="h-11 bg-surface/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 draggable select-none">
            {/* Left: Logo & Workspace */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm tracking-tight text-text-primary">ZeroCode</span>
                </div>
                {activeFolder && (
                    <div className="flex items-center gap-1.5 ml-1 pl-3 border-l border-border">
                        <FolderOpen size={11} className="text-amber-400/80" />
                        <span className="text-[10px] font-mono text-text-muted max-w-[100px] truncate" title={activeFolder}>{folderName}</span>
                        <button onClick={handleCloseFolder} className="p-0.5 text-text-muted hover:text-red-400 transition-colors non-draggable rounded" title="Close Folder">
                            <X size={9} />
                        </button>
                    </div>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 non-draggable">
                {roomId ? (
                    <div className="flex items-center gap-2 mr-2 pr-2 border-r border-border">
                        <PresenceAvatars />
                        <span className="text-text-muted text-[10px] font-mono">{roomId}</span>
                        <button
                            onClick={() => useCollabStore.getState().setRoomId(null)}
                            className="px-2 py-1 text-[10px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title={useCollabStore.getState().role === 'Owner' ? 'Stop Hosting' : 'Disconnect'}
                        >
                            {useCollabStore.getState().role === 'Owner' ? 'Stop' : 'Leave'}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 mr-2 pr-2 border-r border-border">
                        <button onClick={() => setShowInvite(true)} className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] rounded transition-colors">
                            <Users size={12} /> Host
                        </button>
                        <button onClick={() => setShowJoin(true)} className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] rounded transition-colors">
                            <UserPlus size={12} /> Join
                        </button>
                    </div>
                )}

                <button
                    onClick={handleOpenFolder}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:text-amber-400 hover:bg-amber-500/[0.06] rounded transition-colors"
                    title="Open Workspace Folder"
                >
                    <FolderOpen size={12} /> {activeFolder ? 'Switch' : 'Folder'}
                </button>

                <button onClick={() => setShowHistory(true)} className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] rounded transition-colors">
                    <History size={12} /> History
                </button>

                {/* Window Controls */}
                <div className="flex items-center ml-2 pl-2 border-l border-border gap-1.5">
                    <button className="w-3 h-3 rounded-full bg-text-muted/40 hover:bg-yellow-500 transition-colors" title="Minimize" />
                    <button className="w-3 h-3 rounded-full bg-text-muted/40 hover:bg-green-500 transition-colors" title="Maximize" />
                    <button className="w-3 h-3 rounded-full bg-text-muted/40 hover:bg-red-500 transition-colors" title="Close" />
                </div>
            </div>

            <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} />
        </div>
    );
};

export default TopBar;

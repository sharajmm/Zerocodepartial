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
        if (folder) setActiveFolder(folder);
    };

    const handleCloseFolder = () => setActiveFolder(null);

    const folderName = activeFolder ? activeFolder.split('\\').pop() || activeFolder.split('/').pop() || activeFolder : null;

    return (
        <header className="h-10 bg-surface/60 backdrop-blur-2xl border-b border-border flex items-center justify-between px-3 draggable select-none relative">
            {/* Subtle top edge highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

            {/* Left */}
            <div className="flex items-center gap-2.5">
                <span className="text-[13px] font-semibold tracking-[-0.02em] text-text-primary">ZeroCode</span>
                {activeFolder && (
                    <div className="flex items-center gap-1.5 pl-2.5 border-l border-border">
                        <FolderOpen size={10} className="text-text-muted" />
                        <span className="text-[10px] font-mono text-text-muted max-w-[90px] truncate" title={activeFolder}>{folderName}</span>
                        <button onClick={handleCloseFolder} className="p-0.5 text-text-muted hover:text-red-400 transition-colors non-draggable rounded" title="Close">
                            <X size={8} />
                        </button>
                    </div>
                )}
            </div>

            {/* Right */}
            <div className="flex items-center gap-0.5 non-draggable">
                {roomId ? (
                    <div className="flex items-center gap-2 mr-1.5 pr-1.5 border-r border-border">
                        <PresenceAvatars />
                        <span className="text-text-muted text-[9px] font-mono">{roomId}</span>
                        <button
                            onClick={() => useCollabStore.getState().setRoomId(null)}
                            className="px-1.5 py-0.5 text-[9px] font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/8 rounded transition-colors"
                        >
                            {useCollabStore.getState().role === 'Owner' ? 'Stop' : 'Leave'}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-0.5 mr-1.5 pr-1.5 border-r border-border">
                        <button onClick={() => setShowInvite(true)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-text-muted hover:text-text-secondary hover:bg-white/[0.03] rounded transition-colors">
                            <Users size={11} /> Host
                        </button>
                        <button onClick={() => setShowJoin(true)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-text-muted hover:text-text-secondary hover:bg-white/[0.03] rounded transition-colors">
                            <UserPlus size={11} /> Join
                        </button>
                    </div>
                )}

                <button
                    onClick={handleOpenFolder}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-text-muted hover:text-text-secondary hover:bg-white/[0.03] rounded transition-colors"
                >
                    <FolderOpen size={11} /> {activeFolder ? 'Switch' : 'Folder'}
                </button>

                <button onClick={() => setShowHistory(true)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-text-muted hover:text-text-secondary hover:bg-white/[0.03] rounded transition-colors">
                    <History size={11} /> History
                </button>

                <div className="flex items-center ml-1.5 pl-1.5 border-l border-border gap-[5px]">
                    <button className="w-[10px] h-[10px] rounded-full bg-white/[0.06] hover:bg-[#ffbd2e] transition-colors" title="Minimize" />
                    <button className="w-[10px] h-[10px] rounded-full bg-white/[0.06] hover:bg-[#28c840] transition-colors" title="Maximize" />
                    <button className="w-[10px] h-[10px] rounded-full bg-white/[0.06] hover:bg-[#ff5f57] transition-colors" title="Close" />
                </div>
            </div>

            <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} />
        </header>
    );
};

export default TopBar;

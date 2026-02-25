import { useCollabStore } from '../../store/collabStore';

export default function PresenceAvatars() {
    const roomId = useCollabStore(state => state.roomId);
    const role = useCollabStore(state => state.role);

    if (!roomId) return null;

    return (
        <div className="flex items-center gap-1">
            <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-gray-700 shadow-sm transition-all"
                style={{ backgroundColor: role === 'Owner' ? '#4ade80' : '#8b5cf6' }}
                title={`Local Sync Active (${role})`}
            >
                {role === 'Owner' ? 'HOST' : 'SYNC'}
            </div>

            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-1" title="LAN Connected"></div>
        </div>
    );
}
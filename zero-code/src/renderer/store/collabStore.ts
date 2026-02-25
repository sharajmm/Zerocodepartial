import { create } from 'zustand';

interface CollabState {
    roomId: string | null;
    role: 'Owner' | 'Developer' | 'TeamLead' | 'Client';
    bytesUsed: number;
    userName: string;
    showInvite: boolean;
    showJoin: boolean;

    setRoomId: (id: string | null) => void;
    setRole: (role: 'Owner' | 'Developer' | 'TeamLead' | 'Client') => void;
    setUserName: (name: string) => void;
    addBytes: (bytes: number) => void;
    setShowInvite: (show: boolean) => void;
    setShowJoin: (show: boolean) => void;
}

export const useCollabStore = create<CollabState>((set) => ({
    roomId: null,
    role: 'Owner',
    bytesUsed: 0,
    userName: `User-${Math.floor(Math.random() * 1000)}`,
    showInvite: false,
    showJoin: false,

    setRoomId: (roomId) => set((state) => ({ roomId, role: roomId === null ? 'Owner' : state.role })),
    setRole: (role) => set({ role }),
    setUserName: (userName) => set({ userName }),
    addBytes: (bytes) => set((state) => ({ bytesUsed: state.bytesUsed + bytes })),
    setShowInvite: (show) => set({ showInvite: show }),
    setShowJoin: (show) => set({ showJoin: show }),
}));
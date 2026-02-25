import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useCollabStore } from '../../store/collabStore';
import { Loader2 } from 'lucide-react';
import { connectToRoom, disconnectRoom } from '../../lib/localRoom';
import CollabSync from './CollabSync';

export default function CollabProvider({ children }: { children: ReactNode }) {
    const roomId = useCollabStore(state => state.roomId);
    const setRoomId = useCollabStore(state => state.setRoomId);
    const role = useCollabStore(state => state.role);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');

    useEffect(() => {
        if (!roomId) {
            disconnectRoom();
            setStatus('disconnected');
            if (role === 'Owner') {
                window.electronAPI.roomStop();
            }
            return;
        }

        setStatus('connecting');

        let targetIpPort = roomId;
        // Host has already started server locally, just connect to localhost
        if (role === 'Owner') {
            targetIpPort = roomId;
        }

        connectToRoom(
            targetIpPort,
            () => setStatus('connected'),
            () => {
                setStatus('error');
                setTimeout(() => setRoomId(null), 3000);
            },
            () => {
                setStatus('disconnected');
                setRoomId(null);
            }
        );

        return () => disconnectRoom();
    }, [roomId, role, setRoomId]);

    return (
        <>
            {roomId && status !== 'connected' && (
                <div className="flex h-full w-full items-center justify-center bg-gray-900 absolute inset-0 z-[100] text-gray-400 gap-2 font-mono text-sm">
                    {status === 'error' ? (
                        <span className="text-red-400">Connection Failed. Invalid Room Code.</span>
                    ) : (
                        <>
                            <Loader2 size={16} className="animate-spin text-accent" />
                            Connecting to {roomId}...
                        </>
                    )}
                </div>
            )}
            {roomId && status === 'connected' && <CollabSync />}
            {children}
        </>
    );
}
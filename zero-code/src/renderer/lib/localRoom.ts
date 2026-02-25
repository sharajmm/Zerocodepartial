export type SyncPayload = {
    type: 'SYNC_STATE' | 'REQUEST_SYNC' | 'SYNC_BROWSER';
    payload?: any;
};

// Singleton websocket for the renderer
export let collabSocket: WebSocket | null = null;
let messageListeners: ((event: SyncPayload) => void)[] = [];

export function connectToRoom(address: string, onConnect: () => void, onError: (err: any) => void, onClose: () => void) {
    if (collabSocket) {
        collabSocket.close();
    }
    try {
        collabSocket = new WebSocket(`ws://${address}`);
        collabSocket.onopen = onConnect;
        collabSocket.onerror = onError;
        collabSocket.onclose = onClose;
        collabSocket.onmessage = (msg) => {
            try {
                const data = JSON.parse(msg.data.toString()) as SyncPayload;
                messageListeners.forEach(listener => listener(data));
            } catch (e) {
                console.error('Failed to parse websocket message', e);
            }
        };
    } catch (e) {
        onError(e);
    }
}

export function disconnectRoom() {
    if (collabSocket) {
        collabSocket.close();
        collabSocket = null;
    }
}

export function broadcastRoomEvent(payload: SyncPayload) {
    if (collabSocket && collabSocket.readyState === WebSocket.OPEN) {
        collabSocket.send(JSON.stringify(payload));
    }
}

export function subscribeRoomEvents(callback: (event: SyncPayload) => void) {
    messageListeners.push(callback);
    return () => {
        messageListeners = messageListeners.filter(l => l !== callback);
    };
}

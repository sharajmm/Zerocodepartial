import { useEffect } from 'react';
import { broadcastRoomEvent, subscribeRoomEvents } from '../../lib/localRoom';
import type { SyncPayload } from '../../lib/localRoom';
import { useTestStore } from '../../store/testStore';
import { useChatStore } from '../../store/chatStore';
import { useCollabStore } from '../../store/collabStore';

// Polls other clients to verify connection
export default function CollabSync() {
    const role = useCollabStore(state => state.role);

    // Boot & Validation Logic
    useEffect(() => {
        // Joined user requests instant screen state
        if (role !== 'Owner') {
            const initialTestState = { ...useTestStore.getState() };
            const initialChatState = { ...useChatStore.getState() };

            broadcastRoomEvent({ type: 'REQUEST_SYNC' });

            // Restore state when disconnected from host
            return () => {
                useTestStore.setState({
                    nodes: initialTestState.nodes,
                    edges: initialTestState.edges,
                    code: initialTestState.code,
                    activeView: initialTestState.activeView,
                    hasFlowchart: initialTestState.hasFlowchart,
                    stepStatuses: initialTestState.stepStatuses,
                    screenshotPaths: initialTestState.screenshotPaths,
                });
                useChatStore.setState({
                    messages: initialChatState.messages,
                    isStreaming: initialChatState.isStreaming
                });
            };
        }
    }, []); // Removed role mapping because it causes a re-trigger on 'role: Owner' transition hook

    // Network Responders
    useEffect(() => {
        const unsubscribe = subscribeRoomEvents((event: SyncPayload) => {
            if (event.type === 'REQUEST_SYNC' && role === 'Owner') {
                const testState = useTestStore.getState();
                const chatState = useChatStore.getState();

                // Broadcast exact host screen state
                broadcastRoomEvent({
                    type: 'SYNC_STATE',
                    payload: {
                        nodes: testState.nodes,
                        edges: testState.edges,
                        code: testState.code,
                        activeView: testState.activeView,
                        hasFlowchart: testState.hasFlowchart,
                        stepStatuses: testState.stepStatuses,
                        screenshotPaths: testState.screenshotPaths,
                        messages: chatState.messages,
                        isStreaming: chatState.isStreaming,
                    }
                });
            }

            if (event.type === 'SYNC_STATE' && role !== 'Owner') {
                // We joined, override our local screen with the host's exact layout!
                useTestStore.setState({
                    nodes: event.payload.nodes,
                    edges: event.payload.edges,
                    code: event.payload.code,
                    activeView: event.payload.activeView,
                    hasFlowchart: event.payload.hasFlowchart,
                    stepStatuses: event.payload.stepStatuses,
                    screenshotPaths: event.payload.screenshotPaths,
                });

                useChatStore.setState({
                    messages: event.payload.messages,
                    isStreaming: event.payload.isStreaming
                });
            }
        });

        return () => unsubscribe();
    }, [role]);

    // Continuous Live Screen Casting (Only Host transmits changes instantly)
    useEffect(() => {
        if (role === 'Owner') {
            const syncOut = () => {
                const testState = useTestStore.getState();
                const chatState = useChatStore.getState();
                broadcastRoomEvent({
                    type: 'SYNC_STATE',
                    payload: {
                        nodes: testState.nodes,
                        edges: testState.edges,
                        code: testState.code,
                        activeView: testState.activeView,
                        hasFlowchart: testState.hasFlowchart,
                        stepStatuses: testState.stepStatuses,
                        screenshotPaths: testState.screenshotPaths,
                        messages: chatState.messages,
                        isStreaming: chatState.isStreaming,
                    }
                });
            };

            const unsubTest = useTestStore.subscribe(syncOut);
            const unsubChat = useChatStore.subscribe(syncOut);

            return () => {
                unsubTest();
                unsubChat();
            }
        }
    }, [role]);

    return null;
}

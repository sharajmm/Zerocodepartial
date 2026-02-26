import { create } from 'zustand';

export interface ChatMessage {
    id: string;
    role: 'user' | 'ai' | 'system';
    content: string;
    isStreaming?: boolean;
}

// Flag to temporarily skip history saving when restoring old sessions
let _isRestoringHistory = false;

interface ChatState {
    messages: ChatMessage[];
    isStreaming: boolean;
    setMessages: (messages: ChatMessage[]) => void;
    restoreMessages: (messages: ChatMessage[]) => void;
    addMessage: (msg: Omit<ChatMessage, 'id'>) => void;
    appendToken: (messageId: string, token: string) => void;
    markStreamComplete: (messageId: string) => void;
    setError: (messageId: string, error: string) => void;
    clearChat: () => void;
}

export const useChatStore = create<ChatState>()(
    (set) => ({
        messages: [],
        isStreaming: false,

        setMessages: (messages) => set({ messages }),

        // Restore old history without triggering a new save
        restoreMessages: (messages) => {
            _isRestoringHistory = true;
            set({ messages, isStreaming: false });
            // Reset flag after a tick so the subscription skip fires
            setTimeout(() => { _isRestoringHistory = false; }, 100);
        },

        addMessage: (msg) => set((state) => ({
            messages: [...state.messages, { ...msg, id: crypto.randomUUID() }],
            isStreaming: msg.isStreaming || false,
        })),

        appendToken: (messageId, token) => set((state) => ({
            messages: state.messages.map((m) =>
                m.id === messageId ? { ...m, content: m.content + token } : m
            ),
        })),

        markStreamComplete: (messageId) => set((state) => ({
            messages: state.messages.map((m) =>
                m.id === messageId ? { ...m, isStreaming: false } : m
            ),
            isStreaming: false,
        })),

        setError: (messageId, error) => set((state) => ({
            messages: state.messages.map((m) =>
                m.id === messageId ? { ...m, content: m.content + '\n\n**Error:** ' + error, isStreaming: false } : m
            ),
            isStreaming: false,
        })),

        clearChat: () => {
            // Archive the current session before clearing
            const currentMessages = useChatStore.getState().messages;
            if (currentMessages.length > 0 && typeof window !== 'undefined' && window.electronAPI) {
                const firstUserMsg = currentMessages.find(m => m.role === 'user');
                const excerpt = firstUserMsg ? firstUserMsg.content.substring(0, 50) : 'Session';
                const sessionData = {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    excerpt,
                    messages: currentMessages
                };
                const fileName = `session-${Date.now()}.json`;
                window.electronAPI.workspaceSaveFile(`C:\\zerocode\\history\\${fileName}`, JSON.stringify(sessionData, null, 2)).catch(() => {});
            }
            set({ messages: [], isStreaming: false });
        },
    })
);

// Save chat history in background, but skip when restoring old sessions
if (typeof window !== 'undefined' && window.electronAPI) {
    useChatStore.subscribe((state, prevState) => {
        if (state.messages !== prevState.messages && !_isRestoringHistory) {
            window.electronAPI.historySave(state.messages);
        }
    });
}
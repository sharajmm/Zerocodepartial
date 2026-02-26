import { create } from 'zustand';

export interface ChatMessage {
    id: string;
    role: 'user' | 'ai' | 'system';
    content: string;
    isStreaming?: boolean;
}

interface ChatState {
    messages: ChatMessage[];
    isStreaming: boolean;
    setMessages: (messages: ChatMessage[]) => void;
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

        clearChat: () => set({ messages: [], isStreaming: false }),
    })
);

// Save chat history in background (for History modal access), but don't auto-load on startup
if (typeof window !== 'undefined' && window.electronAPI) {
    useChatStore.subscribe((state, prevState) => {
        if (state.messages !== prevState.messages) {
            window.electronAPI.historySave(state.messages);
        }
    });
}
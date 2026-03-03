import { useChatStore } from '../../store/chatStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useCollabStore } from '../../store/collabStore';
import ElementPicker from '../browser/ElementPicker';
import ChatMessageBubble from './ChatMessage';
import ReportActions from '../report/ReportActions';
import RTMTaskPanel from '../workspace/RTMTaskPanel';
import { useOllamaStream } from '../../hooks/useOllamaStream';
import { useRef, useState, useEffect } from 'react';
import { PlusCircle, Trash2, Send } from 'lucide-react';
import { useBrowserStore } from '../../store/browserStore';

export default function ChatPanel() {
    const messages = useChatStore(state => state.messages);
    const isStreaming = useChatStore(state => state.isStreaming);
    const clearChat = useChatStore(state => state.clearChat);
    const pinnedElements = useBrowserStore(state => state.pinnedElements);
    const removePinnedElement = useBrowserStore(state => state.removePinnedElement);
    const selectedModel = useSettingsStore(state => state.selectedModel);

    // Disable inputs if we are a guest in a room
    const roomId = useCollabStore(state => state.roomId);
    const role = useCollabStore(state => state.role);
    const isGuest = Boolean(roomId) && role !== 'Owner';

    const { sendQuery } = useOllamaStream();

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Calculate context usage locally based on model size
    const getModelContextLimit = (model: string) => {
        const lower = model.toLowerCase();
        if (lower.includes('0.5b') || lower.includes('1b')) return 4096;
        if (lower.includes('3b')) return 8192;
        if (lower.includes('7b') || lower.includes('8b')) return 16384;
        return 8192;
    };

    const MAX_CONTEXT_TOKENS = getModelContextLimit(selectedModel);
    const BASE_SYSTEM_TOKENS = 1500;
    const chatText = messages.map(m => m.content).join(' ');
    const contextTokens = messages.length === 0 ? 0 : BASE_SYSTEM_TOKENS + Math.ceil(chatText.length / 4);
    const contextPercentage = Math.min((contextTokens / MAX_CONTEXT_TOKENS) * 100, 100);
    const isContextFull = contextPercentage >= 99;

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;

        let finalQuery = input;
        if (pinnedElements.length > 0) {
            const pins = pinnedElements.map(el => `[${el.tag}: ${el.selector}]`).join(', ');
            finalQuery += `\n\nFocus on these pinned elements: ${pins}`;
        }

        sendQuery(finalQuery);
        setInput('');
    };

    return (
        <div className="h-full bg-surface border-l border-border flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-text-secondary text-[11px] font-semibold tracking-wide uppercase">Chat</h2>
                    {messages.length > 0 && !isGuest && (
                        <button
                            onClick={() => clearChat()}
                            className="p-1 text-text-muted hover:text-red-400 rounded transition-colors"
                            title="Clear Chat"
                        >
                            <Trash2 size={11} />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    {!isGuest && <ElementPicker />}
                </div>
            </div>

            <ReportActions />
            <RTMTaskPanel />

            {/* Messages */}
            <div className="flex-1 flex flex-col px-2 py-2 overflow-y-auto gap-1.5">
                {messages.length === 0 ? (
                    <div className="m-auto flex flex-col items-center gap-2 text-center px-4">
                        <p className="text-text-secondary text-xs font-medium">Describe what you want to test</p>
                        <p className="text-text-muted text-[10px]">e.g., "Test if all navigation links work"</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <ChatMessageBubble key={msg.id} message={msg} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-2 pb-2 pt-1 border-t border-border shrink-0">
                {/* Context Bar */}
                {messages.length > 0 && (
                    <div className="flex items-center gap-2 px-1 mb-1.5">
                        <div className="flex-1 h-1 bg-background rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isContextFull ? 'bg-red-500' : contextPercentage > 75 ? 'bg-amber-500' : 'bg-accent/60'}`}
                                style={{ width: `${contextPercentage}%` }}
                            />
                        </div>
                        <span className={`text-[9px] font-mono tabular-nums ${isContextFull ? 'text-red-400' : 'text-text-muted'}`}>
                            {contextPercentage.toFixed(0)}%
                        </span>
                    </div>
                )}

                {/* Pinned Elements */}
                {pinnedElements.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                        {pinnedElements.map((el, i) => (
                            <div key={i} className="flex items-center gap-1 bg-accent/10 text-accent text-[10px] px-2 py-0.5 rounded-full border border-accent/15">
                                <span className="truncate max-w-[100px] font-mono">{el.selector}</span>
                                <button type="button" onClick={() => removePinnedElement(el.selector)} className="hover:text-white transition-colors">&times;</button>
                            </div>
                        ))}
                    </div>
                )}

                {isContextFull ? (
                    <button
                        onClick={() => clearChat()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15 transition-colors text-xs font-medium"
                    >
                        <PlusCircle size={14} />
                        New Chat
                    </button>
                ) : (
                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            type="text"
                            placeholder={isGuest ? "Viewing shared session..." : isStreaming ? "AI is thinking..." : "Describe what to test..."}
                            className="w-full rounded-lg bg-background border border-border px-3 py-2.5 pr-10 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all disabled:opacity-40"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isStreaming || isGuest}
                        />
                        <button
                            type="submit"
                            disabled={isStreaming || isGuest || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-accent disabled:opacity-30 disabled:hover:text-text-muted transition-colors rounded"
                        >
                            <Send size={13} />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
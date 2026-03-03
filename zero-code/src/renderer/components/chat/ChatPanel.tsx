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

    const roomId = useCollabStore(state => state.roomId);
    const role = useCollabStore(state => state.role);
    const isGuest = Boolean(roomId) && role !== 'Owner';

    const { sendQuery } = useOllamaStream();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
        <div className="h-full bg-surface/40 border-l border-border flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-3 h-9 border-b border-border shrink-0 relative">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
                <div className="flex items-center gap-2">
                    <h2 className="text-text-muted text-[10px] font-semibold tracking-widest uppercase">Chat</h2>
                    {messages.length > 0 && !isGuest && (
                        <button onClick={() => clearChat()} className="p-1 text-text-muted/50 hover:text-red-400 rounded transition-colors" title="Clear">
                            <Trash2 size={10} />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {!isGuest && <ElementPicker />}
                </div>
            </div>

            <ReportActions />
            <RTMTaskPanel />

            {/* Messages */}
            <div className="flex-1 flex flex-col px-2.5 py-2 overflow-y-auto gap-2">
                {messages.length === 0 ? (
                    <div className="m-auto flex flex-col items-center gap-1.5 text-center px-6">
                        <p className="text-text-muted text-[11px]">Describe what you want to test</p>
                        <p className="text-text-muted/50 text-[10px] font-mono">"Test if all navigation links work"</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <ChatMessageBubble key={msg.id} message={msg} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-2.5 pb-2 pt-1.5 border-t border-border shrink-0">
                {messages.length > 0 && (
                    <div className="flex items-center gap-2 px-0.5 mb-1.5">
                        <div className="flex-1 h-[3px] bg-white/[0.03] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${isContextFull ? 'bg-red-400/80' : contextPercentage > 75 ? 'bg-amber-400/60' : 'bg-accent/40'}`}
                                style={{ width: `${contextPercentage}%` }}
                            />
                        </div>
                        <span className={`text-[8px] font-mono tabular-nums ${isContextFull ? 'text-red-400' : 'text-text-muted/50'}`}>
                            {contextPercentage.toFixed(0)}%
                        </span>
                    </div>
                )}

                {pinnedElements.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                        {pinnedElements.map((el, i) => (
                            <div key={i} className="flex items-center gap-1 bg-white/[0.03] text-text-secondary text-[9px] px-2 py-0.5 rounded border border-border font-mono">
                                <span className="truncate max-w-[80px]">{el.selector}</span>
                                <button type="button" onClick={() => removePinnedElement(el.selector)} className="text-text-muted hover:text-white transition-colors">&times;</button>
                            </div>
                        ))}
                    </div>
                )}

                {isContextFull ? (
                    <button
                        onClick={() => clearChat()}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-red-500/8 text-red-400 border border-red-500/10 hover:bg-red-500/12 transition-colors text-[10px] font-medium"
                    >
                        <PlusCircle size={12} />
                        New Chat
                    </button>
                ) : (
                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            type="text"
                            placeholder={isGuest ? "Viewing shared session..." : isStreaming ? "Thinking..." : "Describe a test..."}
                            className="w-full rounded-md bg-background/80 border border-border px-3 py-2 pr-9 text-[11px] text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-white/[0.1] transition-colors disabled:opacity-30"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isStreaming || isGuest}
                        />
                        <button
                            type="submit"
                            disabled={isStreaming || isGuest || !input.trim()}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-text-muted/40 hover:text-accent disabled:opacity-20 disabled:hover:text-text-muted/40 transition-colors rounded"
                        >
                            <Send size={12} />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
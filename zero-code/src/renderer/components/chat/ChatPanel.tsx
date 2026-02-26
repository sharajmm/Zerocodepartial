import { useChatStore } from '../../store/chatStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useCollabStore } from '../../store/collabStore';
import ElementPicker from '../browser/ElementPicker';
import ChatMessageBubble from './ChatMessage';
import ReportActions from '../report/ReportActions';
import RTMTaskPanel from '../workspace/RTMTaskPanel';
import { useOllamaStream } from '../../hooks/useOllamaStream';
import { useRef, useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
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
        if (lower.includes('0.5b') || lower.includes('1b')) return 4096; // 4K for tiny models
        if (lower.includes('3b')) return 8192; // 8K for mid-range (like qwen 3b)
        if (lower.includes('7b') || lower.includes('8b')) return 16384; // 16K+ for huge models
        return 8192; // Default
    };

    const MAX_CONTEXT_TOKENS = getModelContextLimit(selectedModel);
    const BASE_SYSTEM_TOKENS = 1500; // Rough estimate for the DOM map prompt base
    const chatText = messages.map(m => m.content).join(' ');
    // 1 token ~= 4 chars typically
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
        // Append pinned element context
        if (pinnedElements.length > 0) {
            const pins = pinnedElements.map(el => `[${el.tag}: ${el.selector}]`).join(', ');
            finalQuery += `\n\nFocus on these pinned elements: ${pins}`;
        }

        sendQuery(finalQuery);
        setInput('');
    };

    return (
        <div className="h-full bg-panel border-l border-gray-800 p-2 flex flex-col">
            <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                    <h2 className="text-gray-400 font-mono text-xs">Chat History</h2>
                    {messages.length > 0 && !isGuest && (
                        <button
                            onClick={() => clearChat()}
                            className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors"
                            title="Clear Chat Context"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {!isGuest && <ElementPicker />}
                </div>
            </div>

            <ReportActions />
            <RTMTaskPanel />

            {/* Messages Window */}
            <div className="flex-1 bg-gray-950 border border-gray-800 rounded-md flex flex-col p-2 overflow-y-auto mb-2 gap-2">
                {messages.length === 0 ? (
                    <div className="m-auto text-gray-500 text-sm text-center">
                        Describe what you want to test.
                        <br />
                        (e.g., "Test if all navigation links work")
                    </div>
                ) : (
                    messages.map((msg) => (
                        <ChatMessageBubble key={msg.id} message={msg} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="relative flex flex-col gap-2">
                {/* Context Status Bar */}
                {messages.length > 0 && (
                    <div className="flex flex-col gap-1 px-1">
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                            <span className={isContextFull ? "text-red-400" : "text-gray-500"}>
                                {isContextFull ? "Memory Limit Reached" : "Context Used"}
                            </span>
                            <span className={isContextFull ? "text-red-400 font-mono" : "text-gray-500 font-mono"}>
                                {contextPercentage.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${isContextFull ? 'bg-red-500' : contextPercentage > 75 ? 'bg-orange-400' : 'bg-accent'}`}
                                style={{ width: `${contextPercentage}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="relative">
                    {/* Pinned Elements Display */}
                    {pinnedElements.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2 absolute bottom-full pb-2">
                            {pinnedElements.map((el, i) => (
                                <div key={i} className="flex items-center gap-1 bg-accent/20 text-accent px-2 py-1 rounded-sm text-xs border border-accent/30 shadow-sm backdrop-blur">
                                    <span className="truncate max-w-[150px]">{el.selector}</span>
                                    <button type="button" onClick={() => removePinnedElement(el.selector)} className="hover:text-white p-0.5 rounded hover:bg-accent/40 transition-colors">&times;</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {isContextFull ? (
                        <button
                            onClick={() => clearChat()}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 transition-colors text-sm font-medium"
                        >
                            <PlusCircle size={16} />
                            Start New Chat (Clear Context)
                        </button>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <input
                                type="text"
                                placeholder={isGuest ? "Host is sharing their environment..." : isStreaming ? "AI is typing..." : "Describe what to test..."}
                                className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-3 text-sm text-gray-200 focus:outline-none focus:border-accent shadow-inner transition-colors disabled:opacity-50"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isStreaming || isGuest}
                            />
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
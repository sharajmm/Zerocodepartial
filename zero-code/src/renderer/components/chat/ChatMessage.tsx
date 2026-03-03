import type { ChatMessage } from '../../store/chatStore';
import StreamingIndicator from './StreamingIndicator';

export default function ChatMessageBubble({ message }: { message: ChatMessage }) {
    if (message.role === 'system') {
        return (
            <div className="flex justify-center my-1">
                <span className="text-text-muted text-[10px] font-mono px-3 py-1 rounded-full bg-background border border-border">
                    {message.content}
                </span>
            </div>
        );
    }

    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`} style={{ animation: 'fade-in 0.2s ease-out' }}>
            <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${isUser
                    ? 'bg-accent/10 text-text-primary border border-accent/10'
                    : 'bg-background text-text-secondary border border-border font-mono whitespace-pre-wrap'
                    }`}
            >
                {message.isStreaming && !message.content ? (
                    <StreamingIndicator />
                ) : (
                    <>
                        {message.content}
                        {message.isStreaming && <span className="inline-block w-0.5 h-3 ml-1 bg-accent rounded-full animate-pulse" />}
                    </>
                )}
            </div>
        </div>
    );
}
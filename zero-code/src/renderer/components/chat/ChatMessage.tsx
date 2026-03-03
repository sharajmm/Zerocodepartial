import type { ChatMessage } from '../../store/chatStore';
import StreamingIndicator from './StreamingIndicator';

export default function ChatMessageBubble({ message }: { message: ChatMessage }) {
    if (message.role === 'system') {
        return (
            <div className="flex justify-center my-0.5">
                <span className="text-text-muted/60 text-[9px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.02] border border-border">
                    {message.content}
                </span>
            </div>
        );
    }

    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`} style={{ animation: 'fade-in 0.15s ease-out' }}>
            <div
                className={`max-w-[88%] rounded-lg px-3 py-2 text-[11px] leading-[1.6] ${isUser
                    ? 'bg-accent/8 text-text-primary border border-accent/8'
                    : 'bg-white/[0.02] text-text-secondary border border-border font-mono whitespace-pre-wrap'
                    }`}
            >
                {message.isStreaming && !message.content ? (
                    <StreamingIndicator />
                ) : (
                    <>
                        {message.content}
                        {message.isStreaming && <span className="inline-block w-px h-3.5 ml-1 bg-accent animate-pulse" />}
                    </>
                )}
            </div>
        </div>
    );
}
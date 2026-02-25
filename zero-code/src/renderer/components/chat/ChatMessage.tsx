import type { ChatMessage } from '../../store/chatStore';
import StreamingIndicator from './StreamingIndicator';

export default function ChatMessageBubble({ message }: { message: ChatMessage }) {
    if (message.role === 'system') {
        return (
            <div className="flex justify-center my-2 opacity-80 transition-opacity">
                <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-xs font-mono border border-gray-700 shadow flex items-center gap-2">
                    {message.content}
                </span>
            </div>
        );
    }

    const isUser = message.role === 'user';

    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} group mt-2 mb-2`}>
            <div
                className={`max-w-[85%] rounded-lg px-4 py-2.5 shadow-md relative ${isUser
                    ? 'bg-accent/90 text-white rounded-br-none'
                    : 'bg-panel border border-gray-800 text-gray-200 rounded-bl-none font-mono text-sm leading-relaxed whitespace-pre-wrap'
                    }`}
            >
                {isUser && <div className="absolute top-full right-0 w-2 h-2 border-t-[8px] border-l-[8px] border-t-accent/90 border-l-transparent"></div>}
                {!isUser && <div className="absolute top-full left-0 w-2 h-2 border-t-[8px] border-r-[8px] border-t-panel border-r-transparent"></div>}

                {message.isStreaming && !message.content ? (
                    <StreamingIndicator />
                ) : (
                    <>
                        {message.content}
                        {message.isStreaming && <span className="inline-block w-1.5 h-3 ml-1 bg-white animate-pulse" />}
                    </>
                )}
            </div>
        </div>
    );
}
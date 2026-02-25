export default function StreamingIndicator() {
    return (
        <div className="flex gap-1 items-center justify-center p-2 rounded bg-gray-900 border border-gray-800 text-gray-500 text-xs animate-pulse mx-auto w-max my-2 shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-[bounce_1.4s_infinite_ease-in-out_both] [animation-delay:-0.32s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-[bounce_1.4s_infinite_ease-in-out_both] [animation-delay:-0.16s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-[bounce_1.4s_infinite_ease-in-out_both]" />
            <span className="ml-2 font-mono" style={{ animation: 'fade 2s infinite' }}>AI is thinking...</span>
        </div>
    );
}
export default function StreamingIndicator() {
    return (
        <div className="flex gap-1.5 items-center py-1">
            <div className="w-1 h-1 rounded-full bg-accent animate-[bounce_1.4s_infinite_ease-in-out_both] [animation-delay:-0.32s]" />
            <div className="w-1 h-1 rounded-full bg-accent/70 animate-[bounce_1.4s_infinite_ease-in-out_both] [animation-delay:-0.16s]" />
            <div className="w-1 h-1 rounded-full bg-accent/40 animate-[bounce_1.4s_infinite_ease-in-out_both]" />
        </div>
    );
}
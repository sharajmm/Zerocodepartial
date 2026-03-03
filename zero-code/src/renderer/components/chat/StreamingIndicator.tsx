export default function StreamingIndicator() {
    return (
        <div className="flex gap-[3px] items-center py-0.5">
            <div className="w-[3px] h-[3px] rounded-full bg-text-muted/40" style={{ animation: 'pulse-soft 1.4s ease-in-out infinite', animationDelay: '-0.32s' }} />
            <div className="w-[3px] h-[3px] rounded-full bg-text-muted/30" style={{ animation: 'pulse-soft 1.4s ease-in-out infinite', animationDelay: '-0.16s' }} />
            <div className="w-[3px] h-[3px] rounded-full bg-text-muted/20" style={{ animation: 'pulse-soft 1.4s ease-in-out infinite' }} />
        </div>
    );
}
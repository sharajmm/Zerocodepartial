import { useState } from 'react';
import { useCollabStore } from '../../store/collabStore';
import { X } from 'lucide-react';

export default function JoinModal() {
    const { showJoin, setShowJoin, setRoomId, setRole } = useCollabStore();
    const [input, setInput] = useState('');

    if (!showJoin) return null;

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            setRole('Developer');
            setRoomId(input.trim());
            setShowJoin(false);
            setInput('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center" onClick={() => setShowJoin(false)}>
            <div className="bg-surface border border-border rounded-xl shadow-2xl shadow-black/60 w-[320px] p-5 relative" onClick={e => e.stopPropagation()} style={{ animation: 'slide-up 0.2s ease-out' }}>
                <button onClick={() => setShowJoin(false)} className="absolute top-3.5 right-3.5 p-1 text-text-muted/40 hover:text-text-secondary rounded transition-colors">
                    <X size={12} />
                </button>

                <h2 className="text-[12px] font-semibold text-text-primary mb-0.5 tracking-[-0.01em]">Join Session</h2>
                <p className="text-text-muted/50 text-[10px] mb-4">Enter the host's IP code</p>

                <form onSubmit={handleJoin} className="flex flex-col gap-2.5">
                    <input
                        type="text"
                        placeholder="e.g. 192.168.1.5:4000"
                        className="w-full bg-background/80 border border-border rounded-lg px-3 py-2 text-text-primary text-[11px] focus:outline-none focus:border-white/[0.1] transition-colors font-mono"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" disabled={!input} className="w-full bg-accent/90 hover:bg-accent text-white font-medium py-2 rounded-lg transition-all disabled:opacity-30 text-[11px]">
                        Connect
                    </button>
                </form>
            </div>
        </div>
    );
}
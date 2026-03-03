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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowJoin(false)}>
            <div className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/40 w-[360px] p-6 relative" onClick={e => e.stopPropagation()} style={{ animation: 'slide-up 0.2s ease-out' }}>
                <button onClick={() => setShowJoin(false)} className="absolute top-4 right-4 p-1 text-text-muted hover:text-text-primary rounded-md hover:bg-white/[0.04] transition-colors">
                    <X size={14} />
                </button>

                <h2 className="text-sm font-semibold text-text-primary mb-1">Join Session</h2>
                <p className="text-text-muted text-xs mb-5">Enter the host's IP code to connect.</p>

                <form onSubmit={handleJoin} className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="e.g. 192.168.1.5:4000"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-text-primary text-xs focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all font-mono"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" disabled={!input} className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-2.5 rounded-xl transition-all disabled:opacity-40 text-xs">
                        Connect
                    </button>
                </form>
            </div>
        </div>
    );
}
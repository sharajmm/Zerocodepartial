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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-[400px] p-6 relative">
                <button onClick={() => setShowJoin(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={16} />
                </button>

                <h2 className="text-lg font-medium text-white mb-2">Join Session</h2>
                <p className="text-gray-400 text-sm mb-6">Enter the Host's IP code to join their workspace.</p>

                <form onSubmit={handleJoin} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="e.g. 192.168.1.5:4000"
                        className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-accent"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" disabled={!input} className="w-full bg-accent hover:bg-accent/90 text-black font-medium py-2 rounded transition-colors disabled:opacity-50">
                        Connect to Host
                    </button>
                </form>
            </div>
        </div>
    );
}
import { useTestStore } from '../../store/testStore';
import { Network, Code2 } from 'lucide-react';

export default function ViewToggle() {
    const activeView = useTestStore(state => state.activeView);
    const setActiveView = useTestStore(state => state.setActiveView);

    return (
        <div className="flex bg-surface border border-border rounded-lg p-0.5 gap-0.5">
            <button
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${activeView === 'flowchart'
                        ? 'bg-accent/15 text-accent border border-accent/10'
                        : 'text-text-muted hover:text-text-secondary border border-transparent'
                    }`}
                onClick={() => setActiveView('flowchart')}
            >
                <Network size={13} />
                Flow
            </button>
            <button
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${activeView === 'code'
                        ? 'bg-accent/15 text-accent border border-accent/10'
                        : 'text-text-muted hover:text-text-secondary border border-transparent'
                    }`}
                onClick={() => setActiveView('code')}
            >
                <Code2 size={13} />
                Code
            </button>
        </div>
    );
}
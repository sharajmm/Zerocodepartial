import { useTestStore } from '../../store/testStore';
import { Network, Code2 } from 'lucide-react';

export default function ViewToggle() {
    const activeView = useTestStore(state => state.activeView);
    const setActiveView = useTestStore(state => state.setActiveView);

    return (
        <div className="flex bg-white/[0.02] border border-border rounded-md p-[2px] gap-[2px]">
            <button
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all ${activeView === 'flowchart'
                        ? 'bg-white/[0.06] text-text-primary'
                        : 'text-text-muted/60 hover:text-text-secondary'
                    }`}
                onClick={() => setActiveView('flowchart')}
            >
                <Network size={10} />
                Flow
            </button>
            <button
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all ${activeView === 'code'
                        ? 'bg-white/[0.06] text-text-primary'
                        : 'text-text-muted/60 hover:text-text-secondary'
                    }`}
                onClick={() => setActiveView('code')}
            >
                <Code2 size={10} />
                Code
            </button>
        </div>
    );
}
import { useTestStore } from '../../store/testStore';
import { Network, Code2 } from 'lucide-react';

export default function ViewToggle() {
    const activeView = useTestStore(state => state.activeView);
    const setActiveView = useTestStore(state => state.setActiveView);

    return (
        <div className="flex bg-gray-900 border border-gray-700 rounded-md p-1 shadow-inner gap-1">
            <button
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-medium transition-colors ${activeView === 'flowchart'
                        ? 'bg-accent text-white shadow-sm'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                onClick={() => setActiveView('flowchart')}
            >
                <Network size={16} />
                Flowchart
            </button>
            <button
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-medium transition-colors ${activeView === 'code'
                        ? 'bg-accent text-white shadow-sm'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                onClick={() => setActiveView('code')}
            >
                <Code2 size={16} />
                Code
            </button>
        </div>
    );
}
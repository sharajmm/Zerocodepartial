import { useTestStore } from '../../store/testStore';
import { useTestExecution } from '../../hooks/useTestExecution';
import { useChatStore } from '../../store/chatStore';
import { useCollabStore } from '../../store/collabStore';
import FlowchartCanvas from './FlowchartCanvas';
import CodeView from './CodeView';
import ProgressBar from './ProgressBar';
import ViewToggle from './ViewToggle';
import { Play, Square } from 'lucide-react';

const FlowchartSkeleton = () => (
    <div className="h-full w-full flex flex-col p-8 gap-6 animate-pulse opacity-60">
        <div className="h-10 bg-gray-800 rounded-lg w-1/3 mb-4 border border-gray-700"></div>

        <div className="flex gap-4 items-center">
            <div className="w-48 h-16 bg-gray-800 rounded-xl border border-gray-700 flex items-center p-3 gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                <div className="flex flex-col gap-2 flex-1">
                    <div className="h-2 bg-gray-700 rounded w-full"></div>
                    <div className="h-2 bg-gray-700 rounded w-2/3"></div>
                </div>
            </div>
            <div className="w-12 h-1 bg-gray-700 rounded-full"></div>
            <div className="w-48 h-16 bg-gray-800 rounded-xl border border-gray-700 flex items-center p-3 gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                <div className="flex flex-col gap-2 flex-1">
                    <div className="h-2 bg-gray-700 rounded w-full"></div>
                    <div className="h-2 bg-gray-700 rounded w-2/3"></div>
                </div>
            </div>
        </div>

        <div className="flex gap-4 items-center pl-24 opacity-70">
            <div className="w-1 h-12 bg-gray-700 rounded-full ml-24"></div>
        </div>

        <div className="flex gap-4 items-center pl-32 opacity-50">
            <div className="w-48 h-16 bg-gray-800 rounded-xl border border-gray-700 flex items-center p-3 gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                <div className="flex flex-col gap-2 flex-1">
                    <div className="h-2 bg-gray-700 rounded w-full"></div>
                    <div className="h-2 bg-gray-700 rounded w-2/3"></div>
                </div>
            </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-t-2 border-accent animate-spin"></div>
            <span className="text-gray-400 font-mono text-sm tracking-widest">BUILDING AST...</span>
        </div>
    </div>
);

export default function FlowchartPanel() {
    const activeView = useTestStore(state => state.activeView);
    const hasFlowchart = useTestStore(state => state.hasFlowchart);
    const isStreaming = useChatStore(state => state.isStreaming);
    const { runTest, abortTest, isRunning } = useTestExecution();

    // Disable inputs if we are a guest in a room
    const roomId = useCollabStore(state => state.roomId);
    const role = useCollabStore(state => state.role);
    const isGuest = Boolean(roomId) && role !== 'Owner';

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] relative">
            {/* Top Toolbar overlay */}
            {hasFlowchart && (
                <div className="absolute top-2 right-4 z-50 flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-2">
                        {!isGuest && (isRunning ? (
                            <button
                                onClick={abortTest}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 rounded-md border border-red-500/30 text-sm font-medium transition-colors shadow-sm"
                            >
                                <Square size={14} className="fill-current" />
                                Stop
                            </button>
                        ) : (
                            <button
                                onClick={runTest}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300 rounded-md border border-green-500/30 text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/40"
                            >
                                <Play size={14} className="fill-current" />
                                Run Test
                            </button>
                        ))}
                        <ViewToggle />
                    </div>
                </div>
            )}

            {/* Conditional Progress bar */}
            {hasFlowchart && (
                <div className="absolute top-0 w-full z-40 pr-32">
                    {/* The right side padding keeps it out from under the toggle */}
                    <ProgressBar />
                </div>
            )}

            <div className="flex-1 w-full relative">
                {!hasFlowchart ? (
                    isStreaming ? (
                        <FlowchartSkeleton />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 font-medium">
                            <div className="text-center">
                                <h3 className="text-lg text-gray-300 mb-2 font-mono">ZeroCode Automation</h3>
                                <p className="text-sm">Describe a test scenario in the chat to begin.</p>
                            </div>
                        </div>
                    )
                ) : activeView === 'flowchart' ? (
                    <FlowchartCanvas />
                ) : (
                    <CodeView />
                )}
            </div>
        </div>
    );
}
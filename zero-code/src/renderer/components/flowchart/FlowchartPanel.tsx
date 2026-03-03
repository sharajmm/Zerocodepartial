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
    <div className="h-full w-full flex flex-col items-center justify-center gap-4">
        <div className="relative">
            <div className="w-10 h-10 rounded-xl border-2 border-accent/30 border-t-accent animate-spin" />
        </div>
        <span className="text-text-muted text-[11px] font-mono tracking-widest uppercase">Generating flowchart...</span>
    </div>
);

export default function FlowchartPanel() {
    const activeView = useTestStore(state => state.activeView);
    const hasFlowchart = useTestStore(state => state.hasFlowchart);
    const isStreaming = useChatStore(state => state.isStreaming);
    const clearFlowchart = useTestStore(state => state.clearFlowchart);
    const { runTest, abortTest, isRunning } = useTestExecution();

    // Disable inputs if we are a guest in a room
    const roomId = useCollabStore(state => state.roomId);
    const role = useCollabStore(state => state.role);
    const isGuest = Boolean(roomId) && role !== 'Owner';

    return (
        <div className="flex flex-col h-full bg-background relative">
            {/* Toolbar */}
            {hasFlowchart && (
                <div className="absolute top-2.5 right-3 z-50 flex items-center gap-1.5">
                    {!isGuest && (isRunning ? (
                        <button
                            onClick={abortTest}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/15 rounded-lg border border-red-500/15 text-[11px] font-medium transition-all"
                        >
                            <Square size={12} className="fill-current" />
                            Stop
                        </button>
                    ) : (
                        <button
                            onClick={runTest}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 rounded-lg border border-emerald-500/15 text-[11px] font-medium transition-all glow-green"
                        >
                            <Play size={12} className="fill-current" />
                            Run
                        </button>
                    ))}
                    <button
                        onClick={clearFlowchart}
                        className="px-2.5 py-1.5 text-text-muted hover:text-text-primary hover:bg-white/[0.04] rounded-lg border border-border text-[11px] font-medium transition-all"
                        title="Clear Flowchart"
                    >
                        Clear
                    </button>
                    <ViewToggle />
                </div>
            )}

            {/* Progress bar */}
            {hasFlowchart && (
                <div className="absolute top-0 w-full z-40 pr-[260px]">
                    <ProgressBar />
                </div>
            )}

            <div className="flex-1 w-full relative">
                {!hasFlowchart ? (
                    isStreaming ? (
                        <FlowchartSkeleton />
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="flex flex-col items-center gap-1 text-center">
                                <h3 className="text-sm font-medium text-text-primary tracking-tight">ZeroCode</h3>
                                <p className="text-[11px] text-text-muted">Describe a test scenario to begin</p>
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
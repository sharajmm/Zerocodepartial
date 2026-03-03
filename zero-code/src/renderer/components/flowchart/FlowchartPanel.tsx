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
    <div className="h-full w-full flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-lg border border-accent/20 border-t-accent/60 animate-spin" />
        <span className="text-text-muted/60 text-[10px] font-mono tracking-wider uppercase">Generating</span>
    </div>
);

export default function FlowchartPanel() {
    const activeView = useTestStore(state => state.activeView);
    const hasFlowchart = useTestStore(state => state.hasFlowchart);
    const isStreaming = useChatStore(state => state.isStreaming);
    const clearFlowchart = useTestStore(state => state.clearFlowchart);
    const { runTest, abortTest, isRunning } = useTestExecution();

    const roomId = useCollabStore(state => state.roomId);
    const role = useCollabStore(state => state.role);
    const isGuest = Boolean(roomId) && role !== 'Owner';

    return (
        <div className="flex flex-col h-full bg-background relative">
            {/* Toolbar */}
            {hasFlowchart && (
                <div className="absolute top-2 right-2.5 z-50 flex items-center gap-1">
                    {!isGuest && (isRunning ? (
                        <button
                            onClick={abortTest}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/8 text-red-400 hover:bg-red-500/12 rounded-md border border-red-500/10 text-[10px] font-medium transition-all"
                        >
                            <Square size={10} className="fill-current" />
                            Stop
                        </button>
                    ) : (
                        <button
                            onClick={runTest}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/12 rounded-md border border-emerald-500/10 text-[10px] font-medium transition-all"
                        >
                            <Play size={10} className="fill-current" />
                            Run
                        </button>
                    ))}
                    <button
                        onClick={clearFlowchart}
                        className="px-2 py-1 text-text-muted/60 hover:text-text-secondary btn-surface rounded-md text-[10px] font-medium"
                        title="Clear"
                    >
                        Clear
                    </button>
                    <ViewToggle />
                </div>
            )}

            {hasFlowchart && (
                <div className="absolute top-0 w-full z-40 pr-[240px]">
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
                                <h3 className="text-sm font-medium text-text-primary tracking-[-0.02em]">ZeroCode</h3>
                                <p className="text-[10px] text-text-muted/60">Describe a test scenario to begin</p>
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
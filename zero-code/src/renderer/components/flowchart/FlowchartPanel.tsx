import { useTestStore } from '../../store/testStore';
import { useTestExecution } from '../../hooks/useTestExecution';
import FlowchartCanvas from './FlowchartCanvas';
import CodeView from './CodeView';
import ProgressBar from './ProgressBar';
import ViewToggle from './ViewToggle';
import { Play, Square } from 'lucide-react';

export default function FlowchartPanel() {
    const activeView = useTestStore(state => state.activeView);
    const hasFlowchart = useTestStore(state => state.hasFlowchart);
    const { runTest, abortTest, isRunning } = useTestExecution();

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] relative">
            {/* Top Toolbar overlay */}
            {hasFlowchart && (
                <div className="absolute top-2 right-4 z-50 flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-2">
                        {isRunning ? (
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
                        )}
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
                    <div className="h-full flex items-center justify-center text-gray-500 font-medium">
                        <div className="text-center">
                            <h3 className="text-lg text-gray-300 mb-2 font-mono">React Flow Automation</h3>
                            <p className="text-sm">Describe a test scenario in the chat to begin.</p>
                        </div>
                    </div>
                ) : activeView === 'flowchart' ? (
                    <FlowchartCanvas />
                ) : (
                    <CodeView />
                )}
            </div>
        </div>
    );
}
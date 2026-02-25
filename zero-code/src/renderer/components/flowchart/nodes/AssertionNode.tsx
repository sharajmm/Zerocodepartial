import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTestStore } from '../../../store/testStore';
import type { FlowchartNode } from '../../../types/flowchart';
import { Loader2, CheckCircle2, XCircle, Eye } from 'lucide-react';

export default function AssertionNode({ id, data, isConnectable }: NodeProps<FlowchartNode>) {
    const status = useTestStore(state => state.stepStatuses[id]) || data.status || 'pending';
    const screenshot = useTestStore(state => state.screenshotPaths[id]) || data.screenshotPath;

    let borderColor = 'border-purple-500/50';
    let bgColor = 'bg-purple-950/20';
    let animationClass = '';
    let Icon = Eye;
    let iconClass = 'text-purple-400';

    if (status === 'running') {
        borderColor = 'border-purple-400';
        animationClass = 'animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-purple-900/40';
        Icon = Loader2;
        iconClass = 'text-purple-300 animate-spin';
    } else if (status === 'passed') {
        borderColor = 'border-green-500/80';
        bgColor = 'bg-green-950/20 shadow-[0_0_8px_rgba(34,197,94,0.15)]';
        Icon = CheckCircle2;
        iconClass = 'text-green-500';
    } else if (status === 'failed') {
        borderColor = 'border-red-500';
        bgColor = 'bg-red-950/30';
        Icon = XCircle;
        iconClass = 'text-red-500';
    }

    return (
        <div className={`relative flex items-center justify-center min-w-[220px] min-h-[90px] transition-all duration-300`}>
            {/* Hexagon/Diamond effect using border manipulation and rotation */}
            <div className={`absolute inset-0 border-2 rounded-lg rotate-3 transform ${bgColor} ${borderColor} ${animationClass} transition-all duration-300`} />
            <div className={`absolute inset-0 border-2 rounded-lg -rotate-3 transform ${bgColor} ${borderColor} ${animationClass} transition-all duration-300 opacity-50`} />

            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-purple-500 !border-purple-900 z-10"
            />

            <div className="z-10 flex flex-col items-center justify-center px-6 py-3 w-full gap-1">
                <div className="flex items-center gap-1.5 justify-center w-full">
                    <Icon size={16} className={iconClass} />
                    <div className="font-semibold text-gray-100 text-sm whitespace-pre-wrap text-center leading-tight">{data.label}</div>
                </div>

                {data.selector && (
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5 break-all text-center bg-gray-950/60 px-2 py-0.5 rounded-full inline-block max-w-[180px] truncate">
                        {data.selector}
                    </div>
                )}

                {screenshot && status === 'failed' && (
                    <div onClick={() => window.electronAPI.evidenceOpenFolder(screenshot.substring(0, screenshot.lastIndexOf('\\')))} className="mt-2 flex transform hover:scale-105 transition-transform cursor-pointer overflow-hidden border border-red-500/30 rounded z-20">
                        <img src={`file://${screenshot}`} className="w-full h-auto max-h-[120px] object-cover" alt="Error Screenshot" />
                    </div>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-purple-500 !border-purple-900 z-10"
            />
        </div>
    );
}
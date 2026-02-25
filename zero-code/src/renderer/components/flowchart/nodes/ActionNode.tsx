import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTestStore } from '../../../store/testStore';
import type { FlowchartNode } from '../../../types/flowchart';
import { Loader2, CheckCircle2, XCircle, MousePointer2 } from 'lucide-react';

export default function ActionNode({ id, data, isConnectable }: NodeProps<FlowchartNode>) {
    const status = useTestStore(state => state.stepStatuses[id]) || data.status || 'pending';
    const screenshot = useTestStore(state => state.screenshotPaths[id]) || data.screenshotPath;

    let borderColor = 'border-gray-600';
    let bgColor = 'bg-gray-900';
    let animationClass = '';
    let Icon = MousePointer2;
    let iconClass = 'text-gray-400';

    if (status === 'running') {
        borderColor = 'border-blue-500';
        animationClass = 'animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-blue-950/20';
        Icon = Loader2;
        iconClass = 'text-blue-400 animate-spin';
    } else if (status === 'passed') {
        borderColor = 'border-green-500/80';
        bgColor = 'bg-green-950/10 shadow-[0_0_8px_rgba(34,197,94,0.15)]';
        Icon = CheckCircle2;
        iconClass = 'text-green-500';
    } else if (status === 'failed') {
        borderColor = 'border-red-500';
        bgColor = 'bg-red-950/30';
        Icon = XCircle;
        iconClass = 'text-red-500';
    }

    return (
        <div className={`px-4 py-3 shadow-md rounded-lg border-2 ${bgColor} ${borderColor} ${animationClass} min-w-[220px] transition-all duration-300`}>
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-gray-600 !border-gray-800"
            />

            <div className="flex flex-col gap-1.5">
                <div className="flex items-start gap-2">
                    <div className="mt-0.5 min-w-5">
                        <Icon size={16} className={iconClass} />
                    </div>
                    <div className="flex flex-col">
                        <div className="font-semibold text-gray-200 text-sm whitespace-pre-wrap">{data.label}</div>
                        {data.selector && (
                            <div className="text-[11px] text-gray-400 font-mono mt-1 break-all bg-gray-950/50 px-1.5 py-0.5 rounded inline-block w-fit">
                                {data.selector}
                            </div>
                        )}
                    </div>
                </div>
                {screenshot && status === 'failed' && (
                    <div onClick={() => window.electronAPI.evidenceOpenFolder(screenshot.substring(0, screenshot.lastIndexOf('\\')))} className="mt-2 flex transform hover:scale-105 transition-transform cursor-pointer overflow-hidden border border-red-500/30 rounded">
                        <img src={`file://${screenshot}`} className="w-full h-auto max-h-[120px] object-cover" alt="Error Screenshot" />
                    </div>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-gray-600 !border-gray-800"
            />
        </div>
    );
}
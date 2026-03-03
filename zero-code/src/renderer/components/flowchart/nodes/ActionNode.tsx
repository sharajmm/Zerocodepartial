import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTestStore } from '../../../store/testStore';
import type { FlowchartNode } from '../../../types/flowchart';
import { Loader2, CheckCircle2, XCircle, MousePointer2 } from 'lucide-react';

export default function ActionNode({ id, data, isConnectable }: NodeProps<FlowchartNode>) {
    const status = useTestStore(state => state.stepStatuses[id]) || data.status || 'pending';
    const screenshot = useTestStore(state => state.screenshotPaths[id]) || data.screenshotPath;

    let borderColor = 'border-border';
    let bgColor = 'bg-surface';
    let animationClass = '';
    let Icon = MousePointer2;
    let iconClass = 'text-text-muted';
    let glowClass = '';

    if (status === 'running') {
        borderColor = 'border-accent/40';
        bgColor = 'bg-accent/5';
        animationClass = 'animate-pulse';
        glowClass = 'glow-accent';
        Icon = Loader2;
        iconClass = 'text-accent animate-spin';
    } else if (status === 'passed') {
        borderColor = 'border-emerald-500/30';
        bgColor = 'bg-emerald-500/5';
        glowClass = 'glow-green';
        Icon = CheckCircle2;
        iconClass = 'text-emerald-500';
    } else if (status === 'failed') {
        borderColor = 'border-red-500/30';
        bgColor = 'bg-red-500/5';
        glowClass = 'glow-red';
        Icon = XCircle;
        iconClass = 'text-red-500';
    }

    return (
        <div className={`px-4 py-3 rounded-xl border ${bgColor} ${borderColor} ${animationClass} ${glowClass} min-w-[200px] transition-all duration-300`}>
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="w-2 h-2 bg-border !border-surface rounded-full"
            />

            <div className="flex items-start gap-2.5">
                <Icon size={14} className={`${iconClass} mt-0.5 shrink-0`} />
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="font-medium text-text-primary text-[12px] leading-snug">{data.label}</div>
                    {data.selector && (
                        <div className="text-[10px] text-text-muted font-mono break-all bg-background px-1.5 py-0.5 rounded w-fit max-w-[180px] truncate">
                            {data.selector}
                        </div>
                    )}
                </div>
            </div>
            {screenshot && status === 'failed' && (
                <div onClick={() => window.electronAPI.evidenceOpenFolder(screenshot.substring(0, screenshot.lastIndexOf('\\')))} className="mt-2 cursor-pointer overflow-hidden border border-red-500/20 rounded-lg hover:border-red-500/40 transition-colors">
                    <img src={`file://${screenshot}`} className="w-full h-auto max-h-[100px] object-cover" alt="Error" />
                </div>
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-2 h-2 bg-border !border-surface rounded-full"
            />
        </div>
    );
}
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTestStore } from '../../../store/testStore';
import type { FlowchartNode } from '../../../types/flowchart';
import { Loader2, CheckCircle2, XCircle, MousePointer2 } from 'lucide-react';

export default function ActionNode({ id, data, isConnectable }: NodeProps<FlowchartNode>) {
    const status = useTestStore(state => state.stepStatuses[id]) || data.status || 'pending';
    const screenshot = useTestStore(state => state.screenshotPaths[id]) || data.screenshotPath;

    let borderColor = 'border-border';
    let bgColor = 'bg-surface/80';
    let animationClass = '';
    let Icon = MousePointer2;
    let iconClass = 'text-text-muted/50';

    if (status === 'running') {
        borderColor = 'border-accent/30';
        bgColor = 'bg-accent/[0.03]';
        animationClass = 'animate-pulse glow-accent';
        Icon = Loader2;
        iconClass = 'text-accent animate-spin';
    } else if (status === 'passed') {
        borderColor = 'border-emerald-500/20';
        bgColor = 'bg-emerald-500/[0.03]';
        Icon = CheckCircle2;
        iconClass = 'text-emerald-400';
    } else if (status === 'failed') {
        borderColor = 'border-red-500/20';
        bgColor = 'bg-red-500/[0.03]';
        Icon = XCircle;
        iconClass = 'text-red-400';
    }

    return (
        <div className={`px-3.5 py-2.5 rounded-lg border ${bgColor} ${borderColor} ${animationClass} min-w-[180px] transition-all duration-300`}>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-1.5 h-1.5 bg-white/10 !border-0 rounded-full" />

            <div className="flex items-start gap-2">
                <Icon size={12} className={`${iconClass} mt-0.5 shrink-0`} />
                <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="font-medium text-text-primary text-[11px] leading-snug">{data.label}</div>
                    {data.selector && (
                        <div className="text-[9px] text-text-muted/60 font-mono break-all bg-white/[0.02] px-1.5 py-0.5 rounded w-fit max-w-[160px] truncate">
                            {data.selector}
                        </div>
                    )}
                </div>
            </div>
            {screenshot && status === 'failed' && (
                <div onClick={() => window.electronAPI.evidenceOpenFolder(screenshot.substring(0, screenshot.lastIndexOf('\\')))} className="mt-2 cursor-pointer overflow-hidden border border-red-500/15 rounded hover:border-red-500/30 transition-colors">
                    <img src={`file://${screenshot}`} className="w-full h-auto max-h-[80px] object-cover" alt="Error" />
                </div>
            )}

            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-1.5 h-1.5 bg-white/10 !border-0 rounded-full" />
        </div>
    );
}
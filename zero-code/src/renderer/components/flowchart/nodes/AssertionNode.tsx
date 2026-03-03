import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTestStore } from '../../../store/testStore';
import type { FlowchartNode } from '../../../types/flowchart';
import { Loader2, CheckCircle2, XCircle, Eye } from 'lucide-react';

export default function AssertionNode({ id, data, isConnectable }: NodeProps<FlowchartNode>) {
    const status = useTestStore(state => state.stepStatuses[id]) || data.status || 'pending';
    const screenshot = useTestStore(state => state.screenshotPaths[id]) || data.screenshotPath;

    let borderColor = 'border-purple-500/15';
    let bgColor = 'bg-purple-500/[0.03]';
    let animationClass = '';
    let Icon = Eye;
    let iconClass = 'text-purple-400/60';

    if (status === 'running') {
        borderColor = 'border-purple-400/30';
        bgColor = 'bg-purple-500/[0.05]';
        animationClass = 'animate-pulse';
        Icon = Loader2;
        iconClass = 'text-purple-300 animate-spin';
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
        <div className={`relative min-w-[180px] min-h-[60px] transition-all duration-300`}>
            <div className={`absolute inset-0 border rounded-lg rotate-1 ${bgColor} ${borderColor} ${animationClass} transition-all duration-300`} />
            <div className={`absolute inset-0 border rounded-lg -rotate-1 ${bgColor} ${borderColor} transition-all duration-300 opacity-30`} />

            <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-1.5 h-1.5 bg-purple-400/30 !border-0 z-10 rounded-full" />

            <div className="z-10 relative flex flex-col items-center justify-center px-4 py-2.5 gap-0.5">
                <div className="flex items-center gap-1.5 w-full justify-center">
                    <Icon size={12} className={`${iconClass} shrink-0`} />
                    <div className="font-medium text-text-primary text-[11px] text-center leading-snug">{data.label}</div>
                </div>

                {data.selector && (
                    <div className="text-[9px] text-text-muted/50 font-mono bg-white/[0.02] px-2 py-0.5 rounded-full max-w-[150px] truncate text-center">
                        {data.selector}
                    </div>
                )}

                {screenshot && status === 'failed' && (
                    <div onClick={() => window.electronAPI.evidenceOpenFolder(screenshot.substring(0, screenshot.lastIndexOf('\\')))} className="mt-1.5 cursor-pointer overflow-hidden border border-red-500/15 rounded z-20 hover:border-red-500/30 transition-colors">
                        <img src={`file://${screenshot}`} className="w-full h-auto max-h-[80px] object-cover" alt="Error" />
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-1.5 h-1.5 bg-purple-400/30 !border-0 z-10 rounded-full" />
        </div>
    );
}
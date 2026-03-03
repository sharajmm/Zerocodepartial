import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTestStore } from '../../../store/testStore';
import type { FlowchartNode } from '../../../types/flowchart';
import { Loader2, CheckCircle2, XCircle, Eye } from 'lucide-react';

export default function AssertionNode({ id, data, isConnectable }: NodeProps<FlowchartNode>) {
    const status = useTestStore(state => state.stepStatuses[id]) || data.status || 'pending';
    const screenshot = useTestStore(state => state.screenshotPaths[id]) || data.screenshotPath;

    let borderColor = 'border-purple-500/20';
    let bgColor = 'bg-purple-500/5';
    let animationClass = '';
    let Icon = Eye;
    let iconClass = 'text-purple-400';
    let glowClass = '';

    if (status === 'running') {
        borderColor = 'border-purple-400/40';
        bgColor = 'bg-purple-500/10';
        animationClass = 'animate-pulse';
        Icon = Loader2;
        iconClass = 'text-purple-300 animate-spin';
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
        <div className={`relative min-w-[200px] min-h-[70px] transition-all duration-300`}>
            {/* Subtle diamond overlay */}
            <div className={`absolute inset-0 border rounded-xl rotate-1 ${bgColor} ${borderColor} ${animationClass} ${glowClass} transition-all duration-300`} />
            <div className={`absolute inset-0 border rounded-xl -rotate-1 ${bgColor} ${borderColor} ${animationClass} transition-all duration-300 opacity-40`} />

            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="w-2 h-2 bg-purple-500/50 !border-surface z-10 rounded-full"
            />

            <div className="z-10 relative flex flex-col items-center justify-center px-5 py-3 gap-1">
                <div className="flex items-center gap-2 w-full justify-center">
                    <Icon size={14} className={`${iconClass} shrink-0`} />
                    <div className="font-medium text-text-primary text-[12px] text-center leading-snug">{data.label}</div>
                </div>

                {data.selector && (
                    <div className="text-[10px] text-text-muted font-mono bg-background/60 px-2 py-0.5 rounded-full max-w-[170px] truncate text-center">
                        {data.selector}
                    </div>
                )}

                {screenshot && status === 'failed' && (
                    <div onClick={() => window.electronAPI.evidenceOpenFolder(screenshot.substring(0, screenshot.lastIndexOf('\\')))} className="mt-2 cursor-pointer overflow-hidden border border-red-500/20 rounded-lg z-20 hover:border-red-500/40 transition-colors">
                        <img src={`file://${screenshot}`} className="w-full h-auto max-h-[100px] object-cover" alt="Error" />
                    </div>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-2 h-2 bg-purple-500/50 !border-surface z-10 rounded-full"
            />
        </div>
    );
}
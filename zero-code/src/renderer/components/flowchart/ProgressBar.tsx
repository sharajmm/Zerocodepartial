import { useTestStore } from '../../store/testStore';

export default function ProgressBar() {
    const nodes = useTestStore(state => state.nodes);
    const statuses = useTestStore(state => state.stepStatuses);

    if (!nodes || nodes.length === 0) return null;
    if (Object.keys(statuses).length === 0) return null;

    const totalSteps = nodes.length;
    const allStatuses = Object.values(statuses);
    const failedSteps = allStatuses.filter(s => s === 'failed').length;
    const passedSteps = allStatuses.filter(s => s === 'passed').length;
    const completedSteps = passedSteps + failedSteps;
    const progressPercent = Math.min((completedSteps / totalSteps) * 100, 100);

    let barColor = 'bg-accent/50';
    let textColor = 'text-accent/70';
    let statusText = 'Running';

    if (failedSteps > 0) {
        barColor = 'bg-red-400/60';
        textColor = 'text-red-400/80';
        statusText = 'Failed';
    } else if (passedSteps === totalSteps) {
        barColor = 'bg-emerald-400/50';
        textColor = 'text-emerald-400/80';
        statusText = 'Passed';
    }

    return (
        <div className="flex items-center gap-2 px-3 py-1 bg-surface/60 backdrop-blur-sm border-b border-border">
            <span className={`text-[9px] font-semibold tracking-wider uppercase ${textColor} min-w-[40px]`}>{statusText}</span>
            <div className="flex-1 h-[2px] bg-white/[0.03] rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                    style={{ width: `${Math.max(progressPercent, 2)}%` }}
                />
            </div>
            <span className="text-[9px] text-text-muted/50 font-mono tabular-nums">{completedSteps}/{totalSteps}</span>
        </div>
    );
}
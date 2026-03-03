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

    let barColor = 'bg-accent';
    let textColor = 'text-accent';
    let statusText = 'Running...';

    if (failedSteps > 0) {
        barColor = 'bg-red-500';
        textColor = 'text-red-400';
        statusText = 'Failed';
    } else if (passedSteps === totalSteps) {
        barColor = 'bg-emerald-500';
        textColor = 'text-emerald-400';
        statusText = 'Passed';
    }

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface/80 backdrop-blur-sm border-b border-border">
            <span className={`text-[10px] font-semibold ${textColor} min-w-[50px]`}>{statusText}</span>
            <div className="flex-1 h-1 bg-background rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                    style={{ width: `${Math.max(progressPercent, 3)}%` }}
                />
            </div>
            <span className="text-[10px] text-text-muted font-mono tabular-nums">{completedSteps}/{totalSteps}</span>
        </div>
    );
}
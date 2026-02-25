import { useTestStore } from '../../store/testStore';

export default function ProgressBar() {
    const nodes = useTestStore(state => state.nodes);
    const statuses = useTestStore(state => state.stepStatuses);

    if (!nodes || nodes.length === 0) return null;
    if (Object.keys(statuses).length === 0) return null; // Pre-run state

    const totalSteps = nodes.length;
    const allStatuses = Object.values(statuses);

    // Status metrics
    const failedSteps = allStatuses.filter(s => s === 'failed').length;
    const passedSteps = allStatuses.filter(s => s === 'passed').length;

    const completedSteps = passedSteps + failedSteps;
    const progressPercent = Math.min((completedSteps / totalSteps) * 100, 100);

    // Color logic
    let barColor = 'bg-blue-500';
    let textColor = 'text-blue-400';
    let statusText = 'Running Test...';

    if (failedSteps > 0) {
        barColor = 'bg-red-500';
        textColor = 'text-red-400';
        statusText = 'Test Failed';
    } else if (passedSteps === totalSteps) {
        barColor = 'bg-green-500';
        textColor = 'text-green-400';
        statusText = 'Test Passed';
    }

    return (
        <div className="w-full flex flex-col gap-1 px-4 py-2 border-b border-gray-800 bg-gray-900 shadow-sm z-10">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                <span className={textColor}>{statusText}</span>
                <span className="text-gray-400">{completedSteps} / {totalSteps} Steps</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.max(progressPercent, 5)}%` }} // Minimum 5% to show active running
                />
            </div>
        </div>
    );
}
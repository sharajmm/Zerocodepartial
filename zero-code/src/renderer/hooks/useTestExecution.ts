import { useEffect } from 'react';
import { useTestStore } from '../store/testStore';
import { useBrowserStore } from '../store/browserStore';

export function useTestExecution() {
    const { code, nodes, setIsRunning, setStepStatus, resetStepStatuses, isRunning } = useTestStore();
    const currentUrl = useBrowserStore(state => state.currentUrl);

    useEffect(() => {
        window.electronAPI.onTestStepResult((data: any) => {
            const { stepIndex, status, screenshotPath } = data;

            // Handle catastrophic failures on CURRENT step
            if (stepIndex === 'CURRENT') {
                // Try to find the first running or pending node
                const currentState = useTestStore.getState();
                const nodes = currentState.nodes;
                let targetNodeId = nodes[0]?.id;
                for (let i = 0; i < nodes.length; i++) {
                    if (currentState.stepStatuses[nodes[i].id] === 'running' || currentState.stepStatuses[nodes[i].id] === 'pending') {
                        targetNodeId = nodes[i].id;
                        break;
                    }
                }
                if (targetNodeId) {
                    setStepStatus(targetNodeId, 'failed', screenshotPath);
                }
                return;
            }

            const nodeId = String(stepIndex);
            if (stepIndex === 0) return; // goto step

            setStepStatus(nodeId, status);

            // Automatically set the NEXT step to running if this one passed
            if (status === 'passed') {
                const nextNodeId = String(stepIndex + 1);
                // Check if the next node actually exists before marking it running
                const nextNodeExists = useTestStore.getState().nodes.some(n => n.id === nextNodeId);
                if (nextNodeExists) {
                    setStepStatus(nextNodeId, 'running');
                }
            }
        });

        window.electronAPI.onTestComplete((data: any) => {
            setIsRunning(false);
            if (data.success) {
                console.log("Test completed successfully!");
            } else {
                console.error("Test failed at some point.");
            }

            // Clean up node listeners
            window.electronAPI.removeAllListeners('test:step-result');
            window.electronAPI.removeAllListeners('test:complete');
        });

        return () => {
            window.electronAPI.removeAllListeners('test:step-result');
            window.electronAPI.removeAllListeners('test:complete');
        };
    }, [setIsRunning, setStepStatus]);

    const runTest = () => {
        if (!code || !currentUrl || nodes.length === 0) return;

        resetStepStatuses();

        setIsRunning(true);
        // Set the first step to running optimistically
        setStepStatus('1', 'running');

        // Generate session ID for evidence tracking
        const sessionId = Date.now().toString();
        // optionally save it in store
        useTestStore.setState({ sessionId });

        window.electronAPI.testStart({ code, url: currentUrl, steps: nodes, sessionId });
    };

    const abortTest = () => {
        window.electronAPI.testAbort();
        setIsRunning(false);
    };

    return {
        runTest,
        abortTest,
        isRunning
    };
}
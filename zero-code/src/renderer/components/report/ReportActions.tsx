import { useState } from 'react';
import { useTestStore } from '../../store/testStore';
import { useBrowserStore } from '../../store/browserStore';
import { useChatStore } from '../../store/chatStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import type { TestSession } from '../../types/test';
import { FileText, FolderOpen, Download, FileCheck, Loader2 } from 'lucide-react';

export default function ReportActions() {
    const { nodes, stepStatuses, screenshotPaths, code, sessionId, lastReportPath, setLastReportPath, isRunning } = useTestStore();
    const currentUrl = useBrowserStore(state => state.currentUrl);
    const activeFolder = useWorkspaceStore(state => state.activeFolder);
    const chatState = useChatStore();

    const [isGenerating, setIsGenerating] = useState(false);

    // Don't show if test is still running or never ran (no statuses)
    const hasStatuses = Object.keys(stepStatuses).length > 0;
    if (isRunning || !hasStatuses) return null;

    const hasFailures = nodes.some(n => stepStatuses[n.id] === 'failed');

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const lastUserMsg = [...chatState.messages].reverse().find(m => m.role === 'user');
            const description = lastUserMsg ? lastUserMsg.content : 'Automated Playwright Test execution';

            let passed = 0;
            let failed = 0;

            const steps = nodes.map(n => {
                let status = stepStatuses[n.id] || 'pending';
                if (status === 'running') status = 'failed';

                if (status === 'passed') passed++;
                if (status === 'failed') failed++;

                return {
                    index: parseInt(n.id) || 0,
                    label: n.data.label as string,
                    type: n.data.type as 'action' | 'assertion',
                    status: status as 'pending' | 'passed' | 'failed',
                    error: undefined,
                    screenshotPath: screenshotPaths[n.id],
                };
            });

            const session: TestSession = {
                sessionId,
                url: currentUrl,
                description,
                date: new Date().toLocaleString(),
                steps,
                code,
                totalPassed: passed,
                totalFailed: failed,
                activeFolder: activeFolder || undefined
            } as any;

            const { pdfPath } = await window.electronAPI.reportGenerate(session);
            setLastReportPath(pdfPath);
        } catch (error) {
            console.error('Failed to generate report', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOpenPdf = () => {
        if (lastReportPath) {
            // Using electronAPI or evidenceOpenFolder
            // Wait, there's no openPath explicitly exposed, but evidenceOpenFolder opens files?
            // "opens the PDF directly using shell.openPath()" is a main process API.
            // Let's rely on evidenceOpenFolder to just open the evidence directory, or create an openFile IPC.
            // Wait, shell.openPath works on files too. Let's just use evidenceOpenFolder which calls shell.openPath.
            window.electronAPI.evidenceOpenFolder(lastReportPath);
        }
    };

    const handleExportPdf = async () => {
        if (lastReportPath) {
            await window.electronAPI.reportExport(lastReportPath);
        }
    };

    const handleOpenEvidence = () => {
        if (sessionId) {
            // We can guess the directory or just pass the last report path and let the OS open its parent
            if (lastReportPath) {
                // Since evidenceOpenFolder uses shell.openPath, it will open the file if it's a file, or the dir if it's a dir.
                // We want the evidence folder.
                // It's saved in userData/zero-code-evidence/sessionId
                // Wait! evidenceOpenFolder(folderPath) opens what we give it.
                // For evidence folder, we could give the screenshot path parent.
                const failedScreenshot = Object.values(screenshotPaths)[0];
                if (failedScreenshot) {
                    window.electronAPI.evidenceOpenFolder(failedScreenshot);
                } else if (lastReportPath) {
                    window.electronAPI.evidenceOpenFolder(lastReportPath);
                }
            }
        }
    };

    return (
        <div className="flex flex-col gap-2 p-3 bg-gray-900 border border-gray-800 rounded-lg mt-2 shadow-sm text-sm">
            {!lastReportPath && !isGenerating ? (
                <button
                    onClick={handleGenerate}
                    className="flex w-full justify-center items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                    <FileText size={16} />
                    Generate Report
                </button>
            ) : isGenerating ? (
                <button disabled className="flex w-full justify-center items-center gap-2 px-3 py-2 bg-gray-800 text-gray-400 rounded cursor-not-allowed">
                    <Loader2 size={16} className="animate-spin" />
                    Generating Report...
                </button>
            ) : (
                <>
                    <div className="flex items-center gap-2 text-green-400 mb-1 font-medium pb-2 border-b border-gray-800">
                        <FileCheck size={16} />
                        Report Ready
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleOpenPdf}
                            className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded transition-colors"
                        >
                            <FileText size={14} />
                            Open PDF
                        </button>
                        <button
                            onClick={handleExportPdf}
                            className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded transition-colors"
                        >
                            <Download size={14} />
                            Export PDF
                        </button>
                    </div>
                </>
            )}

            {hasFailures && (
                <button
                    onClick={handleOpenEvidence}
                    className="flex w-full justify-center items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded transition-colors mt-2"
                >
                    <FolderOpen size={14} />
                    Open Evidence Folder
                </button>
            )}
        </div>
    );
}
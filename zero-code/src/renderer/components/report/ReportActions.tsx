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
            if (lastReportPath) {
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
        <div className="mx-2 mt-1 mb-1 p-2.5 bg-background border border-border rounded-xl text-xs shrink-0">
            {!lastReportPath && !isGenerating ? (
                <button
                    onClick={handleGenerate}
                    className="flex w-full justify-center items-center gap-1.5 px-3 py-2 bg-accent/10 hover:bg-accent/15 text-accent rounded-lg border border-accent/10 transition-all text-[11px] font-medium"
                >
                    <FileText size={13} />
                    Generate Report
                </button>
            ) : isGenerating ? (
                <button disabled className="flex w-full justify-center items-center gap-1.5 px-3 py-2 bg-background text-text-muted rounded-lg border border-border cursor-not-allowed text-[11px]">
                    <Loader2 size={13} className="animate-spin" />
                    Generating...
                </button>
            ) : (
                <>
                    <div className="flex items-center gap-1.5 text-emerald-400 mb-2 text-[11px] font-medium">
                        <FileCheck size={13} />
                        Report Ready
                    </div>
                    <div className="flex gap-1.5">
                        <button
                            onClick={handleOpenPdf}
                            className="flex-1 flex justify-center items-center gap-1 px-2 py-1.5 bg-surface hover:bg-white/[0.04] text-text-secondary rounded-lg border border-border transition-all text-[10px] font-medium"
                        >
                            <FileText size={11} />
                            Open
                        </button>
                        <button
                            onClick={handleExportPdf}
                            className="flex-1 flex justify-center items-center gap-1 px-2 py-1.5 bg-accent/10 hover:bg-accent/15 text-accent rounded-lg border border-accent/10 transition-all text-[10px] font-medium"
                        >
                            <Download size={11} />
                            Export
                        </button>
                    </div>
                </>
            )}

            {hasFailures && (
                <button
                    onClick={handleOpenEvidence}
                    className="flex w-full justify-center items-center gap-1.5 px-3 py-1.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400 rounded-lg transition-all mt-1.5 text-[10px] font-medium"
                >
                    <FolderOpen size={11} />
                    Evidence
                </button>
            )}
        </div>
    );
}
import { useState } from 'react';
import { useWorkspaceStore, type RTMTask } from '../../store/workspaceStore';
import { useOllamaStream } from '../../hooks/useOllamaStream';
import { Upload, Play, CheckCircle2, XCircle, Clock, Loader2, FileText } from 'lucide-react';

export default function RTMTaskPanel() {
    const activeFolder = useWorkspaceStore(state => state.activeFolder);
    const rtmTasks = useWorkspaceStore(state => state.rtmTasks);
    const rtmFileName = useWorkspaceStore(state => state.rtmFileName);
    const setRtmTasks = useWorkspaceStore(state => state.setRtmTasks);
    const setRtmFileName = useWorkspaceStore(state => state.setRtmFileName);
    const updateTaskStatus = useWorkspaceStore(state => state.updateTaskStatus);
    const { sendQuery } = useOllamaStream();

    const [isParsing, setIsParsing] = useState(false);

    const handleUploadRtm = async () => {
        if (!activeFolder) {
            alert('Please open a workspace folder first before uploading an RTM document.');
            return;
        }

        const result = await window.electronAPI.workspaceUploadRtm();
        if (!result) return;

        setRtmFileName(result.fileName);
        setIsParsing(true);

        try {
            await window.electronAPI.workspaceSaveFile(
                `${activeFolder}\\${result.fileName}`,
                result.content
            );
        } catch (e) {
            console.error('Failed to save RTM to workspace', e);
        }

        const tasks = parseRtmContent(result.content);
        setRtmTasks(tasks);

        try {
            await window.electronAPI.workspaceSaveFile(
                `${activeFolder}\\tasks.json`,
                JSON.stringify(tasks, null, 2)
            );
        } catch (e) {
            console.error('Failed to save tasks.json', e);
        }

        setIsParsing(false);
    };

    const handleRunTask = async (task: RTMTask) => {
        if (!activeFolder) return;

        updateTaskStatus(task.id, 'running');

        const query = `Generate a Playwright test for the following requirement:\n\nTitle: ${task.title}\nDescription: ${task.description}\n\nWrite just the Playwright test code.`;

        sendQuery(query);
        updateTaskStatus(task.id, 'pending');
    };

    if (rtmTasks.length === 0 && !isParsing) {
        return (
            <div className="mx-2 mb-1 shrink-0">
                <button
                    onClick={handleUploadRtm}
                    className="flex w-full items-center justify-center gap-1.5 px-3 py-2 bg-purple-500/8 hover:bg-purple-500/12 text-purple-400 border border-purple-500/10 rounded-xl text-[11px] font-medium transition-all"
                    title={!activeFolder ? 'Open a folder first' : 'Upload RTM Document'}
                >
                    <Upload size={12} />
                    Upload RTM
                </button>
                {!activeFolder && (
                    <p className="text-[9px] text-text-muted text-center mt-1">Open folder first</p>
                )}
            </div>
        );
    }

    return (
        <div className="mx-2 mb-1 p-2 bg-background border border-border rounded-xl shrink-0">
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                    <FileText size={11} className="text-purple-400" />
                    <span className="text-[10px] font-mono text-text-muted truncate max-w-[100px]">{rtmFileName}</span>
                </div>
                <button
                    onClick={handleUploadRtm}
                    className="text-[9px] text-text-muted hover:text-text-secondary transition-colors"
                >
                    Replace
                </button>
            </div>

            {isParsing ? (
                <div className="flex items-center gap-1.5 text-purple-400 text-[10px] py-2 justify-center">
                    <Loader2 size={12} className="animate-spin" />
                    Parsing...
                </div>
            ) : (
                <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto">
                    {rtmTasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.02] text-[10px] group transition-colors"
                        >
                            <StatusIcon status={task.status} />
                            <div className="flex-1 min-w-0">
                                <p className="text-text-secondary truncate font-medium">{task.title}</p>
                                <p className="text-text-muted truncate text-[9px]">{task.description}</p>
                            </div>
                            <button
                                onClick={() => handleRunTask(task)}
                                disabled={task.status === 'running'}
                                className="p-1 rounded-md hover:bg-emerald-500/10 text-text-muted hover:text-emerald-400 transition-all disabled:opacity-40 opacity-0 group-hover:opacity-100"
                                title="Run"
                            >
                                <Play size={10} fill="currentColor" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatusIcon({ status }: { status: RTMTask['status'] }) {
    switch (status) {
        case 'passed':
            return <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />;
        case 'failed':
            return <XCircle size={12} className="text-red-500 shrink-0" />;
        case 'running':
            return <Loader2 size={12} className="text-accent animate-spin shrink-0" />;
        default:
            return <Clock size={12} className="text-text-muted/50 shrink-0" />;
    }
}

function parseRtmContent(content: string): RTMTask[] {
    const tasks: RTMTask[] = [];
    const lines = content.split('\n').filter(l => l.trim());

    // Try JSON first
    try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
            return parsed.map((item: any, i: number) => ({
                id: `rtm-${i + 1}`,
                title: item.title || item.name || item.requirement || `Task ${i + 1}`,
                description: item.description || item.details || item.steps || JSON.stringify(item),
                status: 'pending' as const,
            }));
        }
    } catch {
        // Not JSON, try line-based parsing
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#') || line.startsWith('//')) continue;

        if (line.includes(',')) {
            const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
            if (parts.length >= 2) {
                tasks.push({
                    id: `rtm-${tasks.length + 1}`,
                    title: parts[0],
                    description: parts.slice(1).join(' - '),
                    status: 'pending',
                });
                continue;
            }
        }

        const numbered = line.match(/^\d+[\.)\]]\s*(.+)/);
        if (numbered) {
            tasks.push({
                id: `rtm-${tasks.length + 1}`,
                title: numbered[1],
                description: numbered[1],
                status: 'pending',
            });
            continue;
        }

        const bulleted = line.match(/^[-*•]\s*(.+)/);
        if (bulleted) {
            tasks.push({
                id: `rtm-${tasks.length + 1}`,
                title: bulleted[1],
                description: bulleted[1],
                status: 'pending',
            });
            continue;
        }

        if (line.length > 3) {
            tasks.push({
                id: `rtm-${tasks.length + 1}`,
                title: line.length > 60 ? line.substring(0, 57) + '...' : line,
                description: line,
                status: 'pending',
            });
        }
    }

    return tasks;
}

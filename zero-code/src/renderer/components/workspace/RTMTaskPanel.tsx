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

        // Save the uploaded RTM file into the active folder
        try {
            await window.electronAPI.workspaceSaveFile(
                `${activeFolder}\\${result.fileName}`,
                result.content
            );
        } catch (e) {
            console.error('Failed to save RTM to workspace', e);
        }

        // Parse the content into tasks
        const tasks = parseRtmContent(result.content);
        setRtmTasks(tasks);

        // Save tasks.json into the workspace folder
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

        // Send the task to Ollama for test code generation
        const query = `Generate a Playwright test for the following requirement:\n\nTitle: ${task.title}\nDescription: ${task.description}\n\nWrite just the Playwright test code.`;

        sendQuery(query);
        // The code generation happens via the existing chat + flowchart pipeline
        // Mark as pending (the actual pass/fail comes from test execution)
        updateTaskStatus(task.id, 'pending');
    };

    if (rtmTasks.length === 0 && !isParsing) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 p-4">
                <button
                    onClick={handleUploadRtm}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-600/30 rounded-md text-sm font-medium transition-colors"
                    title={!activeFolder ? 'Open a folder first' : 'Upload RTM Document'}
                >
                    <Upload size={14} />
                    Upload RTM
                </button>
                {!activeFolder && (
                    <p className="text-[10px] text-gray-500 text-center">Open a workspace folder first</p>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 p-2">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <FileText size={12} className="text-purple-400" />
                    <span className="text-xs font-mono text-gray-400 truncate max-w-[120px]">{rtmFileName}</span>
                </div>
                <button
                    onClick={handleUploadRtm}
                    className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
                >
                    Replace
                </button>
            </div>

            {isParsing ? (
                <div className="flex items-center gap-2 text-purple-400 text-xs p-3">
                    <Loader2 size={14} className="animate-spin" />
                    Parsing RTM...
                </div>
            ) : (
                <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                    {rtmTasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-center gap-2 p-2 bg-gray-900 border border-gray-800 rounded-md text-xs group hover:border-gray-700 transition-colors"
                        >
                            <StatusIcon status={task.status} />
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-200 truncate font-medium">{task.title}</p>
                                <p className="text-gray-500 truncate text-[10px]">{task.description}</p>
                            </div>
                            <button
                                onClick={() => handleRunTask(task)}
                                disabled={task.status === 'running'}
                                className="p-1.5 rounded hover:bg-green-600/20 text-gray-500 hover:text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
                                title="Run this task"
                            >
                                <Play size={12} fill="currentColor" />
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
            return <CheckCircle2 size={14} className="text-green-500 shrink-0" />;
        case 'failed':
            return <XCircle size={14} className="text-red-500 shrink-0" />;
        case 'running':
            return <Loader2 size={14} className="text-blue-400 animate-spin shrink-0" />;
        default:
            return <Clock size={14} className="text-gray-600 shrink-0" />;
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

    // CSV-like or line-based parsing
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#') || line.startsWith('//')) continue;

        // Handle CSV with commas
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

        // Handle numbered lines: "1. Task title"
        const numbered = line.match(/^\d+[\.\)]\s*(.+)/);
        if (numbered) {
            tasks.push({
                id: `rtm-${tasks.length + 1}`,
                title: numbered[1],
                description: numbered[1],
                status: 'pending',
            });
            continue;
        }

        // Handle dash/bullet lines: "- Task title"
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

        // Fallback: treat each line as a task
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

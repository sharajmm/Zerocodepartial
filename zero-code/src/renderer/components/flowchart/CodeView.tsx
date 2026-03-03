import { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import { useTestStore } from '../../store/testStore';
import { useOllamaStream } from '../../hooks/useOllamaStream';
import { Copy, RefreshCw, Check } from 'lucide-react';
import Editor from 'react-simple-code-editor';

export default function CodeView() {
    const code = useTestStore(state => state.code);
    const setCode = useTestStore(state => state.setCode);
    const { sendQuery } = useOllamaStream();
    const [localCode, setLocalCode] = useState(code);
    const [isSyncing, setIsSyncing] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setLocalCode(code);
    }, [code]);

    const handleCopy = () => {
        navigator.clipboard.writeText(localCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSync = () => {
        setIsSyncing(true);
        setCode(localCode);
        sendQuery(`I manually updated the Playwright code to the following:\n\n\`\`\`javascript\n${localCode}\n\`\`\`\n\nPlease parse this updated script and completely regenerate the JSON flowchart (nodes/edges) to accurately match the logic in this script. Send back ONLY the JSON payload with both the "flowchart" array and this exact matching "playwright_code". No conversational text.`);
        setTimeout(() => setIsSyncing(false), 2000);
    };

    const hasChanges = code !== localCode;

    if (!code) {
        return (
            <div className="flex h-full items-center justify-center text-text-muted text-xs">
                Generating code...
            </div>
        );
    }

    return (
        <div className="relative h-full flex flex-col bg-background">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-surface border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted font-mono">spec.ts</span>
                    {hasChanges && (
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-accent/10 text-accent hover:bg-accent/15 border border-accent/10 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={10} className={isSyncing ? "animate-spin" : ""} />
                            {isSyncing ? "Syncing..." : "Sync"}
                        </button>
                    )}
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-white/[0.04] transition-colors text-[10px]"
                    title="Copy"
                >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                <Editor
                    value={localCode}
                    onValueChange={code => setLocalCode(code)}
                    highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
                    padding={16}
                    style={{
                        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                        fontSize: 12,
                        lineHeight: 1.7,
                        minHeight: '100%',
                        backgroundColor: 'transparent',
                        color: '#c5c8c6'
                    }}
                    className="editor-container"
                    textareaClassName="focus:outline-none"
                />
            </div>
        </div>
    );
}
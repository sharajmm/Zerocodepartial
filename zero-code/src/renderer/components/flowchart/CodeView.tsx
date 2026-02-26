import { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import { useTestStore } from '../../store/testStore';
import { useOllamaStream } from '../../hooks/useOllamaStream';
import { Copy, RefreshCw } from 'lucide-react';
import Editor from 'react-simple-code-editor';

export default function CodeView() {
    const code = useTestStore(state => state.code);
    const setCode = useTestStore(state => state.setCode);
    const { sendQuery } = useOllamaStream();
    const [localCode, setLocalCode] = useState(code);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        setLocalCode(code);
    }, [code]);

    const handleCopy = () => {
        navigator.clipboard.writeText(localCode);
    };

    const handleSync = () => {
        setIsSyncing(true);
        setCode(localCode); // Save to the global store immediately to execute, but now we must sync AST
        sendQuery(`I manually updated the Playwright code to the following:\n\n\`\`\`javascript\n${localCode}\n\`\`\`\n\nPlease parse this updated script and completely regenerate the JSON flowchart (nodes/edges) to accurately match the logic in this script. Send back ONLY the JSON payload with both the "flowchart" array and this exact matching "playwright_code". No conversational text.`);

        // Let the normal stream handle the response 
        setTimeout(() => setIsSyncing(false), 2000);
    };

    const hasChanges = code !== localCode;

    if (!code) {
        return (
            <div className="flex h-full items-center justify-center text-gray-500">
                <p>Generating Code...</p>
            </div>
        );
    }

    return (
        <div className="relative h-full flex flex-col bg-[#1d1f21]">
            {/* Top Bar inside Code View */}
            <div className="absolute top-0 right-0 p-2 z-10 flex gap-2 w-full justify-between items-center bg-black/20 backdrop-blur-sm border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-mono px-2">playwright-script.spec.ts</span>
                    {hasChanges && (
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded transition-colors ${isSyncing ? 'bg-accent/40 text-black' : 'bg-accent text-black hover:bg-accent/80'}`}
                            title="Update AST flowchart to match this manually edited code"
                        >
                            <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                            {isSyncing ? "Syncing AST..." : "Sync Flowchart"}
                        </button>
                    )}
                </div>
                <button
                    onClick={handleCopy}
                    className="p-1.5 bg-gray-800 text-gray-300 hover:text-white rounded hover:bg-gray-700 transition"
                    title="Copy to clipboard"
                >
                    <Copy size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-auto pt-10 pb-4">
                <Editor
                    value={localCode}
                    onValueChange={code => setLocalCode(code)}
                    highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
                    padding={16}
                    style={{
                        fontFamily: '"Fira Code", "Consolas", monospace',
                        fontSize: 14,
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
import { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import { useTestStore } from '../../store/testStore';
import { Copy } from 'lucide-react';

export default function CodeView() {
    const code = useTestStore(state => state.code);

    useEffect(() => {
        Prism.highlightAll();
    }, [code]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
    };

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
                <span className="text-xs text-gray-400 font-mono px-2">playwright-script.spec.ts</span>
                <button
                    onClick={handleCopy}
                    className="p-1.5 bg-gray-800 text-gray-300 hover:text-white rounded hover:bg-gray-700 transition"
                    title="Copy to clipboard"
                >
                    <Copy size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-auto pt-10">
                <pre className="!m-0 !bg-transparent text-sm h-full">
                    <code className="language-javascript">
                        {code}
                    </code>
                </pre>
            </div>
        </div>
    );
}
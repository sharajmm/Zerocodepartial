import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Search } from 'lucide-react';
import { useBrowserStore } from '../../store/browserStore';

export default function EmbeddedBrowser() {
    const { currentUrl, setCurrentUrl } = useBrowserStore();
    const [inputUrl, setInputUrl] = useState(currentUrl);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Sync external navigation changes to the input field
        setInputUrl(currentUrl);
    }, [currentUrl]);

    useEffect(() => {
        // Mount the BrowserView
        if (!containerRef.current) return;

        const mountBrowser = async () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            await window.electronAPI.browserMount({
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            });
        };

        // Slight delay to ensure layout is done
        const timeoutId = setTimeout(mountBrowser, 100);

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { x, y, width, height } = entry.target.getBoundingClientRect();
                window.electronAPI.browserResize({ x, y, width, height });
            }
        });
        observer.observe(containerRef.current);

        window.electronAPI.onBrowserNavigated(({ url }) => {
            setCurrentUrl(url);
        });

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
            window.electronAPI.removeAllListeners('browser:navigated');
        };
    }, [setCurrentUrl]);

    const handleNavigate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputUrl.trim()) return;
        const { success, url } = await window.electronAPI.browserNavigate(inputUrl);
        if (success) {
            setCurrentUrl(url);
        }
    };

    const handleBack = async () => {
        await window.electronAPI.browserGoBack();
    };

    const handleForward = async () => {
        await window.electronAPI.browserGoForward();
    };

    const handleReload = async () => {
        await window.electronAPI.browserReload();
    };

    return (
        <div className="flex flex-col h-full w-full bg-panel">
            {/* URL Bar */}
            <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3 shrink-0">
                <div className="flex items-center gap-2">
                    <button onClick={handleBack} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={16} />
                    </button>
                    <button onClick={handleForward} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 hover:text-white transition-colors">
                        <ArrowRight size={16} />
                    </button>
                    <button onClick={handleReload} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 hover:text-white transition-colors">
                        <RotateCw size={16} />
                    </button>
                </div>

                <form onSubmit={handleNavigate} className="flex-1 flex items-center bg-gray-950 border border-gray-800 rounded-md overflow-hidden relative group focus-within:border-accent">
                    <div className="pl-3 pr-2 text-gray-400">
                        <Search size={14} />
                    </div>
                    <input
                        type="text"
                        className="flex-1 bg-transparent py-1.5 focus:outline-none text-sm text-gray-200"
                        placeholder="Enter URL to test..."
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                    />
                </form>
            </div>

            {/* Browser View Container */}
            <div className="flex-1 relative w-full" ref={containerRef}>
                {/* The actual browser renders via native Electron overlay here, this div is just to provide bounds */}
            </div>
        </div>
    );
}
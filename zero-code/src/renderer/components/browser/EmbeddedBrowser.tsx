import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Globe, Home } from 'lucide-react';
import { useBrowserStore } from '../../store/browserStore';
import { useCollabStore } from '../../store/collabStore';
import { broadcastRoomEvent, subscribeRoomEvents } from '../../lib/localRoom';

export default function EmbeddedBrowser() {
    const { currentUrl, setCurrentUrl } = useBrowserStore();
    const [inputUrl, setInputUrl] = useState(currentUrl);
    const containerRef = useRef<HTMLDivElement>(null);
    const roomId = useCollabStore(state => state.roomId);
    const role = useCollabStore(state => state.role);
    const isGuest = Boolean(roomId) && role !== 'Owner';
    const [guestStreamFrame, setGuestStreamFrame] = useState<string | null>(null);

    useEffect(() => { setInputUrl(currentUrl); }, [currentUrl]);

    useEffect(() => {
        const mountBrowser = async () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            await window.electronAPI.browserMount({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
        };

        if (isGuest) {
            window.electronAPI.browserResize({ x: 0, y: 0, width: 0, height: 0 });
            return;
        }

        const timeoutId = setTimeout(mountBrowser, 100);

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (isGuest) { window.electronAPI.browserResize({ x: 0, y: 0, width: 0, height: 0 }); return; }
                const { x, y, width, height } = entry.target.getBoundingClientRect();
                window.electronAPI.browserResize({ x, y, width, height });
            }
        });
        if (containerRef.current) observer.observe(containerRef.current);

        window.electronAPI.onBrowserNavigated(({ url }) => { setCurrentUrl(url); });

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
            window.electronAPI.removeAllListeners('browser:navigated');
        };
    }, [setCurrentUrl, isGuest]);

    const handleNavigate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputUrl.trim()) return;
        const { success, url } = await window.electronAPI.browserNavigate(inputUrl);
        if (success) setCurrentUrl(url);
    };

    useEffect(() => {
        if (role === 'Owner' && roomId) {
            const interval = setInterval(async () => {
                const base64 = await window.electronAPI.browserCapture();
                if (base64) broadcastRoomEvent({ type: 'SYNC_BROWSER', payload: base64 });
            }, 1500);
            return () => clearInterval(interval);
        }
    }, [role, roomId]);

    useEffect(() => {
        if (isGuest) {
            const unsubscribe = subscribeRoomEvents((event) => {
                if (event.type === 'SYNC_BROWSER' && event.payload) setGuestStreamFrame(event.payload);
            });
            return () => unsubscribe();
        }
    }, [isGuest]);

    const handleBack = async () => { await window.electronAPI.browserGoBack(); };
    const handleForward = async () => { await window.electronAPI.browserGoForward(); };
    const handleReload = async () => { await window.electronAPI.browserReload(); };
    const handleHome = async () => { await window.electronAPI.browserGoHome(); };

    return (
        <div className="flex flex-col h-full w-full bg-background">
            {/* Navigation Bar */}
            <div className={`h-9 bg-surface/50 backdrop-blur-sm border-b border-border flex items-center px-1.5 gap-1 shrink-0 relative ${isGuest ? 'opacity-30 pointer-events-none' : ''}`}>
                <div className="flex items-center">
                    <button onClick={handleHome} className="p-1.5 text-text-muted hover:text-text-secondary rounded transition-colors" title="Home">
                        <Home size={13} />
                    </button>
                    <button onClick={handleBack} className="p-1.5 text-text-muted hover:text-text-secondary rounded transition-colors" title="Back">
                        <ArrowLeft size={13} />
                    </button>
                    <button onClick={handleForward} className="p-1.5 text-text-muted hover:text-text-secondary rounded transition-colors" title="Forward">
                        <ArrowRight size={13} />
                    </button>
                    <button onClick={handleReload} className="p-1.5 text-text-muted hover:text-text-secondary rounded transition-colors" title="Reload">
                        <RotateCw size={12} />
                    </button>
                </div>

                <form onSubmit={handleNavigate} className="flex-1 flex items-center bg-background/80 border border-border rounded-md overflow-hidden focus-within:border-white/[0.1] transition-colors">
                    <div className="pl-2 pr-1 text-text-muted/60">
                        <Globe size={11} />
                    </div>
                    <input
                        type="text"
                        className="flex-1 bg-transparent py-1 pr-2 focus:outline-none text-[11px] text-text-primary placeholder:text-text-muted font-mono"
                        placeholder="Enter URL..."
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                    />
                </form>
            </div>

            {/* Browser View */}
            <div className={`flex-1 relative w-full ${isGuest ? 'pointer-events-none' : ''}`} ref={containerRef}>
                {isGuest && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
                        {guestStreamFrame ? (
                            <img src={guestStreamFrame} alt="Host Browser Stream" className="w-full h-full object-contain" />
                        ) : (
                            <div className="flex flex-col items-center gap-1 text-center">
                                <p className="text-text-secondary text-xs">Waiting for Host</p>
                                <p className="text-text-muted text-[10px]">Stream will appear shortly</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
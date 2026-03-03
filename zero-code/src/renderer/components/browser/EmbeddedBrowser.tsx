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

    useEffect(() => {
        setInputUrl(currentUrl);
    }, [currentUrl]);

    useEffect(() => {
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

        if (isGuest) {
            window.electronAPI.browserResize({ x: 0, y: 0, width: 0, height: 0 });
            return;
        }

        const timeoutId = setTimeout(mountBrowser, 100);

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (isGuest) {
                    window.electronAPI.browserResize({ x: 0, y: 0, width: 0, height: 0 });
                    return;
                }
                const { x, y, width, height } = entry.target.getBoundingClientRect();
                window.electronAPI.browserResize({ x, y, width, height });
            }
        });
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        window.electronAPI.onBrowserNavigated(({ url }) => {
            setCurrentUrl(url);
        });

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
        if (success) {
            setCurrentUrl(url);
        }
    };

    // Broadcast stream if host
    useEffect(() => {
        if (role === 'Owner' && roomId) {
            const interval = setInterval(async () => {
                const base64 = await window.electronAPI.browserCapture();
                if (base64) {
                    broadcastRoomEvent({ type: 'SYNC_BROWSER', payload: base64 });
                }
            }, 1500);
            return () => clearInterval(interval);
        }
    }, [role, roomId]);

    // Receive stream if guest
    useEffect(() => {
        if (isGuest) {
            const unsubscribe = subscribeRoomEvents((event) => {
                if (event.type === 'SYNC_BROWSER' && event.payload) {
                    setGuestStreamFrame(event.payload);
                }
            });
            return () => unsubscribe();
        }
    }, [isGuest]);

    const handleBack = async () => {
        await window.electronAPI.browserGoBack();
    };

    const handleForward = async () => {
        await window.electronAPI.browserGoForward();
    };

    const handleReload = async () => {
        await window.electronAPI.browserReload();
    };

    const handleHome = async () => {
        await window.electronAPI.browserGoHome();
    };

    return (
        <div className="flex flex-col h-full w-full bg-background">
            {/* URL Bar */}
            <div className={`h-10 bg-surface border-b border-border flex items-center px-2 gap-1.5 shrink-0 ${isGuest ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-0.5">
                    <button onClick={handleHome} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/[0.04] rounded-md transition-colors" title="Home">
                        <Home size={14} />
                    </button>
                    <button onClick={handleBack} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/[0.04] rounded-md transition-colors" title="Back">
                        <ArrowLeft size={14} />
                    </button>
                    <button onClick={handleForward} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/[0.04] rounded-md transition-colors" title="Forward">
                        <ArrowRight size={14} />
                    </button>
                    <button onClick={handleReload} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-white/[0.04] rounded-md transition-colors" title="Reload">
                        <RotateCw size={13} />
                    </button>
                </div>

                <form onSubmit={handleNavigate} className="flex-1 flex items-center bg-background border border-border rounded-lg overflow-hidden focus-within:border-accent/30 focus-within:ring-1 focus-within:ring-accent/10 transition-all">
                    <div className="pl-2.5 pr-1.5 text-text-muted">
                        <Globe size={12} />
                    </div>
                    <input
                        type="text"
                        className="flex-1 bg-transparent py-1.5 focus:outline-none text-xs text-text-primary placeholder:text-text-muted font-mono"
                        placeholder="Enter URL..."
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                    />
                </form>
            </div>

            {/* Browser View Container */}
            <div
                className={`flex-1 relative w-full ${isGuest ? 'pointer-events-none' : ''}`}
                ref={containerRef}
            >
                {isGuest && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
                        {guestStreamFrame ? (
                            <img src={guestStreamFrame} alt="Host Browser Stream" className="w-full h-full object-contain" />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h3 className="font-medium text-text-primary text-sm">Waiting for Host</h3>
                                <p className="text-xs text-text-muted">Stream will appear shortly</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
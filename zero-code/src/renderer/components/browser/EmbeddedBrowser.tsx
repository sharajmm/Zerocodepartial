import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Search, Home } from 'lucide-react';
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
        // Sync external navigation changes to the input field
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
            // Hide the actual electron embedded window for guests so it doesn't overlap React DOM
            window.electronAPI.browserResize({ x: 0, y: 0, width: 0, height: 0 });
            return;
        }

        // Slight delay to ensure layout is done
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
            }, 1500); // 1.5s interval to save network overhead on massive 4K strings!
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
        <div className="flex flex-col h-full w-full bg-panel">
            {/* URL Bar */}
            <div className={`h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3 shrink-0 ${isGuest ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-2">
                    <button onClick={handleHome} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 hover:text-white transition-colors" title="Home">
                        <Home size={16} />
                    </button>
                    <button onClick={handleBack} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 hover:text-white transition-colors" title="Go Back">
                        <ArrowLeft size={16} />
                    </button>
                    <button onClick={handleForward} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 hover:text-white transition-colors" title="Go Forward">
                        <ArrowRight size={16} />
                    </button>
                    <button onClick={handleReload} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 hover:text-white transition-colors" title="Reload">
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
            <div
                className={`flex-1 relative w-full ${isGuest ? 'pointer-events-none' : ''}`}
                ref={containerRef}
            >
                {isGuest && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-950">
                        {guestStreamFrame ? (
                            <img src={guestStreamFrame} alt="Host Browser Stream" className="w-full h-full object-contain" />
                        ) : (
                            <div className="bg-gray-900 border border-gray-800 p-4 rounded text-center shadow-2xl max-w-sm">
                                <Search size={32} className="mx-auto mb-2 text-accent opacity-50" />
                                <h3 className="font-semibold text-white mb-1">Waiting for Host...</h3>
                                <p className="text-sm text-gray-400">Connected to session. The browser stream will appear shortly.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
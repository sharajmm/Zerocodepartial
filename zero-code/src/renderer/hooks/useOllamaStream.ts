import { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useBrowserStore } from '../store/browserStore';
import { useSettingsStore } from '../store/settingsStore';
import { useTestStore } from '../store/testStore';
import { buildSystemPrompt } from '../lib/prompt-builder';
import { parseFlowchartResponse } from '../lib/flowchart-parser';

export function useOllamaStream() {
    const { addMessage, appendToken, markStreamComplete, setError } = useChatStore();
    const currentUrl = useBrowserStore(state => state.currentUrl);
    const selectedModel = useSettingsStore(state => state.selectedModel);
    const { setRawAiResponse } = useTestStore();

    useEffect(() => {
        // IMPORTANT: Clean up any previous listeners FIRST to prevent duplication
        window.electronAPI.removeAllListeners('ollama:generate:token');
        window.electronAPI.removeAllListeners('ollama:generate:error');

        // Listen for incoming tokens
        window.electronAPI.onOllamaToken((data: any) => {
            // Find the currently streaming message
            const state = useChatStore.getState();
            const streamingMsg = state.messages.find(m => m.isStreaming);

            if (!streamingMsg) return;

            if (data.done) {
                markStreamComplete(streamingMsg.id);

                // Let's capture the final built string to testStore.
                const finalizedMsg = useChatStore.getState().messages.find(m => m.id === streamingMsg.id);
                if (finalizedMsg) {
                    setRawAiResponse(finalizedMsg.content);

                    // Parse React Flow data out of the raw text
                    const { error, nodes, edges, code, isConversational } = parseFlowchartResponse(finalizedMsg.content);
                    if (isConversational) {
                        // It was just a conversational reply, no error needed.
                    } else if (error || !nodes || !edges || !code) {
                        useChatStore.getState().addMessage({
                            role: 'system',
                            content: `Error: AI response couldn't be parsed. Try rephrasing your test description.\n(${error})`
                        });
                    } else {
                        useTestStore.getState().setTestData(nodes, edges, code);
                    }
                }
            } else {
                appendToken(streamingMsg.id, data.token);
            }
        });

        window.electronAPI.onOllamaError((data: any) => {
            const state = useChatStore.getState();
            const streamingMsg = state.messages.find(m => m.isStreaming);
            if (streamingMsg) {
                setError(streamingMsg.id, data.error);
            }
        });

        return () => {
            window.electronAPI.removeAllListeners('ollama:generate:token');
            window.electronAPI.removeAllListeners('ollama:generate:error');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const sendQuery = async (query: string) => {
        // 1. Add user message
        addMessage({ role: 'user', content: query });

        // 2. Add empty AI streaming placeholder
        addMessage({ role: 'ai', content: '', isStreaming: true });

        try {
            // 3. System scrape
            addMessage({ role: 'system', content: 'Scraping DOM elements...' });
            const { elements } = await window.electronAPI.domScrape();
            useBrowserStore.getState().setElementsMap(elements);

            useChatStore.getState().addMessage({
                role: 'system',
                content: `DOM scraped successfully — ${elements.length} mapped elements.`
            });

            // 4. Build context
            const systemContent = buildSystemPrompt(elements, currentUrl);
            const contextMessages = useChatStore.getState().messages
                .filter(m => !m.isStreaming && m.role !== 'system')
                .map(m => ({
                    role: m.role === 'ai' ? 'assistant' : 'user',
                    content: m.content
                }));

            const payload = [
                { role: 'system', content: systemContent },
                ...contextMessages
            ];

            // 5. Fire IPC generate
            await window.electronAPI.ollamaGenerate(selectedModel, payload);

        } catch (e: any) {
            // Un-streaming
            const state = useChatStore.getState();
            const streamingMsg = state.messages.find(m => m.isStreaming);
            if (streamingMsg) {
                setError(streamingMsg.id, e.message);
            }
        }
    };

    return { sendQuery };
}
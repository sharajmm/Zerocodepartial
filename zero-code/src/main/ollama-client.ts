import { BrowserWindow } from 'electron';
import { IPC, OLLAMA_BASE_URL } from '../shared/constants';

export class OllamaClient {
    private mainWindow: BrowserWindow;

    constructor(mainWindow: BrowserWindow) {
        this.mainWindow = mainWindow;
    }

    public async checkHealth() {
        try {
            const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
            if (response.ok) {
                const data = await response.json();
                return { status: 'ok', models: data.models || [] };
            }
            return { status: 'error', models: [] };
        } catch (e) {
            return { status: 'error', models: [] };
        }
    }

    public async listModels() {
        try {
            const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
            if (response.ok) {
                const data = await response.json();
                return data.models || [];
            }
            return [];
        } catch (e) {
            return [];
        }
    }

    public async generate(model: string, messages: any[]) {
        try {
            const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    messages,
                    stream: true,
                    options: {
                        temperature: 0.1, // Lower temperature for more deterministic, code-focused output
                        num_ctx: 32768    // Increase context window size to handle larger DOM maps
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('No response body stream');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let buffer = '';

            while (!done) {
                const { value, done: streamDone } = await reader.read();
                done = streamDone;

                if (value) {
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');

                    // Keep the last partial line in the buffer
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.trim() === '') continue;

                        try {
                            const data = JSON.parse(line);
                            if (data.done) {
                                this.mainWindow.webContents.send(IPC.OLLAMA_GENERATE_TOKEN, { token: '', done: true });
                            } else {
                                this.mainWindow.webContents.send(IPC.OLLAMA_GENERATE_TOKEN, { token: data.message?.content || '', done: false });
                            }
                        } catch (err) {
                            console.error('Error parsing line:', err, line);
                        }
                    }
                }
            }

            // Note: If streaming finishes and buffer still has content, 
            // you might want to parse the remaining buffer here,
            // though Ollama NDJSON streams typically end with a newline.
            if (buffer.trim() !== '') {
                try {
                    const data = JSON.parse(buffer);
                    if (data.done) {
                        this.mainWindow.webContents.send(IPC.OLLAMA_GENERATE_TOKEN, { token: '', done: true });
                    } else {
                        this.mainWindow.webContents.send(IPC.OLLAMA_GENERATE_TOKEN, { token: data.message?.content || '', done: false });
                    }
                } catch (err) { }
            }

            this.mainWindow.webContents.send(IPC.OLLAMA_GENERATE_TOKEN, { token: '', done: true });

        } catch (e: any) {
            console.error('Ollama generate error:', e);
            this.mainWindow.webContents.send(IPC.OLLAMA_GENERATE_ERROR, { error: e.message });
        }
    }
}
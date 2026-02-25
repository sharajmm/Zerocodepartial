import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';
import * as os from 'os';

let server: http.Server | null = null;
let wss: WebSocketServer | null = null;

function getLocalIp(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]!) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

export async function hostRoom(): Promise<string> {
    return new Promise((resolve) => {
        if (server) stopRoom();

        server = http.createServer();
        wss = new WebSocketServer({ server });

        wss.on('connection', (ws: WebSocket) => {
            ws.on('message', (message: Buffer | string) => {
                wss?.clients.forEach((client: any) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(message.toString());
                    }
                });
            });
        });

        server.listen(0, '0.0.0.0', () => {
            const addr = server?.address() as { port: number };
            const ip = getLocalIp();
            resolve(`${ip}:${addr.port}`);
        });
    });
}

export function stopRoom() {
    if (wss) {
        wss.close();
        wss = null;
    }
    if (server) {
        server.close();
        server = null;
    }
}

import { app, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import type { TestSession } from '../renderer/types/test';

export class EvidenceManager {
    static getEvidenceDir(sessionId: string): string {
        const baseDir = path.join(app.getPath('userData'), 'zero-code-evidence');
        const sessionDir = path.join(baseDir, sessionId);
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }
        return sessionDir;
    }

    static saveErrorLog(sessionId: string, logData: any) {
        const sessionDir = this.getEvidenceDir(sessionId);
        const logPath = path.join(sessionDir, `error-${sessionId}.json`);
        fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
    }

    static writeSessionLog(sessionId: string, session: TestSession) {
        const sessionDir = this.getEvidenceDir(sessionId);
        const logPath = path.join(sessionDir, `session-${sessionId}.json`);
        fs.writeFileSync(logPath, JSON.stringify(session, null, 2));
    }

    static async openFolder(folderPath: string) {
        await shell.openPath(folderPath);
    }
}
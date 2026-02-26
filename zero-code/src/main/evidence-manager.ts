import { shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import type { TestSession } from '../renderer/types/test';

export class EvidenceManager {
    // If activeFolder is provided, use it. Otherwise use C:\zerocode\reports (for reports) or C:\zerocode\errors (for errors)
    static getEvidenceDir(sessionId: string, activeFolder?: string): string {
        let baseDir: string;
        if (activeFolder) {
            baseDir = activeFolder;
        } else {
            baseDir = 'C:\\zerocode\\reports';
        }
        const sessionDir = path.join(baseDir, sessionId);
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }
        return sessionDir;
    }

    static getErrorDir(activeFolder?: string): string {
        const dir = activeFolder || 'C:\\zerocode\\errors';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        return dir;
    }

    static saveErrorScreenshot(screenshotBuffer: Buffer, fileName: string, activeFolder?: string) {
        const dir = this.getErrorDir(activeFolder);
        const filePath = path.join(dir, fileName);
        fs.writeFileSync(filePath, screenshotBuffer);
        return filePath;
    }

    static saveErrorLog(sessionId: string, logData: any, activeFolder?: string) {
        const sessionDir = this.getEvidenceDir(sessionId, activeFolder);
        const logPath = path.join(sessionDir, `error-${sessionId}.json`);
        fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
    }

    static writeSessionLog(sessionId: string, session: TestSession, activeFolder?: string) {
        const sessionDir = this.getEvidenceDir(sessionId, activeFolder);
        const logPath = path.join(sessionDir, `session-${sessionId}.json`);
        fs.writeFileSync(logPath, JSON.stringify(session, null, 2));
    }

    static async openFolder(folderPath: string) {
        await shell.openPath(folderPath);
    }
}
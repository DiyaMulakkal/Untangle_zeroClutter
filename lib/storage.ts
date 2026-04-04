import fs from "fs";
import path from "path";
import { StorageEntry } from "./types";

type PersistedSession = {
    expiresAt: number;
    data: StorageEntry;
};

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SESSIONS_DIR = path.join(process.cwd(), "tmp", "sessions");
const PURGE_INTERVAL_MS = 15 * 60 * 1000;
let lastPurgeAt = 0;

function ensureSessionsDir() {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

function sessionFile(id: string) {
    return path.join(SESSIONS_DIR, `${id}.json`);
}

function purgeExpired() {
    const now = Date.now();
    if (now - lastPurgeAt < PURGE_INTERVAL_MS) {
        return;
    }

    lastPurgeAt = now;
    ensureSessionsDir();

    for (const file of fs.readdirSync(SESSIONS_DIR)) {
        if (!file.endsWith(".json")) continue;

        const fullPath = path.join(SESSIONS_DIR, file);

        try {
            const raw = fs.readFileSync(fullPath, "utf8");
            const session = JSON.parse(raw) as PersistedSession;

            if (now > session.expiresAt) {
                fs.unlinkSync(fullPath);
            }
        } catch {
            fs.unlinkSync(fullPath);
        }
    }
}

export const Storage = {
    set(id: string, data: StorageEntry): void {
        purgeExpired();
        ensureSessionsDir();

        const payload: PersistedSession = {
            expiresAt: Date.now() + SESSION_TTL_MS,
            data,
        };

        fs.writeFileSync(sessionFile(id), JSON.stringify(payload), "utf8");
    },

    get(id: string): StorageEntry | null {
        purgeExpired();
        ensureSessionsDir();

        const filePath = sessionFile(id);
        if (!fs.existsSync(filePath)) {
            return null;
        }

        try {
            const raw = fs.readFileSync(filePath, "utf8");
            const session = JSON.parse(raw) as PersistedSession;

            if (Date.now() > session.expiresAt) {
                fs.unlinkSync(filePath);
                return null;
            }

            return session.data;
        } catch {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return null;
        }
    },

    delete(id: string): void {
        const filePath = sessionFile(id);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    },

    size(): number {
        ensureSessionsDir();
        return fs.readdirSync(SESSIONS_DIR).filter((file) => file.endsWith(".json")).length;
    },
};

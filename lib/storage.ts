import { StorageEntry } from "./types";

// ---------------------------------------------------------------------------
// In-memory store — resets on server restart (fine for hackathon demo)
// For production: swap this module with Redis or a DB adapter
// ---------------------------------------------------------------------------

const store = new Map<string, StorageEntry>();

// Auto-expire sessions after 2 hours to prevent unbounded memory growth
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const expiry = new Map<string, number>();

function purgeExpired() {
    const now = Date.now();
    for (const [id, ts] of expiry.entries()) {
        if (now > ts) {
            store.delete(id);
            expiry.delete(id);
        }
    }
}

export const Storage = {
    set(id: string, data: StorageEntry): void {
        purgeExpired();
        store.set(id, data);
        expiry.set(id, Date.now() + SESSION_TTL_MS);
    },

    get(id: string): StorageEntry | null {
        purgeExpired();
        return store.get(id) ?? null;
    },

    delete(id: string): void {
        store.delete(id);
        expiry.delete(id);
    },

    size(): number {
        return store.size;
    },
};
import { kv } from "@vercel/kv";
import { StorageEntry } from "./types";

const SESSION_TTL_SEC = 7 * 24 * 60 * 60;
const memoryStore = new Map<string, StorageEntry>();

function keyFor(id: string) {
    return `session:${id}`;
}

function hasKvConfig() {
    return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export const Storage = {
    async set(id: string, data: StorageEntry): Promise<void> {
        if (!hasKvConfig()) {
            memoryStore.set(id, data);
            return;
        }

        try {
            await kv.set(keyFor(id), data, { ex: SESSION_TTL_SEC });
        } catch (error) {
            console.error("Redis set error:", error);
            throw new Error("Cloud storage operation failed.");
        }
    },

    async get(id: string): Promise<StorageEntry | null> {
        if (!hasKvConfig()) {
            return memoryStore.get(id) ?? null;
        }

        try {
            const value = await kv.get<StorageEntry>(keyFor(id));
            if (value) {
                await kv.expire(keyFor(id), SESSION_TTL_SEC);
            }
            return value;
        } catch (error) {
            console.error("Redis get error:", error);
            return null;
        }
    },

    async delete(id: string): Promise<void> {
        if (!hasKvConfig()) {
            memoryStore.delete(id);
            return;
        }

        try {
            await kv.del(keyFor(id));
        } catch (error) {
            console.error("Redis delete error:", error);
        }
    },

    async size(): Promise<number> {
        if (!hasKvConfig()) {
            return memoryStore.size;
        }

        return 0;
    },
};

import { AnalysisSnapshot } from "./types";

const DB_NAME = "zero-clutter";
const STORE_NAME = "analysis";
const KEY = "latest";

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveAnalysis(snapshot: AnalysisSnapshot): Promise<void> {
    const db = await openDb();

    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(snapshot, KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });

    db.close();
    window.localStorage.setItem("zeroClutterSessionId", snapshot.sessionId);
}

export async function loadAnalysis(): Promise<AnalysisSnapshot | null> {
    const db = await openDb();

    const value = await new Promise<AnalysisSnapshot | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).get(KEY);
        request.onsuccess = () => resolve((request.result as AnalysisSnapshot | undefined) ?? null);
        request.onerror = () => reject(request.error);
    });

    db.close();
    return value;
}

export async function clearAnalysis(): Promise<void> {
    const db = await openDb();

    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });

    db.close();
    window.localStorage.removeItem("zeroClutterSessionId");
}

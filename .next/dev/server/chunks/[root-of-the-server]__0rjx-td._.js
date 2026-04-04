module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/untangle-zero-clutter/lib/storage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Storage",
    ()=>Storage
]);
// ---------------------------------------------------------------------------
// In-memory store — resets on server restart (fine for hackathon demo)
// For production: swap this module with Redis or a DB adapter
// ---------------------------------------------------------------------------
const store = new Map();
// Auto-expire sessions after 2 hours to prevent unbounded memory growth
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const expiry = new Map();
function purgeExpired() {
    const now = Date.now();
    for (const [id, ts] of expiry.entries()){
        if (now > ts) {
            store.delete(id);
            expiry.delete(id);
        }
    }
}
const Storage = {
    set (id, data) {
        purgeExpired();
        store.set(id, data);
        expiry.set(id, Date.now() + SESSION_TTL_MS);
    },
    get (id) {
        purgeExpired();
        return store.get(id) ?? null;
    },
    delete (id) {
        store.delete(id);
        expiry.delete(id);
    },
    size () {
        return store.size;
    }
};
}),
"[project]/untangle-zero-clutter/app/api/summary/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/untangle-zero-clutter/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/untangle-zero-clutter/lib/storage.ts [app-route] (ecmascript)");
;
;
async function GET(req) {
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    const includeTransactions = req.nextUrl.searchParams.get("includeTransactions") !== "0";
    const limitParam = req.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Math.max(0, parseInt(limitParam, 10) || 0) : 0;
    if (!sessionId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Missing 'sessionId' query parameter."
        }, {
            status: 400
        });
    }
    const entry = await __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Storage"].get(sessionId);
    if (!entry) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Session not found or expired. Please re-upload your file."
        }, {
            status: 404
        });
    }
    const transactions = includeTransactions ? limit > 0 ? entry.transactions.slice(0, limit) : entry.transactions : undefined;
    return __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        sessionId,
        ...entry.summary,
        transactions,
        forecast: entry.forecast,
        uploadMeta: entry.uploadMeta
    }, {
        status: 200
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0rjx-td._.js.map
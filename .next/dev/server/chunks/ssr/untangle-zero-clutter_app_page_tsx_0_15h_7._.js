module.exports = [
"[project]/untangle-zero-clutter/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/untangle-zero-clutter/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/untangle-zero-clutter/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/untangle-zero-clutter/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
;
function Home() {
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [summary, setSummary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [transactions, setTransactions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const handleClick = ()=>{
        fileInputRef.current?.click();
    };
    const handleFileChange = async (e)=>{
        const file = e.target.files[0];
        if (!file) return;
        //setLoading(true);
        // try {
        //     const formData = new FormData();
        //     formData.append("file", file);
        //     // 1. Upload file
        //     const uploadRes = await fetch("/api/upload", {
        //         method: "POST",
        //         body: formData,
        //     });
        //     const uploadData = await uploadRes.json();
        //     localStorage.setItem("sessionId", uploadData.sessionId);
        //     const sessionId = uploadData.sessionId;
        //     // 2. Fetch summary
        //     // const summaryRes = await fetch(`/api/summary?sessionId=${sessionId}`);
        //     //const summaryData = await summaryRes.json();
        //     // 3. Store
        //     setSummary(summaryData.summary);
        //     setTransactions(summaryData.transactions);
        //     // 🔥 IMPORTANT: store sessionId
        // } catch (err) {
        //     console.error(err);
        // }
        //setLoading(false);
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        console.log("UPLOAD DATA:", data);
        // ✅ USE DATA DIRECTLY
        setSummary(data.summary);
        setTransactions(data.transactions);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        style: {
            padding: "40px",
            maxWidth: "1000px",
            margin: "auto"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                style: {
                    marginBottom: "20px"
                },
                children: "Untangle"
            }, void 0, false, {
                fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                lineNumber: 74,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: "#6b7280"
                },
                children: "ZERO-CLUTTER FINANCIAL FORECASTER"
            }, void 0, false, {
                fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                lineNumber: 76,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                style: {
                    fontSize: "60px",
                    fontWeight: 800,
                    lineHeight: 1.1
                },
                children: [
                    "Know your ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                        lineNumber: 79,
                        columnNumber: 27
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontStyle: "italic",
                            fontWeight: 400
                        },
                        children: "exact"
                    }, void 0, false, {
                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                        lineNumber: 80,
                        columnNumber: 17
                    }, this),
                    " runway. ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                        lineNumber: 80,
                        columnNumber: 93
                    }, this),
                    "Nothing else."
                ]
            }, void 0, true, {
                fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                lineNumber: 78,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: "#6b7280",
                    marginTop: "10px"
                },
                children: "Drop messy bank data. Get your safe-to-spend daily limit for the next 30 days."
            }, void 0, false, {
                fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                lineNumber: 84,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: "30px",
                    display: "flex",
                    gap: "20px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleClick,
                        className: "btn-primary",
                        children: "Upload CSV"
                    }, void 0, false, {
                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                        lineNumber: 89,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "btn-outline",
                        children: "See how it works"
                    }, void 0, false, {
                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                        lineNumber: 93,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                lineNumber: 88,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: handleClick,
                style: {
                    marginTop: "50px",
                    border: "2px dashed #e5e7eb",
                    padding: "60px",
                    textAlign: "center",
                    borderRadius: "10px",
                    cursor: "pointer"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        children: "Drop transaction file here"
                    }, void 0, false, {
                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                        lineNumber: 109,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            color: "#6b7280"
                        },
                        children: "CSV or JSON"
                    }, void 0, false, {
                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                        lineNumber: 110,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                lineNumber: 98,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "file",
                ref: fileInputRef,
                style: {
                    display: "none"
                },
                onChange: handleFileChange
            }, void 0, false, {
                fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                lineNumber: 113,
                columnNumber: 13
            }, this),
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    marginTop: "20px"
                },
                children: "Processing..."
            }, void 0, false, {
                fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                lineNumber: 120,
                columnNumber: 25
            }, this),
            summary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                        style: {
                            color: "#6b7280",
                            marginTop: "40px",
                            fontSize: "16px",
                            opacity: "0.4"
                        },
                        children: "30-day Runway"
                    }, void 0, false, {
                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                        lineNumber: 125,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        style: {
                            fontSize: "50px",
                            marginTop: "10px"
                        },
                        children: [
                            "₹",
                            summary.daily,
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: "#6b7280",
                                    marginTop: "10px",
                                    fontSize: "16px",
                                    fontWeight: "400"
                                },
                                children: "/ day safe-to-spend"
                            }, void 0, false, {
                                fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                                lineNumber: 127,
                                columnNumber: 42
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                        lineNumber: 126,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                        style: {
                            color: "#6b7280",
                            marginTop: "10px",
                            fontWeight: "400"
                        },
                        children: "Next 30 days. Updated Now."
                    }, void 0, false, {
                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                        lineNumber: 129,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "summary-container",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "summary-item",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "label",
                                        children: "total out"
                                    }, void 0, false, {
                                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                                        lineNumber: 134,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "value red",
                                        children: [
                                            "-₹",
                                            summary.totalOut
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                                        lineNumber: 135,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "sub",
                                        children: "this period"
                                    }, void 0, false, {
                                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                                        lineNumber: 136,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                                lineNumber: 133,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "summary-item",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "label",
                                        children: "total in"
                                    }, void 0, false, {
                                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                                        lineNumber: 140,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "value green",
                                        children: [
                                            "+₹",
                                            summary.totalIn
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                                        lineNumber: 141,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "sub",
                                        children: "this period"
                                    }, void 0, false, {
                                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                                        lineNumber: 142,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                                lineNumber: 139,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "summary-item",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "label",
                                        children: "balance"
                                    }, void 0, false, {
                                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                                        lineNumber: 146,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "value",
                                        children: [
                                            "₹",
                                            summary.balance
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                                        lineNumber: 147,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "sub",
                                        children: "available"
                                    }, void 0, false, {
                                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                                        lineNumber: 148,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                                lineNumber: 145,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                        lineNumber: 131,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            gap: "20px",
                            marginTop: "20px"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-ghost",
                                onClick: ()=>{
                                    const sessionId = localStorage.getItem("sessionId");
                                    router.push(`/transactions?sessionId=${sessionId}`);
                                },
                                children: "View transactions"
                            }, void 0, false, {
                                fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                                lineNumber: 155,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$untangle$2d$zero$2d$clutter$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-ghost",
                                children: "Future prediction"
                            }, void 0, false, {
                                fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                                lineNumber: 165,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
                        lineNumber: 153,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/untangle-zero-clutter/app/page.tsx",
        lineNumber: 72,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=untangle-zero-clutter_app_page_tsx_0_15h_7._.js.map
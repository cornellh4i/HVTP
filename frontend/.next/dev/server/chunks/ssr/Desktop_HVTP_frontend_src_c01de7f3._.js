module.exports = [
"[project]/Desktop/HVTP/frontend/src/api/APIWrapper.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiRequest",
    ()=>apiRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$utils$2f$firebase$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/HVTP/frontend/src/utils/firebase/firebase.ts [app-ssr] (ecmascript)");
;
const API_BASE = "http://localhost:8000";
async function getAuthToken() {
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$utils$2f$firebase$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"].currentUser;
    if (!user) {
        throw new Error("User is not authenticated");
    }
    return user.getIdToken();
}
async function apiRequest(endpoint, options = {}) {
    const { method = "GET", body, token } = options;
    const authToken = token ?? await getAuthToken();
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
        throw new Error(json.error || `Request failed: ${method} ${endpoint}`);
    }
    return json.data;
}
}),
"[project]/Desktop/HVTP/frontend/src/api/users.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteUser",
    ()=>deleteUser,
    "getAllUsers",
    ()=>getAllUsers,
    "getUserById",
    ()=>getUserById,
    "logIn",
    ()=>logIn,
    "logOut",
    ()=>logOut,
    "signUp",
    ()=>signUp,
    "updateUser",
    ()=>updateUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$utils$2f$firebase$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/HVTP/frontend/src/utils/firebase/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/HVTP/frontend/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/HVTP/frontend/node_modules/firebase/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$api$2f$APIWrapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/HVTP/frontend/src/api/APIWrapper.ts [app-ssr] (ecmascript)");
;
;
;
const signUp = async (name, email, password)=>{
    const credential = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createUserWithEmailAndPassword"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$utils$2f$firebase$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"], email, password);
    const token = await credential.user.getIdToken();
    document.cookie = `session=${token}; path=/; max-age=3600; SameSite=Strict`;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$api$2f$APIWrapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/addUser", {
        method: "POST",
        body: {
            id: credential.user.uid,
            name,
            email
        },
        token
    });
};
const logIn = async (email, password)=>{
    const credential = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signInWithEmailAndPassword"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$utils$2f$firebase$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"], email, password);
    const token = await credential.user.getIdToken();
    document.cookie = `session=${token}; path=/; max-age=3600; SameSite=Strict`;
    return credential.user;
};
const logOut = async ()=>{
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signOut"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$utils$2f$firebase$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"]);
};
const getAllUsers = async ()=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$api$2f$APIWrapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/getAllUsers", {
        method: "GET"
    });
};
const getUserById = async (id)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$api$2f$APIWrapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/getUserById/${encodeURIComponent(id)}`, {
        method: "GET"
    });
};
const updateUser = async (id, data)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$api$2f$APIWrapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/updateUser/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: data
    });
};
const deleteUser = async (id)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$api$2f$APIWrapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/deleteUser/${encodeURIComponent(id)}`, {
        method: "DELETE"
    });
};
}),
"[project]/Desktop/HVTP/frontend/src/app/dashboard/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/HVTP/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$utils$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/HVTP/frontend/src/utils/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$api$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/HVTP/frontend/src/api/users.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/HVTP/frontend/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function DashboardPage() {
    const { user, loading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$utils$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const handleSignOut = async ()=>{
        document.cookie = "session=; path=/; max-age=0";
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$src$2f$api$2f$users$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["logOut"])();
        router.push("/login");
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-h-screen items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-gray-500",
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/Desktop/HVTP/frontend/src/app/dashboard/page.tsx",
                lineNumber: 19,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Desktop/HVTP/frontend/src/app/dashboard/page.tsx",
            lineNumber: 18,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col p-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-2xl font-bold",
                children: "Dashboard"
            }, void 0, false, {
                fileName: "[project]/Desktop/HVTP/frontend/src/app/dashboard/page.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-gray-600 mt-2",
                children: [
                    "Welcome, ",
                    user.email
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/HVTP/frontend/src/app/dashboard/page.tsx",
                lineNumber: 27,
                columnNumber: 16
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleSignOut,
                className: "mt-4 w-fit rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600",
                children: "Sign Out"
            }, void 0, false, {
                fileName: "[project]/Desktop/HVTP/frontend/src/app/dashboard/page.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/HVTP/frontend/src/app/dashboard/page.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=Desktop_HVTP_frontend_src_c01de7f3._.js.map
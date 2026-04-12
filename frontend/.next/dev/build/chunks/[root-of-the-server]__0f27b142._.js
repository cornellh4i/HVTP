module.exports = [
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/node:url [external] (node:url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[project]/Desktop/HVTP/frontend/postcss.config.js_.loader.mjs [postcss] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:url [external] (node:url, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
const configPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), "./postcss.config.js");
// Absolute paths don't work with ESM imports on Windows:
// https://github.com/nodejs/node/issues/31710
// convert it to a file:// URL, which works on all platforms
const configUrl = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__["pathToFileURL"])(configPath).toString();
const mod = await __turbopack_context__.y(configUrl);
const __TURBOPACK__default__export__ = mod.default ?? mod;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[turbopack-node]/transforms/transforms.ts [postcss] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared utilities for our 2 transform implementations.
 */ __turbopack_context__.s([
    "fromPath",
    ()=>fromPath,
    "getReadEnvVariables",
    ()=>getReadEnvVariables,
    "toPath",
    ()=>toPath
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
const contextDir = process.cwd();
const toPath = (file)=>{
    const relPath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["relative"])(contextDir, file);
    if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["isAbsolute"])(relPath)) {
        throw new Error(`Cannot depend on path (${file}) outside of root directory (${contextDir})`);
    }
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["sep"] !== '/' ? relPath.replaceAll(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["sep"], '/') : relPath;
};
const fromPath = (path)=>{
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(/* turbopackIgnore: true */ contextDir, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["sep"] !== '/' ? path.replaceAll('/', __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["sep"]) : path);
};
// Patch process.env to track which env vars are read
const originalEnv = process.env;
const readEnvVars = new Set();
process.env = new Proxy(originalEnv, {
    get (target, prop) {
        if (typeof prop === 'string') {
            // We register the env var as dependency on the
            // current transform and all future transforms
            // since the env var might be cached in module scope
            // and influence them all
            readEnvVars.add(prop);
        }
        return Reflect.get(target, prop);
    },
    set (target, prop, value) {
        return Reflect.set(target, prop, value);
    }
});
function getReadEnvVariables() {
    return Array.from(readEnvVars);
}
}),
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/Desktop/HVTP/frontend/postcss.config.js_.loader.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>transform,
    "init",
    ()=>init
]);
// @ts-ignore
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$node_modules$2f$postcss$2f$lib$2f$postcss$2e$mjs__$5b$postcss$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/HVTP/node_modules/postcss/lib/postcss.mjs [postcss] (ecmascript)");
// @ts-ignore
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$postcss$2e$config$2e$js_$2e$loader$2e$mjs__$5b$postcss$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/HVTP/frontend/postcss.config.js_.loader.mjs [postcss] (ecmascript)");
var __TURBOPACK__imported__module__$5b$turbopack$2d$node$5d2f$transforms$2f$transforms$2e$ts__$5b$postcss$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[turbopack-node]/transforms/transforms.ts [postcss] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$postcss$2e$config$2e$js_$2e$loader$2e$mjs__$5b$postcss$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$postcss$2e$config$2e$js_$2e$loader$2e$mjs__$5b$postcss$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
let processor;
const init = async (ipc)=>{
    let config = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$frontend$2f$postcss$2e$config$2e$js_$2e$loader$2e$mjs__$5b$postcss$5d$__$28$ecmascript$29$__["default"];
    if (typeof config === 'function') {
        config = await config({
            env: 'development'
        });
    }
    if (typeof config === 'undefined') {
        throw new Error('PostCSS config is undefined (make sure to export an function or object from config file)');
    }
    let plugins;
    if (Array.isArray(config.plugins)) {
        plugins = config.plugins.map((plugin)=>{
            if (Array.isArray(plugin)) {
                return plugin;
            } else if (typeof plugin === 'string') {
                return [
                    plugin,
                    {}
                ];
            } else {
                return plugin;
            }
        });
    } else if (typeof config.plugins === 'object') {
        plugins = Object.entries(config.plugins).filter(([, options])=>options);
    } else {
        plugins = [];
    }
    const loadedPlugins = plugins.map((plugin)=>{
        if (Array.isArray(plugin)) {
            const [arg, options] = plugin;
            let pluginFactory = arg;
            if (typeof pluginFactory === 'string') {
                pluginFactory = require(/* turbopackIgnore: true */ pluginFactory);
            }
            if (pluginFactory.default) {
                pluginFactory = pluginFactory.default;
            }
            return pluginFactory(options);
        }
        return plugin;
    });
    processor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$HVTP$2f$node_modules$2f$postcss$2f$lib$2f$postcss$2e$mjs__$5b$postcss$5d$__$28$ecmascript$29$__["default"])(loadedPlugins);
};
async function transform(ipc, cssContent, name, sourceMap) {
    const { css, map, messages } = await processor.process(cssContent, {
        from: name,
        to: name,
        map: sourceMap ? {
            inline: false,
            annotation: false
        } : undefined
    });
    const assets = [];
    const filePaths = [];
    const buildFilePaths = [];
    const directories = [];
    for (const msg of messages){
        switch(msg.type){
            case 'asset':
                assets.push({
                    file: msg.file,
                    content: msg.content,
                    sourceMap: !sourceMap ? undefined : typeof msg.sourceMap === 'string' ? msg.sourceMap : JSON.stringify(msg.sourceMap)
                });
                break;
            case 'dependency':
            case 'missing-dependency':
                filePaths.push((0, __TURBOPACK__imported__module__$5b$turbopack$2d$node$5d2f$transforms$2f$transforms$2e$ts__$5b$postcss$5d$__$28$ecmascript$29$__["toPath"])(msg.file));
                break;
            case 'build-dependency':
                buildFilePaths.push((0, __TURBOPACK__imported__module__$5b$turbopack$2d$node$5d2f$transforms$2f$transforms$2e$ts__$5b$postcss$5d$__$28$ecmascript$29$__["toPath"])(msg.file));
                break;
            case 'dir-dependency':
                directories.push([
                    (0, __TURBOPACK__imported__module__$5b$turbopack$2d$node$5d2f$transforms$2f$transforms$2e$ts__$5b$postcss$5d$__$28$ecmascript$29$__["toPath"])(msg.dir),
                    msg.glob
                ]);
                break;
            case 'context-dependency':
                directories.push([
                    (0, __TURBOPACK__imported__module__$5b$turbopack$2d$node$5d2f$transforms$2f$transforms$2e$ts__$5b$postcss$5d$__$28$ecmascript$29$__["toPath"])(msg.dir),
                    '**'
                ]);
                break;
            default:
                break;
        }
    }
    ipc.sendInfo({
        type: 'dependencies',
        filePaths,
        directories,
        buildFilePaths,
        envVariables: (0, __TURBOPACK__imported__module__$5b$turbopack$2d$node$5d2f$transforms$2f$transforms$2e$ts__$5b$postcss$5d$__$28$ecmascript$29$__["getReadEnvVariables"])()
    });
    return {
        css,
        map: sourceMap ? JSON.stringify(map) : undefined,
        assets
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Desktop/HVTP/frontend/node_modules/picocolors/picocolors.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

let p = process || {}, argv = p.argv || [], env = p.env || {};
let isColorSupported = !(!!env.NO_COLOR || argv.includes("--no-color")) && (!!env.FORCE_COLOR || argv.includes("--color") || p.platform === "win32" || (p.stdout || {}).isTTY && env.TERM !== "dumb" || !!env.CI);
let formatter = (open, close, replace = open)=>(input)=>{
        let string = "" + input, index = string.indexOf(close, open.length);
        return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
    };
let replaceClose = (string, close, replace, index)=>{
    let result = "", cursor = 0;
    do {
        result += string.substring(cursor, index) + replace;
        cursor = index + close.length;
        index = string.indexOf(close, cursor);
    }while (~index)
    return result + string.substring(cursor);
};
let createColors = (enabled = isColorSupported)=>{
    let f = enabled ? formatter : ()=>String;
    return {
        isColorSupported: enabled,
        reset: f("\x1b[0m", "\x1b[0m"),
        bold: f("\x1b[1m", "\x1b[22m", "\x1b[22m\x1b[1m"),
        dim: f("\x1b[2m", "\x1b[22m", "\x1b[22m\x1b[2m"),
        italic: f("\x1b[3m", "\x1b[23m"),
        underline: f("\x1b[4m", "\x1b[24m"),
        inverse: f("\x1b[7m", "\x1b[27m"),
        hidden: f("\x1b[8m", "\x1b[28m"),
        strikethrough: f("\x1b[9m", "\x1b[29m"),
        black: f("\x1b[30m", "\x1b[39m"),
        red: f("\x1b[31m", "\x1b[39m"),
        green: f("\x1b[32m", "\x1b[39m"),
        yellow: f("\x1b[33m", "\x1b[39m"),
        blue: f("\x1b[34m", "\x1b[39m"),
        magenta: f("\x1b[35m", "\x1b[39m"),
        cyan: f("\x1b[36m", "\x1b[39m"),
        white: f("\x1b[37m", "\x1b[39m"),
        gray: f("\x1b[90m", "\x1b[39m"),
        bgBlack: f("\x1b[40m", "\x1b[49m"),
        bgRed: f("\x1b[41m", "\x1b[49m"),
        bgGreen: f("\x1b[42m", "\x1b[49m"),
        bgYellow: f("\x1b[43m", "\x1b[49m"),
        bgBlue: f("\x1b[44m", "\x1b[49m"),
        bgMagenta: f("\x1b[45m", "\x1b[49m"),
        bgCyan: f("\x1b[46m", "\x1b[49m"),
        bgWhite: f("\x1b[47m", "\x1b[49m"),
        blackBright: f("\x1b[90m", "\x1b[39m"),
        redBright: f("\x1b[91m", "\x1b[39m"),
        greenBright: f("\x1b[92m", "\x1b[39m"),
        yellowBright: f("\x1b[93m", "\x1b[39m"),
        blueBright: f("\x1b[94m", "\x1b[39m"),
        magentaBright: f("\x1b[95m", "\x1b[39m"),
        cyanBright: f("\x1b[96m", "\x1b[39m"),
        whiteBright: f("\x1b[97m", "\x1b[39m"),
        bgBlackBright: f("\x1b[100m", "\x1b[49m"),
        bgRedBright: f("\x1b[101m", "\x1b[49m"),
        bgGreenBright: f("\x1b[102m", "\x1b[49m"),
        bgYellowBright: f("\x1b[103m", "\x1b[49m"),
        bgBlueBright: f("\x1b[104m", "\x1b[49m"),
        bgMagentaBright: f("\x1b[105m", "\x1b[49m"),
        bgCyanBright: f("\x1b[106m", "\x1b[49m"),
        bgWhiteBright: f("\x1b[107m", "\x1b[49m")
    };
};
module.exports = createColors();
module.exports.createColors = createColors;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/tokenize.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/tokenize.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/terminal-highlight.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/terminal-highlight.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/css-syntax-error.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/css-syntax-error.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/symbols.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/symbols.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/stringifier.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/stringifier.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/stringify.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/stringify.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/node.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/node.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/declaration.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/declaration.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/base64.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/base64.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/base64-vlq.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/base64-vlq.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/util.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/util.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/array-set.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/array-set.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/mapping-list.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/mapping-list.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/source-map-generator.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/source-map-generator.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/binary-search.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/binary-search.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/quick-sort.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/quick-sort.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/source-map-consumer.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/source-map-consumer.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/source-node.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/source-map-js/lib/source-node.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/source-map-js/source-map.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/source-map-js/source-map.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/nanoid/non-secure/index.cjs [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/nanoid/non-secure/index.cjs', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/previous-map.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/previous-map.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/input.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/input.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/map-generator.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/map-generator.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/comment.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/comment.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/container.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/container.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/document.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/document.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/warn-once.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/warn-once.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/warning.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/warning.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/result.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/result.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/at-rule.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/at-rule.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/root.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/root.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/list.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/list.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/rule.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/rule.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/parser.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/parser.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/parse.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/parse.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/lazy-result.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/lazy-result.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/no-work-result.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/no-work-result.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/processor.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/processor.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/fromJSON.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/fromJSON.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/postcss.js [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/postcss.js', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/postcss.mjs [postcss] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/Desktop/HVTP/frontend/node_modules/postcss/lib/postcss.mjs', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0f27b142._.js.map
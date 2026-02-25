"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("../controllers/user"));
const middleware_1 = require("../middleware/middleware");
const jsonResponses_1 = require("../utils/jsonResponses");
const userRouter = (0, express_1.Router)();
userRouter.use(middleware_1.authenticateToken);
userRouter.get("/userById", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    if (typeof id !== "string" || id.trim() === "") {
        res.status(400).send((0, jsonResponses_1.errorJson)("Missing or invalid 'id' query parameter"));
        return;
    }
    try {
        const user = yield user_1.default.getUserById(id.trim());
        if (!user) {
            res.status(404).send((0, jsonResponses_1.errorJson)("User not found"));
            return;
        }
        res.status(200).send((0, jsonResponses_1.successJson)(user));
    }
    catch (error) {
        res.status(500).send((0, jsonResponses_1.errorJson)(error));
    }
}));
userRouter.post("/createUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, name, email } = req.body;
    if (!name || typeof name !== "string" || name.trim() === "") {
        res.status(400).send((0, jsonResponses_1.errorJson)("Missing or invalid 'name' in request body"));
        return;
    }
    if (!email || typeof email !== "string" || email.trim() === "") {
        res.status(400).send((0, jsonResponses_1.errorJson)("Missing or invalid 'email' in request body"));
        return;
    }
    if (id !== undefined && (typeof id !== "string" || id.trim() === "")) {
        res.status(400).send((0, jsonResponses_1.errorJson)("Invalid 'id' in request body"));
        return;
    }
    try {
        const createdUser = yield user_1.default.createUser(Object.assign(Object.assign({}, (id !== undefined ? { id: id.trim() } : {})), { name: name.trim(), email: email.trim() }));
        res.status(201).send((0, jsonResponses_1.successJson)(createdUser));
    }
    catch (error) {
        res.status(500).send((0, jsonResponses_1.errorJson)(error));
    }
}));
userRouter.patch("/updateUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { id } = _a, updates = __rest(_a, ["id"]);
    if (!id || typeof id !== "string" || id.trim() === "") {
        res.status(400).send((0, jsonResponses_1.errorJson)("Missing or invalid 'id' in request body"));
        return;
    }
    if (updates.name !== undefined &&
        (typeof updates.name !== "string" || updates.name.trim() === "")) {
        res.status(400).send((0, jsonResponses_1.errorJson)("Invalid 'name' field"));
        return;
    }
    if (updates.email !== undefined &&
        (typeof updates.email !== "string" || updates.email.trim() === "")) {
        res.status(400).send((0, jsonResponses_1.errorJson)("Invalid 'email' field"));
        return;
    }
    try {
        const updatedUser = yield user_1.default.updateUser(id.trim(), Object.assign(Object.assign({}, (updates.name !== undefined ? { name: updates.name.trim() } : {})), (updates.email !== undefined ? { email: updates.email.trim() } : {})));
        if (!updatedUser) {
            res.status(404).send((0, jsonResponses_1.errorJson)("User not found"));
            return;
        }
        res.status(200).send((0, jsonResponses_1.successJson)(updatedUser));
    }
    catch (error) {
        res.status(500).send((0, jsonResponses_1.errorJson)(error));
    }
}));
exports.default = userRouter;

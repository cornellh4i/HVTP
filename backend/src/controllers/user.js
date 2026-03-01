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
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("../config/firebase");
const usersCollection = "users";
const mapUserDoc = (id, data) => ({
    id,
    name: data.name,
    email: data.email,
});
/**
 * Finds a user by Firestore document id.
 */
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const doc = yield (0, firebase_1.getDb)().collection(usersCollection).doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return mapUserDoc(doc.id, (_a = doc.data()) !== null && _a !== void 0 ? _a : {});
});
/**
 * Creates a user in Firestore.
 */
const createUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { id } = user, userData = __rest(user, ["id"]);
    if (id && id.trim() !== "") {
        const userRef = (0, firebase_1.getDb)().collection(usersCollection).doc(id.trim());
        yield userRef.set(userData);
        const createdDoc = yield userRef.get();
        return mapUserDoc(createdDoc.id, (_b = createdDoc.data()) !== null && _b !== void 0 ? _b : {});
    }
    const userRef = yield (0, firebase_1.getDb)().collection(usersCollection).add(userData);
    const createdDoc = yield userRef.get();
    return mapUserDoc(createdDoc.id, (_c = createdDoc.data()) !== null && _c !== void 0 ? _c : {});
});
/**
 * Updates existing user fields by Firestore document id.
 */
const updateUser = (id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const safeUpdates = Object.assign({}, updates);
    if (Object.keys(safeUpdates).length === 0) {
        return getUserById(id);
    }
    const userRef = (0, firebase_1.getDb)().collection(usersCollection).doc(id);
    const existingDoc = yield userRef.get();
    if (!existingDoc.exists) {
        return null;
    }
    yield userRef.update(safeUpdates);
    const updatedDoc = yield userRef.get();
    return mapUserDoc(updatedDoc.id, (_d = updatedDoc.data()) !== null && _d !== void 0 ? _d : {});
});
exports.default = {
    createUser,
    getUserById,
    updateUser,
};

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnect = void 0;
const firebase_1 = require("./config/firebase");
let db;
const dbConnect = () => __awaiter(void 0, void 0, void 0, function* () {
    // Initialize Firestore (Firebase already initialized in firebase.ts)
    db = (0, firebase_1.getDb)();
    console.log("✅ Connected to Firestore");
});
exports.dbConnect = dbConnect;

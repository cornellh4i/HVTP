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
exports.deleteItem = exports.updateItem = exports.addItem = exports.getItemById = exports.getAllItems = void 0;
const firebase_1 = require("../config/firebase");
// This is is where you would write the code for the User controllers
const db = (0, firebase_1.getDb)();
const getAllItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const snapshot = yield db.collection("items").get();
        const items = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json(items);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching items", error });
    }
});
exports.getAllItems = getAllItems;
const getItemById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: "Missing ID" });
        }
        const doc = yield db
            .collection("items")
            .doc(id)
            .get();
        if (!doc) {
            return res.status(404).json({ error: "Item not found" });
        }
        res.status(200).json(Object.assign({ docId: doc.id }, doc.data()));
    }
    catch (_a) {
        res.status(500).json({ error: "Error retrieving item" });
    }
});
exports.getItemById = getItemById;
const addItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newItem = req.body;
        if (!newItem.name ||
            !newItem.category ||
            !newItem.description ||
            !newItem.image ||
            !newItem.sku ||
            !newItem.qrcode ||
            newItem.isActive === undefined ||
            !newItem.createdAt) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        yield db.collection("items").add(newItem);
        res.status(201).json({ message: "Item added" });
    }
    catch (_b) {
        res.status(500).json({ error: "Error adding item" });
    }
});
exports.addItem = addItem;
const updateItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: "Missing ID" });
        }
        const doc = yield db
            .collection("items")
            .doc(id)
            .get();
        if (!doc) {
            return res.status(404).json({ error: "Item not found" });
        }
        const ref = doc.ref;
        yield ref.update(req.body);
        res.status(200).json({ message: "Item updated" });
    }
    catch (_c) {
        res.status(500).json({ error: "Update failed" });
    }
});
exports.updateItem = updateItem;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: "Missing ID" });
        }
        const doc = yield db
            .collection("items")
            .doc(id)
            .get();
        if (!doc) {
            return res.status(404).json({ error: "Item not found" });
        }
        const ref = doc.ref;
        yield ref.delete();
        res.status(200).json({ message: "Item deleted" });
    }
    catch (_d) {
        res.status(500).json({ error: "Update failed" });
    }
});
exports.deleteItem = deleteItem;

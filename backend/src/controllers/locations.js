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
exports.addLocation = exports.updateLocation = exports.getLocationById = exports.allLocations = void 0;
const firebase_1 = require("../config/firebase");
const db = (0, firebase_1.getDb)();
const allLocations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // from the locations collection in Firestore, retrieve all documents
        const snapshot = yield db.collection("locations").get();
        // convert each doc (from an array) into an object, store into locations as an array
        const locations = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        return res.status(200).json(locations); // success! send json
    }
    catch (errror) {
        return res.status(500).json({ message: "Error fetching locations", error: errror });
    }
});
exports.allLocations = allLocations;
const getLocationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }
        const doc = yield db.collection("locations").doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ message: "Location not found" });
        }
        return res.status(200).json(Object.assign({ id: doc.id }, doc.data()));
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching location",
            error
        });
    }
});
exports.getLocationById = getLocationById;
const updateLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }
        const docRef = db.collection("locations").doc(id);
        const doc = yield docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: "Location not found" });
        }
        yield docRef.update(updates);
        return res.status(200).json({
            message: "Location updated successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error updating location",
            error
        });
    }
});
exports.updateLocation = updateLocation;
const addLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newLocation = req.body;
        if (!newLocation.createdAt ||
            !newLocation.isActive ||
            !newLocation.name ||
            !newLocation.section) {
            return res.status(400).json({ error: "Missing required fields for location" });
        }
        const docRef = yield db.collection("locations").add(newLocation);
        return res.status(201).json(Object.assign({ id: docRef.id }, newLocation));
    }
    catch (error) {
        return res.status(500).json({ message: "Error creating location", error });
    }
});
exports.addLocation = addLocation;

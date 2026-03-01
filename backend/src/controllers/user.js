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
exports.updateUser = exports.addUser = exports.deleteUserById = exports.getUserById = exports.getAllUsers = void 0;
const firebase_1 = require("../config/firebase");
const jsonResponses_1 = require("../utils/jsonResponses");
// This is is where you would write the code for the User controllers. 
// Get all users controller
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = (0, firebase_1.getDb)();
        const usersSnapshot = yield db.collection('users').get();
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push(Object.assign({ id: doc.id }, doc.data()));
        });
        res.status(200).json((0, jsonResponses_1.successJson)(users));
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json((0, jsonResponses_1.errorJson)('Failed to fetch users'));
    }
});
exports.getAllUsers = getAllUsers;
// Get user by ID controller
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            res.status(400).json((0, jsonResponses_1.errorJson)('Invalid or missing user ID'));
            return;
        }
        const db = (0, firebase_1.getDb)();
        const userDoc = yield db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            res.status(404).json((0, jsonResponses_1.errorJson)('User not found'));
            return;
        }
        const user = Object.assign({ id: userDoc.id }, userDoc.data());
        res.status(200).json((0, jsonResponses_1.successJson)(user));
    }
    catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json((0, jsonResponses_1.errorJson)('Failed to fetch user by ID'));
    }
});
exports.getUserById = getUserById;
// Delete user by ID controller
const deleteUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id || typeof id !== 'string') {
            res.status(400).json((0, jsonResponses_1.errorJson)('Invalid or missing user ID'));
            return;
        }
        const db = (0, firebase_1.getDb)();
        const userDoc = yield db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            res.status(404).json((0, jsonResponses_1.errorJson)('User not found'));
            return;
        }
        yield db.collection('users').doc(id).delete();
        res.status(200).json((0, jsonResponses_1.successJson)('User with ID ' + id + ' deleted successfully'));
    }
    catch (error) {
        console.error('Error deleting user by ID:', error);
        res.status(500).json((0, jsonResponses_1.errorJson)('Failed to delete user by ID'));
    }
});
exports.deleteUserById = deleteUserById;
// Add user controller
const addUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, name, email } = req.body;
        if (!name || typeof name !== 'string' || name.trim() === '') {
            res.status(400).json((0, jsonResponses_1.errorJson)("Missing or invalid 'name' in request body"));
            return;
        }
        if (!email || typeof email !== 'string' || email.trim() === '') {
            res.status(400).json((0, jsonResponses_1.errorJson)("Missing or invalid 'email' in request body"));
            return;
        }
        if (id !== undefined && (typeof id !== 'string' || id.trim() === '')) {
            res.status(400).json((0, jsonResponses_1.errorJson)("Invalid 'id' in request body"));
            return;
        }
        const db = (0, firebase_1.getDb)();
        const payload = {
            name: name.trim(),
            email: email.trim(),
        };
        let userRef;
        if (typeof id === 'string' && id.trim() !== '') {
            userRef = db.collection('users').doc(id.trim());
            yield userRef.set(payload);
        }
        else {
            userRef = yield db.collection('users').add(payload);
        }
        const createdDoc = yield userRef.get();
        const createdUser = Object.assign({ id: createdDoc.id }, createdDoc.data());
        res.status(201).json((0, jsonResponses_1.successJson)(createdUser));
    }
    catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json((0, jsonResponses_1.errorJson)('Failed to add user'));
    }
});
exports.addUser = addUser;
// Update user controller
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, name, email } = req.body;
        if (!id || typeof id !== 'string' || id.trim() === '') {
            res.status(400).json((0, jsonResponses_1.errorJson)("Missing or invalid 'id' in request body"));
            return;
        }
        if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
            res.status(400).json((0, jsonResponses_1.errorJson)("Invalid 'name' field"));
            return;
        }
        if (email !== undefined && (typeof email !== 'string' || email.trim() === '')) {
            res.status(400).json((0, jsonResponses_1.errorJson)("Invalid 'email' field"));
            return;
        }
        const db = (0, firebase_1.getDb)();
        const userRef = db.collection('users').doc(id.trim());
        const existingDoc = yield userRef.get();
        if (!existingDoc.exists) {
            res.status(404).json((0, jsonResponses_1.errorJson)('User not found'));
            return;
        }
        const updates = {};
        if (typeof name === 'string') {
            updates.name = name.trim();
        }
        if (typeof email === 'string') {
            updates.email = email.trim();
        }
        if (Object.keys(updates).length > 0) {
            yield userRef.update(updates);
        }
        const updatedDoc = yield userRef.get();
        const updatedUser = Object.assign({ id: updatedDoc.id }, updatedDoc.data());
        res.status(200).json((0, jsonResponses_1.successJson)(updatedUser));
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json((0, jsonResponses_1.errorJson)('Failed to update user'));
    }
});
exports.updateUser = updateUser;

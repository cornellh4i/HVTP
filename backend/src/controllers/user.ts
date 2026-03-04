import { UserFields, UserUpdate } from '../models/users';
import { getDb } from '../config/firebase';
import { Request, Response } from 'express';
import { successJson, errorJson } from '../utils/jsonResponses';

// This is is where you would write the code for the User controllers. 

// Get all users controller
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const db = getDb();
        const usersSnapshot = await db.collection('users').get();
        const users: UserFields[] = [];

        usersSnapshot.forEach(doc => {
            users.push({
               id: doc.id,
               ...doc.data()
            } as UserFields);
        });
        res.status(200).json(successJson(users));

    } catch (error) {
        console.error('Error fetching users: ', error);
        res.status(500).json(errorJson('Failed to fetch users'));
    }
};

// Get user by ID controller
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            res.status(400).json(errorJson('Invalid or missing user ID'));
            return;
        }

        const db = getDb();
        const userDoc = await db.collection('users').doc(id).get();

        if (!userDoc.exists) {
            res.status(404).json(errorJson('User not found'));
            return;
        }

        const user: UserFields = {
            id: userDoc.id,
            ...userDoc.data()
        } as UserFields;
        res.status(200).json(successJson(user));

    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json(errorJson('Failed to fetch user by ID'));
    }
};

// Delete user by ID controller
export const deleteUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== 'string') {
            res.status(400).json(errorJson('Invalid or missing user ID'));
            return;
        }

        const db = getDb();
        const userDoc = await db.collection('users').doc(id).get();

        if (!userDoc.exists) {
            res.status(404).json(errorJson('User not found'));
            return;
        }

        await db.collection('users').doc(id).delete();
        res.status(200).json(successJson('User with ID ' + id + ' deleted successfully'));

    } catch (error) {
        console.error('Error deleting user by ID:', error);
        res.status(500).json(errorJson('Failed to delete user by ID'));
    }
}

// Add user controller
export const addUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, name, email } = req.body as {
            id?: unknown;
            name?: unknown;
            email?: unknown;
        };

        if (!name || typeof name !== 'string' || name.trim() === '') {
            res.status(400).json(errorJson("Missing or invalid 'name' in request body"));
            return;
        }

        if (!email || typeof email !== 'string' || email.trim() === '') {
            res.status(400).json(errorJson("Missing or invalid 'email' in request body"));
            return;
        }

        if (id !== undefined && (typeof id !== 'string' || id.trim() === '')) {
            res.status(400).json(errorJson("Invalid 'id' in request body"));
            return;
        }

        const db = getDb();
        const payload = {
            name: name.trim(),
            email: email.trim(),
        };

        let userRef: FirebaseFirestore.DocumentReference;
        if (typeof id === 'string' && id.trim() !== '') {
            userRef = db.collection('users').doc(id.trim());
            await userRef.set(payload);
        } else {
            userRef = await db.collection('users').add(payload);
        }

        const createdDoc = await userRef.get();
        const createdUser: UserFields = {
            id: createdDoc.id,
            ...createdDoc.data()
        } as UserFields;

        res.status(201).json(successJson(createdUser));
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json(errorJson('Failed to add user'));
    }
};

// Update user controller
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, name, email } = req.body as {
            id?: unknown;
            name?: unknown;
            email?: unknown;
        };

        if (!id || typeof id !== 'string' || id.trim() === '') {
            res.status(400).json(errorJson("Missing or invalid 'id' in request body"));
            return;
        }

        if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
            res.status(400).json(errorJson("Invalid 'name' field"));
            return;
        }

        if (email !== undefined && (typeof email !== 'string' || email.trim() === '')) {
            res.status(400).json(errorJson("Invalid 'email' field"));
            return;
        }

        const db = getDb();
        const userRef = db.collection('users').doc(id.trim());
        const existingDoc = await userRef.get();

        if (!existingDoc.exists) {
            res.status(404).json(errorJson('User not found'));
            return;
        }

        const updates: UserUpdate = {};
        if (typeof name === 'string') {
            updates.name = name.trim();
        }
        if (typeof email === 'string') {
            updates.email = email.trim();
        }

        if (Object.keys(updates).length > 0) {
            await userRef.update(
                updates as FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData>
            );
        }

        const updatedDoc = await userRef.get();
        const updatedUser: UserFields = {
            id: updatedDoc.id,
            ...updatedDoc.data()
        } as UserFields;

        res.status(200).json(successJson(updatedUser));
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json(errorJson('Failed to update user'));
    }
};


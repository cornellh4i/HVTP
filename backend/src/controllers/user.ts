import { UserFields, UserInsert, UserUpdate} from '../models/users';
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
        console.error('Error fetching users:', error);
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
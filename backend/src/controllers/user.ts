import { UserFields, UserUpdate } from "../models/users";
import { getDb } from "../config/firebase";

const usersCollection = "users";

const mapUserDoc = (
  id: string,
  data: FirebaseFirestore.DocumentData
): UserFields => ({
  id,
  name: data.name as string,
  email: data.email as string,
});

/**
 * Finds a user by Firestore document id.
 */
const getUserById = async (id: string): Promise<UserFields | null> => {
  const doc = await getDb().collection(usersCollection).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return mapUserDoc(doc.id, doc.data() ?? {});
};

/**
 * Creates a user in Firestore.
 */
const createUser = async (user: UserFields): Promise<UserFields> => {
  const { id, ...userData } = user;

  if (id && id.trim() !== "") {
    const userRef = getDb().collection(usersCollection).doc(id.trim());
    await userRef.set(userData);
    const createdDoc = await userRef.get();
    return mapUserDoc(createdDoc.id, createdDoc.data() ?? {});
  }

  const userRef = await getDb().collection(usersCollection).add(userData);
  const createdDoc = await userRef.get();
  return mapUserDoc(createdDoc.id, createdDoc.data() ?? {});
};

/**
 * Updates existing user fields by Firestore document id.
 */
const updateUser = async (
  id: string,
  updates: UserUpdate
): Promise<UserFields | null> => {
  const safeUpdates: UserUpdate = { ...updates };
  delete safeUpdates.id;

  if (Object.keys(safeUpdates).length === 0) {
    return getUserById(id);
  }

  const userRef = getDb().collection(usersCollection).doc(id);
  const existingDoc = await userRef.get();

  if (!existingDoc.exists) {
    return null;
  }

  await userRef.update(safeUpdates);
  const updatedDoc = await userRef.get();

  return mapUserDoc(updatedDoc.id, updatedDoc.data() ?? {});
};

export default {
  createUser,
  getUserById,
  updateUser,
};

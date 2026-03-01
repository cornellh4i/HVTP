import { UserInsert, UserRecord, UserUpdate } from "../models/users";
import { getDb } from "../config/firebase";

const usersCollection = "users";

const mapUserDoc = (
  id: string,
  data: FirebaseFirestore.DocumentData
): UserRecord => ({
  id,
  name: data.name as string,
  email: data.email as string,
});

/**
 * Finds a user by Firestore document id.
 */
const getUserById = async (id: string): Promise<UserRecord | null> => {
  const doc = await getDb().collection(usersCollection).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return mapUserDoc(doc.id, doc.data() ?? {});
};

/**
 * Creates a user in Firestore.
 */
const createUser = async (user: UserInsert): Promise<UserRecord> => {
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
): Promise<UserRecord | null> => {
  const safeUpdates: UserUpdate = { ...updates };

  if (Object.keys(safeUpdates).length === 0) {
    return getUserById(id);
  }

  const userRef = getDb().collection(usersCollection).doc(id);
  const existingDoc = await userRef.get();

  if (!existingDoc.exists) {
    return null;
  }

  await userRef.update(
    safeUpdates as FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData>
  );
  const updatedDoc = await userRef.get();

  return mapUserDoc(updatedDoc.id, updatedDoc.data() ?? {});
};

export default {
  createUser,
  getUserById,
  updateUser,
};

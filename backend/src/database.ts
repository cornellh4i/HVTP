import admin, { getDb }from "./config/firebase";

let db: FirebaseFirestore.Firestore;

export const dbConnect = async () => {
  // Initialize Firestore (Firebase already initialized in firebase.ts)
  db = getDb();
  console.log("✅ Connected to Firestore");
};

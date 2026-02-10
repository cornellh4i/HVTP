import admin from "firebase-admin";

let db: FirebaseFirestore.Firestore;

export const dbConnect = async () => {
  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    } as admin.ServiceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  
  // Initialize Firestore after admin app is initialized
  db = admin.firestore();
  console.log("✅ Connected to Firestore");
};

export const getDb = () => db;
export default admin;

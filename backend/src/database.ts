import admin from "firebase-admin";

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
  console.log("✅ Connected to Firestore");
};

export const db = admin.firestore();
export default admin;

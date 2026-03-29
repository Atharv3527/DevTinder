import admin from 'firebase-admin';

// Load service account securely from ENV vars
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Handle newlines formatting in the private key env variable natively
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("🔥 Firebase Admin Intialized Successfully");
  }
} catch (error) {
  console.warn("⚠️ Firebase Admin initialization failed. Ensure ENV variables are properly configured.");
}

export default admin;

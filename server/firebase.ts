import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { randomBytes } from "crypto";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAsfaeqJb31HALjByEeJnqi-f7fHaf-6pI",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "roayati-650a8.firebaseapp.com",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://roayati-650a8-default-rtdb.firebaseio.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "roayati-650a8",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "roayati-650a8.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "666564258242",
  appId: process.env.FIREBASE_APP_ID || "1:666564258242:web:d711dbd8b733646b250e5b",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-Z1Z1H8HVF7"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export async function uploadToFirebase(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<string> {
  const uniqueName = randomBytes(16).toString("hex");
  const ext = originalName.split('.').pop()?.toLowerCase() || 'bin';
  const fileName = `uploads/${uniqueName}.${ext}`;
  
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, fileBuffer, { contentType: mimeType });
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

export default app;

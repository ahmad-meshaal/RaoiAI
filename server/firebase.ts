import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { randomBytes } from "crypto";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
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

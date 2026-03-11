import { getApp, getApps, initializeApp } from "firebase/app";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const storageApp = getStorage(app);

export function storage(basePath: string) {
  return {
    async upload(file: File): Promise<string> {
      const fileName = crypto.randomUUID();
      const storageRef = ref(storageApp, `${basePath}/${fileName}`);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    },
    async remove(fileName: string): Promise<void> {
      const storageRef = ref(storageApp, `${basePath}/${fileName}`);
      await deleteObject(storageRef);
    },
  };
}

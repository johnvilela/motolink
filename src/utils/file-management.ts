import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

export function fileManagement() {
  async function upload({
    files,
    path,
  }: {
    files: File[];
    path: string;
  }): Promise<string[]> {
    if (!files || files.length === 0) return [];

    const normalizedPath = path.replace(/(^\/+|\/+$)/g, "");

    const uploadPromises = files.map(async (file) => {
      const uniqueId = crypto.randomUUID();
      const filePath = `${normalizedPath}/${uniqueId}-${file.name}`;

      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    });

    return Promise.all(uploadPromises);
  }

  return { upload };
}

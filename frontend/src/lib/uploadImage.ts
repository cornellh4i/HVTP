import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase/firebase";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getExtension(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (!ext) {
    throw new Error("File must have a valid extension.");
  }

  return ext;
}

export async function uploadItemImage(
  file: File,
  itemSku: string,
  index: number
) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPG, PNG, and WEBP files are allowed.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image must be 5MB or smaller.");
  }

  const ext = getExtension(file);
  const storageRef = ref(storage, `items/${itemSku}/image_${index}.${ext}`);

  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

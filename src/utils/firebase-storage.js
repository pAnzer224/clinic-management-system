import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadFile(path, file) {
  const storage = getStorage();
  const storageRef = ref(storage, path);

  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
}

export async function downloadFile(path) {
  const storage = getStorage();
  const storageRef = ref(storage, path);

  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

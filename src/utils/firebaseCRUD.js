import { ref, onUnmounted } from "vue";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase-config";

export function useCRUD(collectionName) {
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);
  let unsubscribe = null;

  async function fetchItems() {
    loading.value = true;
    error.value = null;
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      items.value = querySnapshot.docs.map((doc) => ({ ...doc.data() }));
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  function listenToChanges() {
    unsubscribe = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        items.value = snapshot.docs.map((doc) => ({ ...doc.data() }));
      },
      (err) => {
        error.value = err;
      }
    );
  }

  function stopListening() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  async function addItem(data) {
    error.value = null;
    try {
      await setDoc(doc(db, collectionName, data.id), data);
      return data;
    } catch (err) {
      error.value = err;
    }
  }

  async function updateItem(data) {
    error.value = null;
    try {
      await setDoc(doc(db, collectionName, data.id), data);
      return data;
    } catch (err) {
      error.value = err;
    }
  }

  async function deleteItem(itemId) {
    error.value = null;
    try {
      await deleteDoc(doc(db, collectionName, itemId));
    } catch (err) {
      error.value = err;
    }
  }

  async function getItem(itemId) {
    loading.value = true;
    error.value = null;
    try {
      const docSnap = await getDoc(doc(db, collectionName, itemId));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  onUnmounted(() => {
    stopListening();
  });

  return {
    items,
    loading,
    error,
    fetchItems,
    listenToChanges,
    stopListening,
    addItem,
    updateItem,
    deleteItem,
    getItem,
  };
}

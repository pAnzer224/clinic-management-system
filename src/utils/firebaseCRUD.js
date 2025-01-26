import { ref } from "vue";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase-config";

export function useCRUD(collectionName) {
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);

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

  async function addItem(data) {
    loading.value = true;
    error.value = null;
    try {
      await setDoc(doc(db, collectionName, data.id), data);
      await fetchItems();
      return data;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  async function updateItem(data) {
    loading.value = true;
    error.value = null;
    try {
      await setDoc(doc(db, collectionName, data.id), data);
      await fetchItems();
      return data;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteItem(itemId) {
    loading.value = true;
    error.value = null;
    try {
      if (confirm("Are you sure you want to delete this item?")) {
        await deleteDoc(doc(db, collectionName, itemId));
        await fetchItems();
      }
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
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

  return {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    getItem,
  };
}

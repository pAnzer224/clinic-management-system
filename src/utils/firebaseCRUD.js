import { db } from "@/firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function createDocument(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
}

export async function readDocuments(
  collectionName,
  orderByField = null,
  whereClause = null
) {
  try {
    let q = collection(db, collectionName);

    // Build the query
    const queryConstraints = [];

    if (orderByField) {
      queryConstraints.push(orderBy(orderByField));
    }

    if (whereClause && Array.isArray(whereClause)) {
      const [field, operator, value] = whereClause;
      queryConstraints.push(where(field, operator, value));
    }

    // Apply all query constraints if any exist
    if (queryConstraints.length > 0) {
      q = query(q, ...queryConstraints);
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error reading documents:", error);
    throw error;
  }
}

export async function updateDocument(collectionName, id, data) {
  try {
    await updateDoc(doc(db, collectionName, id), data);
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
}

export async function deleteDocument(collectionName, id) {
  if (!collectionName || !id) {
    throw new Error(
      "Collection name and document ID are required for deletion"
    );
  }

  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}

export async function setDocument(collectionName, id, data) {
  try {
    await setDoc(doc(db, collectionName, id), data, { merge: true });
  } catch (error) {
    console.error("Error setting document:", error);
    throw error;
  }
}

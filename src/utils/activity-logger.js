import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase-config";

export async function logActivity(data) {
  try {
    // Get current user from localStorage, matching the pattern in Sidebar.vue and Settings.vue
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
      throw new Error("No user found in localStorage");
    }

    // Determine role and ID based on the user type, matching the pattern in Settings.vue
    const role = currentUser.adminId ? "admin" : "staff";

    // Add user information to activity log
    await addDoc(collection(db, "activities"), {
      ...data,
      timestamp: data.timestamp || serverTimestamp(),
      performedBy: {
        name: currentUser.adminId,
        id: currentUser.adminId || currentUser.staffId,
        role: role,
        email: currentUser.email,
      },
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    throw error; // Re-throw to allow handling by the calling code
  }
}

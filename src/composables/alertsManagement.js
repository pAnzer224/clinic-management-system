import { ref, computed, onMounted } from "vue";
import {
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import { useCRUD } from "@/utils/firebaseCRUD";
import { logActivity } from "@/utils/activity-logger";

export function useAlertsLogic() {
  const {
    items: alerts,
    loading,
    error,
    listenToChanges,
    addItem,
    updateItem,
    deleteItem,
  } = useCRUD("healthAlerts");

  // Reminders and records
  const medicalRecords = ref([]);
  const followUpReminders = ref([]);
  const currentReminderIndex = ref(0);
  const systemAlerts = ref([]);

  const searchQuery = ref("");
  const filterPriority = ref("");
  const showModal = ref(false);
  const isEditing = ref(false);
  const currentUser = ref(
    JSON.parse(localStorage.getItem("currentUser")) || {}
  );

  const initialAlertForm = {
    id: "",
    title: "",
    description: "",
    priority: "Medium",
    date: new Date().toISOString().split("T")[0],
    createdBy: currentUser.value,
    isRead: false,
  };

  const alertForm = ref({ ...initialAlertForm });

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  const alertPriorityOptions = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  // Filter for alerts
  const filteredAlerts = computed(() => {
    return alerts.value.filter((alert) => {
      const matchesSearch =
        !searchQuery.value ||
        alert.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        alert.description
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase());
      const matchesPriority =
        !filterPriority.value || alert.priority === filterPriority.value;
      return matchesSearch && matchesPriority;
    });
  });

  // Get unread alerts
  const unreadAlerts = computed(() => {
    return alerts.value
      .filter((alert) => !alert.isRead)
      .sort((a, b) => {
        // High priority first, then Medium, then Low
        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 5); // Show only top 5 unread alerts
  });

  // Get all unread alerts including system alerts for notification count
  const allUnreadAlerts = computed(() => {
    const unreadCustomAlerts = alerts.value.filter(
      (alert) =>
        !alert.isRead &&
        (alert.priority === "High" || alert.priority === "Medium")
    );
    const highPrioritySystemAlerts = systemAlerts.value.filter(
      (alert) => alert.priority === "High" || alert.priority === "Medium"
    );
    return [...unreadCustomAlerts, ...highPrioritySystemAlerts];
  });

  const priorityStats = computed(() => {
    const total = alerts.value.length;
    const counts = {
      High: alerts.value.filter((a) => a.priority === "High").length,
      Medium: alerts.value.filter((a) => a.priority === "Medium").length,
      Low: alerts.value.filter((a) => a.priority === "Low").length,
    };

    return Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      percentage: total ? (count / total) * 100 : 0,
    }));
  });

  const nextReminder = () => {
    if (currentReminderIndex.value < followUpReminders.value.length - 1) {
      currentReminderIndex.value++;
    }
  };

  const prevReminder = () => {
    if (currentReminderIndex.value > 0) {
      currentReminderIndex.value--;
    }
  };

  function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Mark alert as read
  async function markAsRead(alert) {
    try {
      const alertRef = doc(db, "healthAlerts", alert.id);

      // Update the alert in Firestore
      await updateDoc(alertRef, {
        isRead: true,
        updatedAt: serverTimestamp(),
      });

      // Update the local state
      const updatedAlert = { ...alert, isRead: true };
      await updateItem(updatedAlert);

      await logActivity({
        type: "alert",
        action: "read",
        title: "Alert Read",
        description: `Marked alert as read: ${alert.title}`,
        timestamp: serverTimestamp(),
        performedBy: currentUser.value,
      });
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  }

  async function resolveSystemAlert(alert) {
    try {
      // Remove from the system alerts array
      systemAlerts.value = systemAlerts.value.filter((a) => a.id !== alert.id);

      await logActivity({
        type: "alert",
        action: "resolve",
        title: "System Alert Resolved",
        description: `Resolved system alert: ${alert.title}`,
        timestamp: serverTimestamp(),
        performedBy: currentUser.value,
      });
    } catch (error) {
      console.error("Error resolving system alert:", error);
    }
  }

  async function fetchMedicalRecords() {
    try {
      // Fetch all medical records with follow-up dates
      const recordsRef = collection(db, "medicalRecords");
      const recordsQuery = query(recordsRef, where("followUpDate", "!=", null));

      const querySnapshot = await getDocs(recordsQuery);
      const records = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      medicalRecords.value = records;

      // Get all follow-up reminders (not just top 5)
      followUpReminders.value = records
        .filter((record) => record.followUpDate)
        .map((record) => ({
          id: record.id,
          studentName: record.studentName,
          followUpDate: record.followUpDate,
          reason: record.chiefComplaint || record.diagnosis,
        }));
    } catch (error) {
      console.error("Error fetching medical records:", error);
    }
  }

  // Update the fetchMedicationAlerts function in alertsManagement.js
  async function fetchMedicationAlerts() {
    try {
      // Fetch medications
      const medicationsRef = collection(db, "medications");
      const querySnapshot = await getDocs(medicationsRef);
      const medications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      // Generate system alerts for low stock medications
      const lowStockMedications = medications.filter(
        (med) => med.status === "Low Stock" || med.status === "Out of Stock"
      );

      // Generate system alerts for medications about to expire
      const expiringMedications = medications.filter((med) => {
        if (!med.expirationDate) return false;
        const expDate = new Date(med.expirationDate);
        return expDate <= thirtyDaysFromNow && expDate >= now;
      });

      // Create system alerts
      let newSystemAlerts = [];

      if (lowStockMedications.length > 0) {
        newSystemAlerts.push({
          id: "low-stock-" + Date.now(),
          title: "Low Stock Medications Alert",
          description: `${lowStockMedications.length} medication(s) ${
            lowStockMedications.length === 1 ? "is" : "are"
          } running low or out of stock. Please replenish soon.`,
          priority: "High",
          date: new Date().toISOString(),
        });
      }

      if (expiringMedications.length > 0) {
        newSystemAlerts.push({
          id: "expiring-" + Date.now(),
          title: "Medications Expiring Soon",
          description: `${expiringMedications.length} medication(s) will expire within 30 days. Please check inventory.`,
          priority: "Medium",
          date: new Date().toISOString(),
        });
      }

      systemAlerts.value = newSystemAlerts;

      // Store system alerts in localStorage to make them available for the sidebar
      localStorage.setItem("systemAlerts", JSON.stringify(newSystemAlerts));
    } catch (error) {
      console.error("Error fetching medication alerts:", error);
    }
  }

  // Update the resolveSystemAlert function
  async function resolveSystemAlert(alert) {
    try {
      // Remove from the system alerts array
      systemAlerts.value = systemAlerts.value.filter((a) => a.id !== alert.id);

      // Update localStorage
      localStorage.setItem("systemAlerts", JSON.stringify(systemAlerts.value));

      await logActivity({
        type: "alert",
        action: "resolve",
        title: "System Alert Resolved",
        description: `Resolved system alert: ${alert.title}`,
        timestamp: serverTimestamp(),
        performedBy: currentUser.value,
      });
    } catch (error) {
      console.error("Error resolving system alert:", error);
    }
  }

  function showAddAlertModal() {
    isEditing.value = false;
    alertForm.value = { ...initialAlertForm, id: Date.now().toString() };
    showModal.value = true;
  }

  function editAlert(alert) {
    isEditing.value = true;
    alertForm.value = { ...alert };
    showModal.value = true;
  }

  async function deleteAlert(alert) {
    if (confirm("Are you sure you want to delete this alert?")) {
      try {
        await deleteItem(alert.id);
        await logActivity({
          type: "alert",
          action: "delete",
          title: "Alert Deleted",
          description: `Deleted alert: ${alert.title}`,
          timestamp: serverTimestamp(),
          performedBy: currentUser.value,
        });
      } catch (error) {
        console.error("Error deleting alert:", error);
      }
    }
  }

  async function submitAlert() {
    try {
      const alertData = {
        ...alertForm.value,
        updatedAt: serverTimestamp(),
        isRead: false, // Always set to unread when created or updated
      };

      if (!isEditing.value) {
        alertData.createdAt = serverTimestamp();
        await addItem(alertData);
      } else {
        await updateItem(alertData);
      }

      await logActivity({
        type: "alert",
        action: isEditing.value ? "update" : "create",
        title: isEditing.value ? "Alert Updated" : "New Alert Created",
        description: isEditing.value
          ? `Updated alert: ${alertData.title}`
          : `Created new alert: ${alertData.title}`,
        timestamp: serverTimestamp(),
        performedBy: currentUser.value,
      });

      showModal.value = false;
    } catch (error) {
      console.error("Error saving alert:", error);
    }
  }

  onMounted(() => {
    listenToChanges();
    fetchMedicalRecords();
    fetchMedicationAlerts();
  });

  return {
    alerts,
    loading,
    error,
    searchQuery,
    filterPriority,
    showModal,
    isEditing,
    alertForm,
    priorityOptions,
    alertPriorityOptions,
    filteredAlerts,
    priorityStats,
    formatDate,
    showAddAlertModal,
    editAlert,
    deleteAlert,
    submitAlert,
    markAsRead,
    unreadAlerts,
    followUpReminders,
    systemAlerts,
    resolveSystemAlert,
    currentReminderIndex,
    nextReminder,
    prevReminder,
    allUnreadAlerts,
  };
}

import { ref, computed, onMounted } from "vue";
import {
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  doc,
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
  const diagnosisStats = ref([]);
  const currentReminderIndex = ref(0);

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

  const diagnosisChartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: [],
    },
    colors: ["#3B82F6"],
  };

  const diagnosisChartSeries = ref([
    {
      name: "Patients",
      data: [],
    },
  ]);

  // Monthly trend chart
  const chartOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      height: 160,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    yaxis: {
      min: 0,
    },
    colors: ["#3B82F6"],
    tooltip: {
      theme: "light",
    },
    markers: {
      size: 4,
      strokeWidth: 0,
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  const chartSeries = ref([
    {
      name: "Alerts",
      data: [3, 5, 7, 4, 6, 9, 8, 10, 12, 8, 6, 4],
    },
  ]);

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

      // Calculate diagnosis stats
      const diagnosisCounts = {};
      records.forEach((record) => {
        if (record.diagnosis) {
          diagnosisCounts[record.diagnosis] =
            (diagnosisCounts[record.diagnosis] || 0) + 1;
        }
      });

      // Sort by count and take top 5
      const sortedDiagnoses = Object.entries(diagnosisCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Update chart data
      diagnosisChartOptions.xaxis.categories = sortedDiagnoses.map(
        (item) => item[0]
      );
      diagnosisChartSeries.value[0].data = sortedDiagnoses.map(
        (item) => item[1]
      );
    } catch (error) {
      console.error("Error fetching medical records:", error);
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
    diagnosisChartOptions,
    diagnosisChartSeries,
    chartOptions,
    chartSeries,
    currentReminderIndex,
    nextReminder,
    prevReminder,
  };
}

<template>
  <main class="flex-1 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Medical Records</h1>
      <button
        @click="showAddRecord"
        class="bg-blue1 text-white px-4 py-2 rounded-full"
      >
        Add Record
      </button>
    </div>

    <!-- Search and Filter Section -->
    <div class="bg-white rounded-2xl p-8 shadow-sm">
      <div class="flex gap-4 mb-6 text-[13px]">
        <input
          type="search"
          v-model="searchQuery"
          placeholder="Search by student name or ID..."
          class="px-4 py-2 rounded-full bg-graytint/40 border border-text/20"
        />
        <select v-model="filterDate" class="px-4 py-2 rounded-full bg-graytint">
          <option value="">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <!-- Records Table -->
      <table class="w-full">
        <thead>
          <tr class="text-left text-text/60">
            <th v-for="header in TABLE_HEADERS" :key="header" class="pb-4">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="record in filteredRecords"
            :key="record.id"
            class="border-t border-graytint hover:bg-gray-50"
          >
            <td class="py-4">{{ formatDate(record.date) }}</td>
            <td>{{ record.studentName }}</td>
            <td>{{ record.studentId }}</td>
            <td>{{ record.chiefComplaint }}</td>
            <td>{{ record.diagnosis }}</td>
            <td>{{ record.status }}</td>
            <td class="space-x-2">
              <button @click="viewRecord(record)" class="text-blue1">
                <EyeIcon class="h-5 w-5 inline" />
              </button>
              <button @click="editRecord(record)" class="text-green-600">
                <PencilIcon class="h-5 w-5 inline" />
              </button>
              <button @click="deleteRecord(record.id)" class="text-red-600">
                <TrashIcon class="h-5 w-5 inline" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>

  <!-- Modal for viewing health alerts -->
  <div
    v-if="showHealthAlert"
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
  >
    <div class="bg-white rounded-2xl p-6 shadow-lg w-[400px]">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-satoshi-bold">Health Alerts</h3>
        <button @click="showHealthAlert = false" class="text-gray-500">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
      <div class="space-y-2">
        <div
          v-for="alert in healthAlerts"
          :key="alert.id"
          class="p-3 bg-red-50 rounded-lg"
        >
          <p class="text-red-700 font-medium">{{ alert.message }}</p>
          <p class="text-sm text-red-600">{{ alert.date }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Record Modal Component -->
  <RecordModal
    v-model="showModal"
    :is-editing="isEditing"
    :initial-form-data="formData"
    :students="students"
    @submit="submitForm"
  />
</template>

<script>
import { ref, computed, onMounted } from "vue";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import RecordModal from "@/components/RecordModal.vue";

const TABLE_HEADERS = [
  "Date",
  "Student Name",
  "Student ID",
  "Chief Complaint",
  "Diagnosis",
  "Status",
  "Actions",
];

const INITIAL_FORM = {
  id: "",
  date: new Date().toISOString().split("T")[0],
  studentId: "",
  studentName: "",
  chiefComplaint: "",
  symptoms: [],
  diagnosis: "",
  treatment: "",
  medications: [],
  notes: "",
  followUpDate: "",
  status: "Active",
  vitals: {
    temperature: "",
    bloodPressure: "",
    pulseRate: "",
    respiratoryRate: "",
  },
};

export default {
  name: "Records",
  components: {
    RecordModal,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
  },
  setup() {
    const records = ref([]);
    const students = ref([]);
    const searchQuery = ref("");
    const filterDate = ref("");
    const showModal = ref(false);
    const showHealthAlert = ref(false);
    const isEditing = ref(false);
    const formData = ref({ ...INITIAL_FORM });
    const healthAlerts = ref([]);

    // Fetch all required data
    async function fetchData() {
      await Promise.all([fetchRecords(), fetchStudents(), fetchHealthAlerts()]);
    }

    async function fetchRecords() {
      const q = query(
        collection(db, "medicalRecords"),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      records.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    async function fetchStudents() {
      const querySnapshot = await getDocs(collection(db, "students"));
      students.value = querySnapshot.docs.map((doc) => ({ ...doc.data() }));
    }

    async function fetchHealthAlerts() {
      const today = new Date();
      const q = query(
        collection(db, "healthAlerts"),
        where("date", ">=", today.toISOString()),
        orderBy("date")
      );
      const querySnapshot = await getDocs(q);
      healthAlerts.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    // Computed property for filtered records
    const filteredRecords = computed(() => {
      return records.value.filter((record) => {
        const matchesSearch =
          !searchQuery.value ||
          record.studentName
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase()) ||
          record.studentId.includes(searchQuery.value);

        const matchesDate =
          !filterDate.value || filterDateRange(record.date, filterDate.value);

        return matchesSearch && matchesDate;
      });
    });

    // Helper function for date filtering
    function filterDateRange(dateStr, range) {
      const recordDate = new Date(dateStr);
      const today = new Date();

      switch (range) {
        case "today":
          return recordDate.toDateString() === today.toDateString();
        case "week":
          const weekAgo = new Date(today.setDate(today.getDate() - 7));
          return recordDate >= weekAgo;
        case "month":
          const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
          return recordDate >= monthAgo;
        default:
          return true;
      }
    }

    function formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // CRUD Operations
    function showAddRecord() {
      isEditing.value = false;
      formData.value = { ...INITIAL_FORM };
      showModal.value = true;
    }

    function viewRecord(record) {
      isEditing.value = true;
      formData.value = { ...record };
      showModal.value = true;
    }

    function editRecord(record) {
      isEditing.value = true;
      formData.value = { ...record };
      showModal.value = true;
    }

    async function deleteRecord(id) {
      if (confirm("Are you sure you want to delete this record?")) {
        await deleteDoc(doc(db, "medicalRecords", id));
        await fetchRecords();
      }
    }

    async function submitForm(data) {
      try {
        const docRef = doc(
          db,
          "medicalRecords",
          data.id || Date.now().toString()
        );
        await setDoc(docRef, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
        await fetchRecords();
        showModal.value = false;
      } catch (error) {
        console.error("Error saving record:", error);
      }
    }

    // Initial data fetch
    onMounted(() => {
      fetchData();
    });

    return {
      records,
      students,
      searchQuery,
      filterDate,
      showModal,
      showHealthAlert,
      isEditing,
      formData,
      healthAlerts,
      filteredRecords,
      TABLE_HEADERS,
      formatDate,
      showAddRecord,
      viewRecord,
      editRecord,
      deleteRecord,
      submitForm,
    };
  },
};
</script>

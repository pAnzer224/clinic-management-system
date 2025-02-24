<template>
  <main class="flex-1 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Medical Records</h1>
      <button
        @click="showAddRecord"
        class="bg-blue1 hover:bg-blue1/80 text-white px-4 py-2 rounded-full text-[15px]"
      >
        Add Record
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div class="bg-white rounded-2xl px-8 pt-8 pb-2 shadow-sm">
        <div class="flex gap-4 mb-6 text-[13px] relative">
          <div class="relative w-80 flex-1">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            />
            <input
              type="search"
              v-model="searchQuery"
              placeholder="Search by student name or ID..."
              class="pl-10 px-4 py-2 rounded-full bg-graytint/40 border border-text/20 focus:ring-1 focus:ring-blue1/50 focus:outline-none"
            />
          </div>
          <Dropdown
            v-model="filterDate"
            :options="dateFilterOptions"
            class="w-40"
          />
        </div>

        <div v-if="loading" class="flex justify-center items-center py-8">
          <intersecting-circles-spinner
            :animation-duration="1200"
            :size="70"
            color="#3f73ce"
          />
        </div>

        <div v-else class="relative">
          <div class="sticky top-0 bg-white z-10">
            <table class="w-full table-fixed">
              <thead>
                <tr class="text-left text-text/60">
                  <th class="pb-4 w-1/6">Date</th>
                  <th class="pb-4 w-1/6">Student Name</th>
                  <th class="pb-4 w-1/6">Student ID</th>
                  <th class="pb-4 w-1/6">Chief Complaint</th>
                  <th class="pb-4 w-1/6">Diagnosis</th>
                  <th class="pb-4 w-1/6">Status</th>
                  <th class="pb-4 w-1/12">Actions</th>
                </tr>
              </thead>
            </table>
            <div
              class="absolute bottom-0 left-0 right-0 border-t border-graytint"
            ></div>
          </div>

          <div class="relative">
            <div
              class="min-h-[calc(100.2vh-335px)] max-h-[calc(100.2vh-335px)] overflow-y-scroll no-scrollbar"
            >
              <table class="w-full table-fixed">
                <tbody>
                  <tr
                    v-for="record in filteredRecords"
                    :key="record.id"
                    class="border-t border-graytint/50"
                  >
                    <td class="py-4 w-1/6">
                      <div class="flex flex-col">
                        <span>{{ formatDateShort(record.date) }}</span>
                        <span class="text-xs text-gray-500">{{
                          formatTimeOnly(record.date)
                        }}</span>
                      </div>
                    </td>
                    <td class="w-1/6 truncate">{{ record.studentName }}</td>
                    <td class="w-1/6">{{ record.studentId }}</td>
                    <td class="w-1/6 truncate">{{ record.chiefComplaint }}</td>
                    <td class="w-1/6 truncate">{{ record.diagnosis }}</td>
                    <td class="w-1/6">{{ record.status }}</td>
                    <td class="w-1/12 space-x-2">
                      <button
                        @click="editRecord(record)"
                        class="text-blue2/90 hover:text-blue1"
                      >
                        <EyeIcon class="h-5 w-5 inline" />
                      </button>
                      <button
                        @click="deleteRecord(record)"
                        class="text-red-600"
                      >
                        <TrashIcon class="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <RecordModal
      v-model="showModal"
      :is-editing="isEditing"
      :initial-form-data="formData"
      :students="students"
      :appointments="appointments"
      @submit="submitForm"
    />

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
  </main>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import {
  EyeIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";
import RecordModal from "@/components/RecordModal.vue";
import { IntersectingCirclesSpinner } from "epic-spinners";
import Dropdown from "@/components/Dropdown.vue";

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
    TrashIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    IntersectingCirclesSpinner,
    Dropdown,
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
    const loading = ref(true);
    const dateFilterOptions = [
      { value: "", label: "All Time" },
      { value: "today", label: "Today" },
      { value: "week", label: "Last 7 Days" },
      { value: "month", label: "Last 30 Days" },
    ];

    let recordsUnsubscribe = null;
    let healthAlertsUnsubscribe = null;

    async function fetchData() {
      loading.value = true;
      try {
        await fetchStudents();
        setupSnapshotListeners();
      } finally {
        loading.value = false;
      }
    }

    function setupSnapshotListeners() {
      const recordsQuery = query(
        collection(db, "medicalRecords"),
        orderBy("date", "desc")
      );

      recordsUnsubscribe = onSnapshot(recordsQuery, (snapshot) => {
        records.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      });

      const today = new Date();
      const alertsQuery = query(
        collection(db, "healthAlerts"),
        where("date", ">=", today.toISOString()),
        orderBy("date")
      );

      healthAlertsUnsubscribe = onSnapshot(alertsQuery, (snapshot) => {
        healthAlerts.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      });
    }

    async function fetchStudents() {
      const querySnapshot = await getDocs(collection(db, "students"));
      students.value = querySnapshot.docs.map((doc) => ({ ...doc.data() }));
    }

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

    function filterDateRange(dateStr, range) {
      const recordDate = new Date(dateStr);
      const today = new Date();

      switch (range) {
        case "today":
          return recordDate.toDateString() === today.toDateString();
        case "week": {
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          return recordDate >= weekAgo;
        }
        case "month": {
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);
          return recordDate >= monthAgo;
        }
        default:
          return true;
      }
    }

    function formatDateShort(dateString) {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });
    }

    function formatTimeOnly(dateString) {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    function showAddRecord() {
      isEditing.value = false;
      formData.value = { ...INITIAL_FORM };
      showModal.value = true;
    }

    function editRecord(record) {
      isEditing.value = true;
      formData.value = { ...record };
      showModal.value = true;
    }

    async function deleteRecord(record) {
      if (confirm("Are you sure you want to delete this record?")) {
        try {
          const docRef = doc(db, "medicalRecords", record.id.toString());
          await deleteDoc(docRef);
        } catch (error) {
          console.error("Error deleting record:", error);
        }
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
        showModal.value = false;
      } catch (error) {
        console.error("Error saving record:", error);
      }
    }

    onMounted(() => {
      fetchData();
    });

    onUnmounted(() => {
      if (recordsUnsubscribe) recordsUnsubscribe();
      if (healthAlertsUnsubscribe) healthAlertsUnsubscribe();
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
      formatDateShort,
      formatTimeOnly,
      showAddRecord,
      editRecord,
      deleteRecord,
      submitForm,
      loading,
      dateFilterOptions,
    };
  },
};
</script>

<template>
  <main class="flex-1 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Medication Inventory</h1>
      <button
        @click="showAddMedication"
        class="bg-blue1 text-white px-4 py-2 rounded-full"
      >
        Add Medication
      </button>
    </div>

    <!-- Search and Filter Section -->
    <div class="bg-white rounded-2xl p-8 shadow-sm">
      <div class="flex gap-4 mb-6 text-[13px]">
        <input
          type="search"
          v-model="searchQuery"
          placeholder="Search medications..."
          class="px-4 py-2 rounded-full bg-graytint/40 border border-text/20"
        />
        <select
          v-model="filterCategory"
          class="px-4 py-2 rounded-full bg-graytint"
        >
          <option value="">All Categories</option>
          <option v-for="category in CATEGORIES" :key="category">
            {{ category }}
          </option>
        </select>
        <select
          v-model="filterStatus"
          class="px-4 py-2 rounded-full bg-graytint"
        >
          <option value="">All Stock Status</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      <!-- Medications Table -->
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
            v-for="medication in filteredMedications"
            :key="medication.id"
            class="border-t border-graytint hover:bg-gray-50"
          >
            <td class="py-4">{{ medication.name }}</td>
            <td>{{ medication.category }}</td>
            <td>{{ medication.dosageForm }}</td>
            <td>{{ medication.currentStock }}</td>
            <td>
              <span
                :class="{
                  'bg-green-100 text-green-800':
                    medication.status === 'In Stock',
                  'bg-yellow-100 text-yellow-800':
                    medication.status === 'Low Stock',
                  'bg-red-100 text-red-800':
                    medication.status === 'Out of Stock',
                }"
                class="px-2 py-1 rounded-full text-sm"
              >
                {{ medication.status }}
              </span>
            </td>
            <td>{{ medication.expirationDate }}</td>
            <td class="space-x-2">
              <button
                @click="adjustStock(medication)"
                class="text-blue1"
                title="Adjust Stock"
              >
                <ArrowsUpDownIcon class="h-5 w-5 inline" />
              </button>
              <button
                @click="editMedication(medication)"
                class="text-green-600"
                title="Edit"
              >
                <PencilIcon class="h-5 w-5 inline" />
              </button>
              <button
                @click="deleteMedication(medication.id)"
                class="text-red-600"
                title="Delete"
              >
                <TrashIcon class="h-5 w-5 inline" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>

  <!-- Medication Modal -->
  <MedicationsModal
    v-model="showModal"
    :is-editing="isEditing"
    :initial-form-data="formData"
    :is-stock-adjustment="isStockAdjustment"
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
} from "firebase/firestore";
import { db } from "@/firebase-config";
import {
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon,
} from "@heroicons/vue/24/outline";
import MedicationsModal from "@/components/MedicationsModal.vue";

const TABLE_HEADERS = [
  "Name",
  "Category",
  "Dosage Form",
  "Current Stock",
  "Status",
  "Expiration Date",
  "Actions",
];

const CATEGORIES = [
  "Analgesics",
  "Antibiotics",
  "Antihistamines",
  "Antipyretics",
  "First Aid",
  "Supplements",
  "Others",
];

const INITIAL_FORM = {
  id: "",
  name: "",
  category: "",
  dosageForm: "",
  strength: "",
  manufacturer: "",
  currentStock: 0,
  minimumStock: 0,
  expirationDate: "",
  location: "",
  notes: "",
  status: "In Stock",
};

export default {
  name: "Medications",
  components: {
    MedicationsModal,
    PencilIcon,
    TrashIcon,
    ArrowsUpDownIcon,
  },
  setup() {
    const medications = ref([]);
    const searchQuery = ref("");
    const filterCategory = ref("");
    const filterStatus = ref("");
    const showModal = ref(false);
    const isEditing = ref(false);
    const isStockAdjustment = ref(false);
    const formData = ref({ ...INITIAL_FORM });

    const filteredMedications = computed(() => {
      return medications.value.filter((med) => {
        const matchesSearch =
          !searchQuery.value ||
          med.name.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesCategory =
          !filterCategory.value || med.category === filterCategory.value;
        const matchesStatus =
          !filterStatus.value || med.status === filterStatus.value;

        return matchesSearch && matchesCategory && matchesStatus;
      });
    });

    async function fetchMedications() {
      const q = query(collection(db, "medications"), orderBy("name"));
      const querySnapshot = await getDocs(q);
      medications.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    function showAddMedication() {
      isEditing.value = false;
      isStockAdjustment.value = false;
      formData.value = { ...INITIAL_FORM };
      showModal.value = true;
    }

    function editMedication(medication) {
      isEditing.value = true;
      isStockAdjustment.value = false;
      formData.value = { ...medication };
      showModal.value = true;
    }

    function adjustStock(medication) {
      isEditing.value = true;
      isStockAdjustment.value = true;
      formData.value = { ...medication };
      showModal.value = true;
    }

    async function deleteMedication(id) {
      if (confirm("Are you sure you want to delete this medication?")) {
        await deleteDoc(doc(db, "medications", id));
        await fetchMedications();
      }
    }

    async function submitForm(data) {
      try {
        const docRef = doc(db, "medications", data.id || Date.now().toString());
        await setDoc(docRef, {
          ...data,
          status: determineStatus(data.currentStock, data.minimumStock),
          updatedAt: new Date().toISOString(),
        });
        await fetchMedications();
        showModal.value = false;
      } catch (error) {
        console.error("Error saving medication:", error);
      }
    }

    function determineStatus(currentStock, minimumStock) {
      if (currentStock <= 0) return "Out of Stock";
      if (currentStock <= minimumStock) return "Low Stock";
      return "In Stock";
    }

    // Initial data fetch
    onMounted(() => {
      fetchMedications();
    });

    return {
      medications,
      searchQuery,
      filterCategory,
      filterStatus,
      showModal,
      isEditing,
      isStockAdjustment,
      formData,
      filteredMedications,
      CATEGORIES,
      TABLE_HEADERS,
      showAddMedication,
      editMedication,
      adjustStock,
      deleteMedication,
      submitForm,
    };
  },
};
</script>

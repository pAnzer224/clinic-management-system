<template>
  <main class="flex-1 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Medication Inventory</h1>
      <button @click="add" class="bg-blue1 text-white px-4 py-2 rounded-full">
        Add Medication
      </button>
    </div>

    <!-- Medications Container -->
    <div class="grid grid-cols-1 gap-4">
      <div class="bg-white rounded-2xl px-8 pt-8 pb-2 shadow-sm">
        <!-- Search and Filter Section -->
        <div class="flex gap-4 mb-6 text-[13px] relative">
          <div class="relative w-80 flex-1">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            />
            <input
              type="search"
              v-model="searchQuery"
              placeholder="Search medications..."
              class="pl-10 px-4 py-2 rounded-full bg-graytint/40 border border-text/20 focus:ring-1 focus:ring-blue1/50 focus:outline-none"
            />
          </div>
          <Dropdown
            v-model="filterCategory"
            :options="categoryFilterOptions"
            class="w-40"
          />
          <Dropdown
            v-model="filterStatus"
            :options="statusFilterOptions"
            class="w-40"
          />
        </div>

        <!-- Loading Spinner -->
        <div v-if="loading" class="flex justify-center items-center py-8">
          <intersecting-circles-spinner
            :animation-duration="1200"
            :size="70"
            color="#3f73ce"
          />
        </div>

        <!-- Medications Table -->
        <div v-else class="relative">
          <div class="sticky top-0 bg-white z-10">
            <table class="w-full table-fixed">
              <thead>
                <tr class="text-left text-text/60">
                  <th class="pb-4 w-1/5">Name</th>
                  <th class="pb-4 w-1/6">Category</th>
                  <th class="pb-4 w-1/6">Dosage Form</th>
                  <th class="pb-4 w-1/8">Current Stock</th>
                  <th class="pb-4 w-1/8">Status</th>
                  <th class="pb-4 w-1/8">Expiration</th>
                  <th class="pb-4 w-1/8">Actions</th>
                </tr>
              </thead>
            </table>
            <div
              class="absolute bottom-0 left-0 right-0 border-t border-graytint"
            ></div>
          </div>

          <div class="relative">
            <div
              class="min-h-[calc(100vh-335px)] max-h-[calc(100vh-335px)] overflow-y-scroll no-scrollbar"
            >
              <table class="w-full table-fixed">
                <tbody>
                  <tr
                    v-for="medication in filteredMedications"
                    :key="medication.id"
                    class="border-t border-graytint/50"
                  >
                    <td class="py-4 w-1/5">
                      <div class="truncate">{{ medication.name }}</div>
                    </td>
                    <td class="w-1/6">
                      <div class="truncate">{{ medication.category }}</div>
                    </td>
                    <td class="w-1/6">
                      <div class="truncate">{{ medication.dosageForm }}</div>
                    </td>
                    <td class="w-1/8">{{ medication.currentStock }}</td>
                    <td class="w-1/8">
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
                    <td class="w-1/8">{{ medication.expirationDate }}</td>
                    <td class="w-1/8 space-x-2">
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
                        @click="deleteMedication(medication)"
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
            <div
              class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Medication Modal -->
    <MedicationsModal
      v-model="showModal"
      :is-editing="isEditing"
      :initial-form-data="formData"
      :is-stock-adjustment="isStockAdjustment"
      @submit="submitForm"
    />

    <!-- Activity Toast -->
    <div
      v-if="showToast"
      class="fixed bottom-4 right-4 bg-blue1 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500"
      :class="{ 'opacity-100': showToast, 'opacity-0': !showToast }"
    >
      {{ toastMessage }}
    </div>
  </main>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";
import MedicationsModal from "@/components/MedicationsModal.vue";
import { useCRUD } from "@/utils/firebaseCRUD";
import {
  serverTimestamp,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import { IntersectingCirclesSpinner } from "epic-spinners";
import Dropdown from "@/components/Dropdown.vue";
import { logActivity } from "@/utils/activity-logger";

const CATEGORIES = [
  "Analgesics",
  "Antibiotics",
  "Antihistamines",
  "Antipyretics",
  "First Aid",
  "Supplements",
  "Others",
];

const STATUS_OPTIONS = ["In Stock", "Low Stock", "Out of Stock"];

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
    MagnifyingGlassIcon,
    IntersectingCirclesSpinner,
    Dropdown,
  },
  setup() {
    const route = useRoute();
    const medications = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const unsubscribe = ref(null);
    const { addItem, updateItem, deleteItem } = useCRUD("medications");

    const searchQuery = ref("");
    const filterCategory = ref("");
    const filterStatus = ref("");
    const showModal = ref(false);
    const isEditing = ref(false);
    const isStockAdjustment = ref(false);
    const formData = ref({ ...INITIAL_FORM });
    const showToast = ref(false);
    const toastMessage = ref("");

    const categoryFilterOptions = computed(() => {
      return [
        { value: "", label: "All Categories" },
        ...CATEGORIES.map((category) => ({ value: category, label: category })),
      ];
    });

    const statusFilterOptions = computed(() => {
      return [
        { value: "", label: "All Statuses" },
        ...STATUS_OPTIONS.map((status) => ({ value: status, label: status })),
      ];
    });

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

    function showNotification(message) {
      toastMessage.value = message;
      showToast.value = true;
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    }

    function listenToChanges() {
      const q = query(collection(db, "medications"), orderBy("name"));
      loading.value = true;

      unsubscribe.value = onSnapshot(
        q,
        (snapshot) => {
          medications.value = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          loading.value = false;
        },
        (err) => {
          console.error("Error listening to medications:", err);
          error.value = err.message;
          loading.value = false;
        }
      );
    }

    function stopListening() {
      if (unsubscribe.value) {
        unsubscribe.value();
      }
    }

    onMounted(() => {
      listenToChanges();
    });

    function add() {
      isEditing.value = false;
      isStockAdjustment.value = false;
      formData.value = { ...INITIAL_FORM, id: Date.now().toString() };
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

    async function deleteMedication(medication) {
      if (confirm("Are you sure you want to delete this medication?")) {
        try {
          await deleteItem(medication.id);
          logActivity({
            type: "medication",
            action: "delete",
            title: "Medication Removed",
            description: `Removed medication ${medication.name}`,
            timestamp: serverTimestamp(),
          });
          showNotification(`Medication ${medication.name} has been deleted`);
        } catch (error) {
          console.error("Error deleting medication:", error);
          showNotification("Error deleting medication");
        }
      }
    }

    function determineStatus(currentStock, minimumStock) {
      if (currentStock <= 0) return "Out of Stock";
      if (currentStock <= minimumStock) return "Low Stock";
      return "In Stock";
    }

    async function submitForm(data) {
      try {
        const submitData = {
          ...data,
          status: determineStatus(data.currentStock, data.minimumStock),
          updatedAt: serverTimestamp(),
        };

        if (!isEditing.value) {
          submitData.createdAt = serverTimestamp();
          await addItem(submitData);
        } else {
          await updateItem(submitData);
        }

        await logActivity({
          type: "medication",
          action: isEditing.value
            ? isStockAdjustment.value
              ? "stock-adjustment"
              : "update"
            : "create",
          title: isEditing.value
            ? isStockAdjustment.value
              ? "Medication Stock Adjusted"
              : "Medication Updated"
            : "New Medication Added",
          description: isEditing.value
            ? isStockAdjustment.value
              ? `Adjusted stock for ${data.name} to ${data.currentStock} units`
              : `Updated medication information for ${data.name}`
            : `Added new medication ${data.name}`,
          timestamp: serverTimestamp(),
        });

        showNotification(
          `Medication ${data.name} has been ${
            isEditing.value
              ? isStockAdjustment.value
                ? "stock adjusted"
                : "updated"
              : "added"
          }`
        );
      } catch (error) {
        console.error("Error saving medication:", error);
        showNotification("Error saving medication information");
      }
    }

    return {
      medications,
      loading,
      error,
      searchQuery,
      filterCategory,
      filterStatus,
      showModal,
      isEditing,
      isStockAdjustment,
      formData,
      filteredMedications,
      categoryFilterOptions,
      statusFilterOptions,
      CATEGORIES,
      showToast,
      toastMessage,
      add,
      editMedication,
      adjustStock,
      deleteMedication,
      submitForm,
      listenToChanges,
      stopListening,
    };
  },
};
</script>

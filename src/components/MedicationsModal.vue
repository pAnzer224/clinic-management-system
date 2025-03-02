<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 bg-text/50 flex justify-center items-center"
    @click="handleBackgroundClick"
  >
    <div
      class="bg-white rounded-2xl p-8 shadow-lg w-[800px] max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-satoshi-bold">
          {{
            isEditing ? (isStockAdjustment ? "Adjust Stock" : "Edit") : "Add"
          }}
          Medication
        </h2>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Basic Information Section -->
        <div v-if="!isStockAdjustment" class="space-y-4">
          <h3 class="font-satoshi-bold text-md">Basic Information</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1">Name</label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />
            </div>
            <div>
              <label class="block mb-1">Category</label>
              <Dropdown
                v-model="formData.category"
                :options="categoryOptions"
                placeholder="Select Category"
              />
            </div>
            <div>
              <label class="block mb-1">Dosage Form</label>
              <input
                v-model="formData.dosageForm"
                type="text"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
                placeholder="e.g., Tablet, Syrup, Capsule"
              />
            </div>
            <div>
              <label class="block mb-1">Strength</label>
              <input
                v-model="formData.strength"
                type="text"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
                placeholder="e.g., 500mg, 250ml"
              />
            </div>
          </div>
        </div>

        <!-- Stock Management Section -->
        <div class="space-y-4">
          <h3 class="font-satoshi-bold text-md">
            {{ isStockAdjustment ? "Stock Adjustment" : "Stock Management" }}
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1">Current Stock</label>
              <input
                v-if="isStockAdjustment"
                v-model="formData.currentStock"
                type="number"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />
              <p v-else class="px-4 py-2 rounded-lg bg-graytint">
                {{ formData.currentStock }}
              </p>
            </div>
            <div>
              <label class="block mb-1">Minimum Stock Level</label>
              <input
                v-model="formData.minimumStock"
                type="number"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />
            </div>
          </div>
        </div>

        <!-- Additional Information Section -->
        <div v-if="!isStockAdjustment" class="space-y-4">
          <h3 class="font-satoshi-bold text-md">Additional Information</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1">Manufacturer</label>
              <input
                v-model="formData.manufacturer"
                type="text"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
              />
            </div>
            <div>
              <label class="block mb-1">Expiration Date</label>
              <input
                v-model="formData.expirationDate"
                type="date"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />
            </div>
            <div>
              <label class="block mb-1">Storage Location</label>
              <input
                v-model="formData.location"
                type="text"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
              />
            </div>
          </div>
          <div>
            <label class="block mb-1">Notes</label>
            <textarea
              v-model="formData.notes"
              class="w-full px-4 py-2 rounded-lg bg-graytint min-h-[100px]"
              placeholder="Additional notes about the medication..."
            ></textarea>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-4">
          <button
            type="button"
            @click="closeModal"
            class="px-6 py-2 bg-gray-300 rounded-full hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-6 py-2 bg-blue1 text-white rounded-full hover:bg-blue-700"
          >
            {{ submitButtonText }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/solid";
import Dropdown from "./Dropdown.vue";

const categories = [
  "Analgesics",
  "Antibiotics",
  "Antihistamines",
  "Antipyretics",
  "First Aid",
  "Supplements",
  "Others",
];

export default {
  name: "MedicationModal",
  components: {
    XMarkIcon,
    Dropdown,
  },
  props: {
    modelValue: Boolean,
    isEditing: Boolean,
    isStockAdjustment: Boolean,
    initialFormData: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue", "submit"],
  setup(props, { emit }) {
    const formData = ref({ ...props.initialFormData });

    const categoryOptions = computed(() => {
      return categories.map((category) => ({
        value: category,
        label: category,
      }));
    });

    const submitButtonText = computed(() => {
      if (props.isStockAdjustment) return "Update Stock";
      return props.isEditing ? "Update Medication" : "Add Medication";
    });

    watch(
      () => props.initialFormData,
      (newVal) => {
        if (newVal) {
          formData.value = { ...newVal };
        }
      },
      { immediate: true, deep: true }
    );

    function closeModal() {
      emit("update:modelValue", false);
    }

    function handleBackgroundClick(event) {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    }

    async function submitForm() {
      emit("submit", { ...formData.value });
      closeModal();
    }

    return {
      formData,
      categories,
      categoryOptions,
      submitButtonText,
      closeModal,
      handleBackgroundClick,
      submitForm,
    };
  },
};
</script>

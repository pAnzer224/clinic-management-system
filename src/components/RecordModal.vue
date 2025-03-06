<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
    @click="handleBackgroundClick"
  >
    <div
      :class="[
        'bg-white rounded-2xl p-8 shadow-lg h-[90vh]',
        isEditing ? 'w-[800px]' : 'w-[650px]',
      ]"
      @click.stop
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-satoshi-bold">
          {{ isEditing ? "Edit" : "New" }} Medical Record
        </h2>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <div class="flex gap-6 h-[calc(90vh-88px)]">
        <!-- Left side: Student Information -->
        <div v-if="isEditing" class="w-60 flex-shrink-0 flex flex-col">
          <div class="bg-graytint/50 rounded-xl p-4 sticky top-0 z-10">
            <h3 class="font-satoshi-bold mb-4">Student Information</h3>
            <div class="space-y-3">
              <div class="bg-white p-3 rounded-lg shadow-sm">
                <div class="flex items-center gap-3 mb-3">
                  <div
                    class="w-12 h-12 rounded-full bg-blue1/10 overflow-hidden"
                    v-if="studentDetails.profileImage"
                  >
                    <img
                      :src="studentDetails.profileImage"
                      class="w-full h-full object-cover"
                      alt="Student Profile"
                    />
                  </div>
                  <div>
                    <p class="font-medium">
                      {{ studentDetails.firstName }}
                      {{ studentDetails.lastName }}
                    </p>
                    <p class="text-sm text-gray-600">
                      {{ studentDetails.studentId }}
                    </p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p class="text-gray-500">Course</p>
                    <p class="font-medium">{{ studentDetails.course }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Year Level</p>
                    <p class="font-medium">{{ studentDetails.yearLevel }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- StudentAccordion component -->
          <div class="mt-4 flex-grow overflow-y-scroll no-scrollbar">
            <StudentAccordion
              :documents="studentDetails.documents || {}"
              :documentLabels="documentLabels"
              :studentId="studentDetails.studentId"
            />
          </div>
        </div>

        <!-- Right side: Record Form -->
        <div class="flex-1 overflow-y-scroll no-scrollbar pr-4">
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Student Selection (only show when adding new record) -->
            <div v-if="!isEditing" class="space-y-4">
              <h3 class="font-satoshi-bold">Student Information</h3>
              <div class="flex items-center">
                <Dropdown
                  v-model="formData.student"
                  :options="studentOptions"
                  placeholder="Select Student"
                  class="flex-1"
                />
                <button
                  type="button"
                  @click="showStudentModal = true"
                  class="bg-blue2 text-white p-2 rounded-full hover:bg-blue1 ml-2"
                >
                  <PlusIcon class="size-3" />
                </button>
              </div>
            </div>

            <!-- Vital Signs -->
            <div class="space-y-4">
              <h3 class="font-satoshi-bold">Vital Signs</h3>
              <div class="grid grid-cols-2 gap-4">
                <input
                  v-model="formData.temperature"
                  placeholder="Temperature (°C)"
                  class="w-full px-4 py-2 rounded-lg bg-graytint"
                  required
                />
                <input
                  v-model="formData.bloodPressure"
                  placeholder="Blood Pressure"
                  class="w-full px-4 py-2 rounded-lg bg-graytint"
                  required
                />
              </div>
            </div>

            <!-- Medical Information -->
            <div class="space-y-4">
              <h3 class="font-satoshi-bold">Medical Information</h3>
              <input
                v-model="formData.chiefComplaint"
                placeholder="Chief Complaint"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />

              <!-- Symptoms -->
              <div class="space-y-2">
                <div class="flex gap-2">
                  <input
                    v-model="newSymptom"
                    @keyup.enter="addSymptom"
                    placeholder="Symptoms"
                    class="flex-1 px-4 py-2 rounded-lg bg-graytint"
                  />
                </div>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="(symptom, index) in formData.symptoms"
                    :key="index"
                    class="bg-blue1/10 px-3 py-1 rounded-lg flex items-center gap-2"
                  >
                    <span>{{ symptom }}</span>
                    <button
                      type="button"
                      @click="removeSymptom(index)"
                      class="text-red-500"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <textarea
                v-model="formData.diagnosis"
                placeholder="Diagnosis"
                class="w-full px-4 py-2 rounded-lg bg-graytint min-h-[100px]"
                required
              ></textarea>

              <textarea
                v-model="formData.treatment"
                placeholder="Treatment Plan"
                class="w-full px-4 py-2 rounded-lg bg-graytint min-h-[100px]"
                required
              ></textarea>

              <!-- Medications -->
              <div class="space-y-2">
                <h4 class="font-medium text-gray-700">Medications</h4>
                <div class="flex gap-2">
                  <Dropdown
                    v-model="newMedication.medicationId"
                    :options="medicationOptions"
                    placeholder="Select Medicine"
                    class="flex-1"
                    @update:modelValue="handleMedicationSelect"
                  />
                  <input
                    v-model="newMedication.dosage"
                    placeholder="Dosage"
                    class="w-32 px-4 py-2 rounded-lg bg-graytint"
                  />
                  <button
                    type="button"
                    @click="addMedication"
                    class="px-4 py-2 bg-blue1 text-white rounded-full"
                    :disabled="
                      !newMedication.medicationId || !newMedication.dosage
                    "
                  >
                    Add
                  </button>
                </div>

                <!-- Display added medications -->
                <div class="space-y-2 mt-2">
                  <div
                    v-for="(med, index) in formData.medications"
                    :key="index"
                    class="flex items-center justify-between bg-blue1/10 px-4 py-2 rounded-lg"
                  >
                    <div>
                      <span class="font-medium">{{ med.name }}</span>
                      <span> - {{ med.dosage }}</span>
                      <span class="text-sm text-gray-600 ml-2"
                        >({{ med.strength }})</span
                      >
                    </div>
                    <button
                      type="button"
                      @click="removeMedication(index)"
                      class="text-red-500"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div class="flex justify-between mt-2">
                  <button
                    type="button"
                    @click="showMedicationsModal = true"
                    class="text-sm text-blue1 hover:underline"
                  >
                    + Add new medication to inventory
                  </button>
                  <!-- Removed the warning message for medications -->
                </div>
              </div>

              <textarea
                v-model="formData.notes"
                placeholder="Additional Notes"
                class="w-full px-4 py-2 rounded-lg bg-graytint min-h-[100px]"
              ></textarea>
            </div>

            <!-- Follow-up Information -->
            <div class="space-y-4">
              <h3 class="font-satoshi-bold">Follow-up Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <input
                  v-model="formData.followUpDate"
                  type="date"
                  class="w-full px-4 py-2 rounded-lg bg-graytint"
                />
                <Dropdown
                  v-model="formData.status"
                  :options="statusOptions"
                  placeholder="Select Status"
                />
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end gap-4">
              <button
                type="button"
                @click="closeModal"
                class="px-6 py-2 bg-gray-300 rounded-full hover:bg-gray-400 mb-8"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-blue1 text-white rounded-full hover:bg-blue-700 mb-8"
              >
                {{ isEditing ? "Update" : "Save" }} Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Medications Modal -->
  <MedicationsModal
    v-model="showMedicationsModal"
    :initial-form-data="medicationFormData"
    @submit="handleMedicationSubmit"
  />

  <!-- Student Modal -->
  <StudentModal
    v-model="showStudentModal"
    :is-editing="false"
    :initial-form-data="studentFormData"
    @submit="handleStudentSubmit"
  />
</template>

<script>
import { useRecordModal } from "@/composables/recordManagement";
import { XMarkIcon, PlusIcon } from "@heroicons/vue/24/solid";
import MedicationsModal from "./MedicationsModal.vue";
import StudentModal from "./StudentModal.vue";
import StudentAccordion from "./StudentAccordion.vue";
import Dropdown from "./Dropdown.vue";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase-config";

export default {
  name: "RecordModal",
  components: {
    XMarkIcon,
    PlusIcon,
    MedicationsModal,
    StudentModal,
    StudentAccordion,
    Dropdown,
  },
  props: {
    modelValue: Boolean,
    isEditing: Boolean,
    initialFormData: {
      type: Object,
      required: true,
    },
    students: {
      type: Array,
      required: true,
    },
    studentRecords: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue", "submit"],
  setup(props, context) {
    const recordModalSetup = useRecordModal(props, context);

    // Modify the addMedication method to preserve form data
    const originalAddMedication = recordModalSetup.addMedication;
    recordModalSetup.addMedication = () => {
      if (
        recordModalSetup.newMedication.value.medicationId &&
        recordModalSetup.newMedication.value.dosage
      ) {
        originalAddMedication();
      }
    };

    const originalSubmitForm = recordModalSetup.submitForm;

    recordModalSetup.submitForm = async () => {
      try {
        // Remove medication validation
        recordModalSetup.noMedicationWarning.value = false;

        // Deduct medication stock
        if (recordModalSetup.formData.value.medications) {
          for (const med of recordModalSetup.formData.value.medications) {
            const medicationRef = doc(db, "medications", med.medicationId);
            const medicationDoc = await getDoc(medicationRef);

            if (medicationDoc.exists()) {
              const currentStock = medicationDoc.data().currentStock;
              const quantity = med.quantity || 1;
              const newStock = Math.max(0, currentStock - quantity);

              await updateDoc(medicationRef, {
                currentStock: newStock,
                status:
                  newStock <= 0
                    ? "Out of Stock"
                    : newStock <= medicationDoc.data().minimumStock
                    ? "Low Stock"
                    : "In Stock",
              });
            }
          }
        }

        // Call original submit function
        await originalSubmitForm();
      } catch (error) {
        console.error("Error in form submission:", error);
      }
    };

    return recordModalSetup;
  },
};
</script>

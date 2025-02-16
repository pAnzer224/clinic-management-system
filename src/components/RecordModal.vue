<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
    @click="handleBackgroundClick"
  >
    <div
      class="bg-white rounded-2xl p-8 shadow-lg w-[750px] max-h-[90vh] overflow-hidden"
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
        <div v-if="isEditing" class="w-60 flex-shrink-0">
          <div class="bg-graytint/50 rounded-xl p-4">
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

          <!-- Documents Section -->
          <div class="mt-4 bg-graytint/50 rounded-xl p-4">
            <h3 class="font-satoshi-bold mb-4">Documents</h3>
            <div class="space-y-2">
              <div
                v-for="doc in documents"
                :key="doc.field"
                class="flex justify-between items-center p-3 bg-white rounded-lg hover:bg-gray-50"
              >
                <span class="text-sm">{{ doc.label }}</span>
                <button
                  v-if="studentDetails.documents?.[doc.field]"
                  @click="viewDocument(doc.field)"
                  class="text-blue1"
                >
                  <EyeIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right side: Record Form -->
        <div class="flex-1 overflow-y-scroll no-scrollbar pr-4">
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Student Selection (only show when adding new record) -->
            <div v-if="!isEditing" class="space-y-4">
              <h3 class="font-satoshi-bold">Student Information</h3>
              <Dropdown
                v-model="formData.student"
                :options="studentOptions"
                placeholder="Select Student"
                required
              />
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
                    placeholder="Type symptoms and press enter"
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
                <div class="flex gap-2">
                  <input
                    v-model="newMedication.name"
                    placeholder="Medicine name"
                    class="flex-1 px-4 py-2 rounded-lg bg-graytint"
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
                  >
                    Add
                  </button>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="(med, index) in formData.medications"
                    :key="index"
                    class="flex items-center justify-between bg-blue1/10 px-4 py-2 rounded-lg"
                  >
                    <span>{{ med.name }} - {{ med.dosage }}</span>
                    <button
                      type="button"
                      @click="removeMedication(index)"
                      class="text-red-500"
                    >
                      ×
                    </button>
                  </div>
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
                  required
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
</template>

<script>
import { ref, watch, computed } from "vue";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase-config";
import { useCRUD } from "@/utils/firebaseCRUD";
import { XMarkIcon, EyeIcon } from "@heroicons/vue/24/solid";
import Dropdown from "@/components/Dropdown.vue";

export default {
  name: "RecordModal",
  components: {
    XMarkIcon,
    EyeIcon,
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
  },
  emits: ["update:modelValue", "submit"],
  setup(props, { emit }) {
    const { addItem, updateItem } = useCRUD("medicalRecords");
    const formData = ref({});
    const newSymptom = ref("");
    const newMedication = ref({ name: "", dosage: "" });
    const studentDetails = ref({});

    const studentOptions = computed(() => {
      return props.students.map((student) => ({
        value: student,
        label: `${student.firstName} ${student.lastName} (${student.studentId})`,
      }));
    });

    const statusOptions = [
      { value: "Active", label: "Active" },
      { value: "Completed", label: "Completed" },
      { value: "Follow-up Required", label: "Follow-up Required" },
    ];

    const documents = [
      { field: "medicalCertificate", label: "Medical Certificate" },
      { field: "urinalysisReport", label: "Urinalysis Report" },
      { field: "radiologicReport", label: "Radiologic Report" },
      { field: "hematologyReport", label: "Hematology Report" },
      { field: "drugTestReport", label: "Drug Test Report" },
      { field: "dentalHealthChart", label: "Dental Health Chart" },
    ];

    watch(
      () => props.initialFormData,
      (newVal) => {
        formData.value = {
          ...newVal,
          symptoms: newVal.symptoms || [],
          medications: newVal.medications || [],
        };
        if (props.isEditing && newVal.studentId) {
          fetchStudentData(newVal.studentId);
        }
      },
      { immediate: true, deep: true }
    );

    async function fetchStudentData(studentId) {
      try {
        const studentsRef = collection(db, "students");
        const studentQuery = query(
          studentsRef,
          where("studentId", "==", studentId)
        );
        const studentSnapshot = await getDocs(studentQuery);
        if (!studentSnapshot.empty) {
          studentDetails.value = studentSnapshot.docs[0].data();
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    }

    watch(
      () => formData.value.student,
      (student) => {
        if (student) {
          formData.value.studentId = student.studentId;
          formData.value.studentName = `${student.firstName} ${student.lastName}`;
          fetchStudentData(student.studentId);
        }
      }
    );

    function addSymptom() {
      if (newSymptom.value.trim()) {
        if (!formData.value.symptoms) formData.value.symptoms = [];
        formData.value.symptoms.push(newSymptom.value.trim());
        newSymptom.value = "";
      }
    }

    function removeSymptom(index) {
      formData.value.symptoms.splice(index, 1);
    }

    function addMedication() {
      if (newMedication.value.name && newMedication.value.dosage) {
        if (!formData.value.medications) formData.value.medications = [];
        formData.value.medications.push({ ...newMedication.value });
        newMedication.value = { name: "", dosage: "" };
      }
    }

    function removeMedication(index) {
      formData.value.medications.splice(index, 1);
    }

    function viewDocument(field) {
      if (studentDetails.value.documents?.[field]) {
        const newWindow = window.open();
        newWindow.document.write(`
          <iframe src="${studentDetails.value.documents[field]}" style="width:100%;height:100vh;border:none;"></iframe>
        `);
      }
    }

    function closeModal() {
      formData.value = {};
      studentDetails.value = {};
      emit("update:modelValue", false);
    }

    function handleBackgroundClick(event) {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    }

    async function submitForm() {
      if (!formData.value.date) {
        formData.value.date = new Date().toISOString().split("T")[0];
      }

      if (!formData.value.id) {
        formData.value.id = `record_${Date.now()}`;
      }

      try {
        if (props.isEditing) {
          await updateItem(formData.value);
        } else {
          await addItem(formData.value);
        }
        emit("submit", formData.value);
        closeModal();
      } catch (error) {
        console.error("Error submitting record:", error);
      }
    }

    return {
      formData,
      studentDetails,
      documents,
      newSymptom,
      newMedication,
      studentOptions,
      statusOptions,
      addSymptom,
      removeSymptom,
      addMedication,
      removeMedication,
      viewDocument,
      closeModal,
      handleBackgroundClick,
      submitForm,
    };
  },
};
</script>

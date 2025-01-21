<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    @click="handleBackgroundClick"
  >
    <div
      class="bg-white rounded-2xl p-8 shadow-lg w-[800px] max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-satoshi-bold">
          {{ isEditing ? "Edit" : "New" }} Medical Record
        </h2>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
          <svg
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="flex gap-6">
        <!-- Left side: Student Information -->
        <div v-if="isEditing" class="w-96">
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
        </div>

        <!-- Right side: Record Form -->
        <div class="flex-1">
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Student Selection (only show when adding new record) -->
            <div v-if="!isEditing" class="space-y-4">
              <h3 class="font-satoshi-bold text-md mb-3">
                Student Information
              </h3>
              <div>
                <label class="block mb-1">Student</label>
                <select
                  v-model="formData.student"
                  class="px-4 py-2 rounded-lg bg-graytint w-full"
                  required
                >
                  <option value="">Select Student</option>
                  <option
                    v-for="student in students"
                    :key="student.studentId"
                    :value="student"
                  >
                    {{ student.firstName }} {{ student.lastName }} ({{
                      student.studentId
                    }})
                  </option>
                </select>
              </div>
            </div>

            <!-- Other Form Sections -->
            <div
              v-for="section in formSections"
              :key="section.title"
              class="space-y-4"
            >
              <h3 class="font-satoshi-bold text-md mb-3">
                {{ section.title }}
              </h3>
              <div :class="section.grid">
                <div
                  v-for="field in section.fields"
                  :key="field.name"
                  :class="field.class || ''"
                >
                  <label class="block mb-1">{{ field.label }}</label>
                  <template v-if="field.type === 'select'">
                    <select
                      v-model="formData[field.name]"
                      class="px-4 py-2 rounded-lg bg-graytint w-full"
                      required
                    >
                      <option
                        v-for="opt in field.options"
                        :key="opt"
                        :value="opt"
                      >
                        {{ opt }}
                      </option>
                    </select>
                  </template>
                  <template v-else-if="field.type === 'textarea'">
                    <textarea
                      v-model="formData[field.name]"
                      class="w-full px-4 py-2 rounded-xl bg-graytint min-h-[100px]"
                      required
                    ></textarea>
                  </template>
                  <template v-else-if="field.type === 'symptoms'">
                    <div class="flex gap-2 flex-wrap">
                      <input
                        v-model="newSymptom"
                        @keyup.enter="addSymptom"
                        type="text"
                        class="flex-1 px-4 py-2 rounded-lg bg-graytint"
                        placeholder="Type and press enter to add"
                      />
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
                  </template>
                  <template v-else-if="field.type === 'medications'">
                    <div class="space-y-2">
                      <div class="flex gap-2">
                        <input
                          v-model="newMedication.name"
                          type="text"
                          placeholder="Medicine name"
                          class="flex-1 px-4 py-2 rounded-lg bg-graytint"
                        />
                        <input
                          v-model="newMedication.dosage"
                          type="text"
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
                  </template>
                  <template v-else>
                    <input
                      v-model="formData[field.name]"
                      :type="field.type"
                      class="w-full px-4 py-2 rounded-full bg-graytint"
                      required
                    />
                  </template>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end gap-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue1 text-white rounded-full hover:bg-blue-700"
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
import { ref, computed, watch } from "vue";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase-config";

const FORM_SECTIONS = [
  {
    title: "Vital Signs",
    grid: "grid grid-cols-2 gap-4",
    fields: [
      { name: "temperature", label: "Temperature (°C)", type: "text" },
      { name: "bloodPressure", label: "Blood Pressure", type: "text" },
    ],
  },
  {
    title: "Medical Information",
    grid: "space-y-4",
    fields: [
      { name: "chiefComplaint", label: "Chief Complaint", type: "text" },
      { name: "symptoms", label: "Symptoms", type: "symptoms" },
      { name: "diagnosis", label: "Diagnosis", type: "textarea" },
      { name: "treatment", label: "Treatment Plan", type: "textarea" },
      { name: "medications", label: "Medications", type: "medications" },
      { name: "notes", label: "Additional Notes", type: "textarea" },
    ],
  },
  {
    title: "Follow-up Information",
    grid: "grid grid-cols-2 gap-4",
    fields: [
      { name: "followUpDate", label: "Follow-up Date", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["Active", "Completed", "Follow-up Required"],
      },
    ],
  },
];

export default {
  name: "RecordModal",
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
    const formData = ref({});
    const newSymptom = ref("");
    const newMedication = ref({ name: "", dosage: "" });
    const studentDetails = ref({});

    const formSections = computed(() => FORM_SECTIONS);

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
        console.error("Error fetching data:", error);
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

    function submitForm() {
      if (!formData.value.date) {
        formData.value.date = new Date().toISOString().split("T")[0];
      }
      emit("submit", formData.value);
      closeModal();
    }

    return {
      formData,
      studentDetails,
      formSections,
      newSymptom,
      newMedication,
      addSymptom,
      removeSymptom,
      addMedication,
      removeMedication,
      closeModal,
      handleBackgroundClick,
      submitForm,
    };
  },
};
</script>

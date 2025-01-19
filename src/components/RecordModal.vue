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
      <h2 class="text-xl font-satoshi-bold mb-6">
        {{ isEditing ? "Edit" : "New" }} Medical Record
      </h2>

      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Form Sections -->
        <div
          v-for="section in FORM_SECTIONS"
          :key="section.title"
          class="space-y-4"
        >
          <h3 class="font-satoshi-bold text-md mb-3">{{ section.title }}</h3>
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
                  class="px-4 py-2 rounded-lg bg-graytint"
                  required
                >
                  <option v-if="field.name === 'student'" value="">
                    Select Student
                  </option>
                  <option
                    v-for="opt in getOptions(field)"
                    :key="opt.value || opt"
                    :value="opt.value || opt"
                  >
                    {{ opt.label || opt }}
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
</template>

<script>
import { ref, watch } from "vue";

const FORM_SECTIONS = [
  {
    title: "Student Information",
    grid: "space-y-4",
    fields: [
      {
        name: "student",
        label: "Student",
        type: "select",
        showOnEdit: false,
      },
    ],
  },
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
    const formData = ref({ ...props.initialFormData });
    const newSymptom = ref("");
    const newMedication = ref({ name: "", dosage: "" });

    function getOptions(field) {
      if (field.name === "student") {
        return props.students.map((student) => ({
          value: student,
          label: `${student.firstName} ${student.lastName} (${student.studentId})`,
        }));
      }
      return field.options || [];
    }

    // Watch for student selection changes
    watch(
      () => formData.value.student,
      (student) => {
        if (student) {
          formData.value.studentId = student.studentId;
          formData.value.studentName = `${student.firstName} ${student.lastName}`;
        }
      }
    );

    // Symptoms management
    function addSymptom() {
      if (newSymptom.value.trim()) {
        formData.value.symptoms.push(newSymptom.value.trim());
        newSymptom.value = "";
      }
    }

    function removeSymptom(index) {
      formData.value.symptoms.splice(index, 1);
    }

    // Medications management
    function addMedication() {
      if (newMedication.value.name && newMedication.value.dosage) {
        formData.value.medications.push({ ...newMedication.value });
        newMedication.value = { name: "", dosage: "" };
      }
    }

    function removeMedication(index) {
      formData.value.medications.splice(index, 1);
    }

    function closeModal() {
      emit("update:modelValue", false);
    }

    function handleBackgroundClick(event) {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    }

    function submitForm() {
      emit("submit", formData.value);
      closeModal();
    }

    return {
      formData,
      FORM_SECTIONS,
      newSymptom,
      newMedication,
      getOptions,
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

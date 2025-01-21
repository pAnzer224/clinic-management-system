<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 flex justify-center items-center bg-black/50"
    @click="handleBackgroundClick"
  >
    <div
      class="bg-white rounded-2xl p-8 shadow-lg w-[70vw] max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-satoshi-bold">
          {{ isEditing ? "Edit" : "Add" }} Student
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
        <!-- Left side: Student Form -->
        <div class="flex-1">
          <form @submit.prevent="submitForm">
            <!-- Profile Image Section -->
            <div class="flex justify-center mb-4">
              <div class="relative">
                <div class="w-24 h-24 rounded-full bg-blue1/10 overflow-hidden">
                  <img
                    v-if="imagePreview"
                    :src="imagePreview"
                    class="w-full h-full object-cover"
                    alt="Profile Preview"
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  @change="handleImageChange"
                  class="hidden"
                  ref="fileInput"
                />
                <button
                  type="button"
                  @click="$refs.fileInput.click()"
                  class="absolute bottom-0 right-0 bg-blue1 text-white p-2 rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Form Sections -->
            <div
              v-for="section in FORM_SECTIONS"
              :key="section.title"
              class="space-y-4 mb-6"
            >
              <h3 class="font-satoshi-bold text-md">{{ section.title }}</h3>
              <div :class="section.grid">
                <div
                  v-for="field in section.fields"
                  :key="field.name"
                  :class="field.class || ''"
                >
                  <label class="block mb-1 text-sm">{{ field.label }}</label>
                  <template v-if="field.type === 'select'">
                    <select
                      v-model="formData[field.name]"
                      class="w-full px-4 py-2 rounded-lg bg-graytint"
                      required
                    >
                      <option v-for="opt in field.options" :key="opt">
                        {{ opt }}
                      </option>
                    </select>
                  </template>
                  <template v-else-if="field.name === 'labTest'">
                    <div class="relative">
                      <input
                        :id="field.name"
                        @change="handleFileChange"
                        type="file"
                        :accept="field.accept"
                        class="hidden"
                        ref="labTestInput"
                      />
                      <div class="flex gap-2">
                        <label
                          :for="field.name"
                          class="flex items-center gap-2 flex-1 px-4 py-2 rounded-md bg-graytint cursor-pointer hover:bg-gray-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                          </svg>
                          <span class="text-sm">{{
                            formData.labTest ? "Change file" : "Choose file"
                          }}</span>
                        </label>
                        <button
                          v-if="formData.labTest"
                          type="button"
                          @click="viewFile"
                          class="px-4 py-2 bg-blue1 text-white rounded-full text-sm"
                        >
                          View File
                        </button>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <input
                      v-model="formData[field.name]"
                      :type="field.type"
                      class="w-full px-4 py-2 rounded-lg bg-graytint"
                      required
                    />
                  </template>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end gap-4 mt-6">
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
                {{ isEditing ? "Update" : "Add" }}
              </button>
            </div>
          </form>
        </div>

        <!-- Right side: Related Records -->
        <div v-if="isEditing" class="w-96 space-y-6">
          <!-- Appointments Section -->
          <div class="bg-graytint/40 rounded-xl p-4">
            <h3 class="font-satoshi-bold mb-4">Appointments</h3>
            <div class="space-y-3">
              <div
                v-for="appointment in studentAppointments"
                :key="appointment.id"
                class="bg-white p-3 rounded-lg shadow-sm"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium">{{ appointment.date }}</p>
                    <p class="text-sm text-gray-600">{{ appointment.time }}</p>
                  </div>
                  <span
                    :class="{
                      'bg-green-100 text-green-800':
                        appointment.status === 'completed',
                      'bg-blue-100 text-blue-800':
                        appointment.status === 'upcoming',
                      'bg-yellow-100 text-yellow-800':
                        appointment.status === 'pending',
                    }"
                    class="text-xs px-2 py-1 rounded-full"
                  >
                    {{ appointment.status }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mt-2">
                  {{ appointment.reason }}
                </p>
              </div>
              <p
                v-if="!studentAppointments.length"
                class="text-center text-gray-500 py-2"
              >
                No appointments found
              </p>
            </div>
          </div>

          <!-- Medical Records Section -->
          <div class="bg-graytint/40 rounded-xl p-4">
            <h3 class="font-satoshi-bold mb-4">Medical Records</h3>
            <div class="space-y-3">
              <div
                v-for="record in medicalRecords"
                :key="record.id"
                class="bg-white p-3 rounded-lg shadow-sm"
              >
                <div class="flex justify-between items-start">
                  <p class="font-medium">{{ record.date }}</p>
                  <span
                    :class="{
                      'bg-green-100 text-green-800':
                        record.status === 'Completed',
                      'bg-blue-100 text-blue-800': record.status === 'Active',
                      'bg-yellow-100 text-yellow-800':
                        record.status === 'Follow-up Required',
                    }"
                    class="text-xs px-2 py-1 rounded-full"
                  >
                    {{ record.status }}
                  </span>
                </div>
                <p class="text-sm font-medium mt-2">
                  {{ record.chiefComplaint }}
                </p>
                <div class="mt-2">
                  <p class="text-sm text-gray-600">{{ record.diagnosis }}</p>
                </div>
                <div v-if="record.medications.length" class="mt-2">
                  <p class="text-xs text-gray-500">Medications:</p>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <span
                      v-for="med in record.medications"
                      :key="med.name"
                      class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {{ med.name }} - {{ med.dosage }}
                    </span>
                  </div>
                </div>
              </div>
              <p
                v-if="!medicalRecords.length"
                class="text-center text-gray-500 py-2"
              >
                No medical records found
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from "vue";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase-config";
import { handleImageUpload } from "@/utils/image-utils";

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const COURSE_OPTIONS = ["BSCRIM", "BSED", "BSIT", "BSAB", "HM"];

const FORM_SECTIONS = [
  {
    title: "Personal Information",
    grid: "grid grid-cols-3 gap-4",
    fields: [
      { name: "studentId", label: "Student ID", type: "text" },
      { name: "lastName", label: "Last Name", type: "text" },
      { name: "firstName", label: "First Name", type: "text" },
      { name: "middleInitial", label: "Middle Initial", type: "text" },
      { name: "age", label: "Age", type: "text" },
      {
        name: "sex",
        label: "Sex",
        type: "select",
        options: ["Male", "Female"],
      },
      { name: "nationality", label: "Nationality", type: "text" },
      { name: "address", label: "Address", type: "text", class: "col-span-2" },
      { name: "religion", label: "Religion", type: "text" },
    ],
  },
  {
    title: "Academic Information",
    grid: "grid grid-cols-2 gap-4",
    fields: [
      {
        name: "course",
        label: "Course",
        type: "select",
        options: COURSE_OPTIONS,
      },
      {
        name: "yearLevel",
        label: "Year Level",
        type: "select",
        options: YEAR_OPTIONS,
      },
    ],
  },
  {
    title: "Emergency Contact",
    grid: "grid grid-cols-2 gap-4",
    fields: [
      { name: "guardianName", label: "Parent/Guardian Name", type: "text" },
      { name: "guardianOccupation", label: "Occupation", type: "text" },
      { name: "guardianAddress", label: "Address", type: "text" },
      { name: "guardianContact", label: "Contact Number", type: "tel" },
    ],
  },
  {
    title: "Documents",
    grid: "grid grid-cols-2 gap-4",
    fields: [
      {
        name: "labTest",
        label: "Lab Test Results",
        type: "file",
        accept: ".pdf,.doc,.docx",
      },
    ],
  },
];

export default {
  name: "StudentModal",
  props: {
    modelValue: Boolean,
    isEditing: Boolean,
    initialFormData: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue", "submit"],
  setup(props, { emit }) {
    const formData = ref({});
    const imagePreview = ref(null);
    const studentAppointments = ref([]);
    const medicalRecords = ref([]);

    watch(
      () => props.initialFormData,
      (newVal) => {
        formData.value = { ...newVal };
        imagePreview.value = newVal.profileImage || null;
        if (props.isEditing && newVal.studentId) {
          fetchStudentData(newVal.studentId);
        }
      },
      { immediate: true, deep: true }
    );

    async function fetchStudentData(studentId) {
      // Fetch appointments
      const appointmentsQuery = query(
        collection(db, "appointments"),
        where("studentId", "==", studentId)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      studentAppointments.value = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        status: getAppointmentStatus(doc.data().date),
      }));

      // Fetch medical records
      const recordsQuery = query(
        collection(db, "medicalRecords"),
        where("studentId", "==", studentId)
      );
      const recordsSnapshot = await getDocs(recordsQuery);
      medicalRecords.value = recordsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    function getAppointmentStatus(date) {
      const appointmentDate = new Date(date);
      const today = new Date();

      if (appointmentDate < today) return "completed";
      if (appointmentDate.toDateString() === today.toDateString())
        return "pending";
      return "upcoming";
    }

    async function handleImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        const base64 = await handleImageUpload(file);
        imagePreview.value = base64;
        formData.value.profileImage = base64;
      }
    }

    async function handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          formData.value.labTest = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }

    function viewFile() {
      if (formData.value.labTest) {
        const newWindow = window.open();
        newWindow.document.write(`
      <iframe 
        src="${formData.value.labTest}" 
        style="width:100%;height:100vh;border:none;"
      ></iframe>
    `);
      }
    }

    function closeModal() {
      studentAppointments.value = [];
      medicalRecords.value = [];
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
      imagePreview,
      studentAppointments,
      medicalRecords,
      FORM_SECTIONS,
      handleImageChange,
      handleFileChange,
      viewFile,
      closeModal,
      handleBackgroundClick,
      submitForm,
    };
  },
};
</script>

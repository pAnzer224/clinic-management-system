<template>
  <main class="flex-1 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Student Management</h1>
      <button @click="add" class="bg-blue1 text-white px-4 py-2 rounded-full">
        Add Student
      </button>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 gap-4">
      <div class="bg-white rounded-2xl p-8 shadow-sm">
        <div class="flex gap-4 mb-6">
          <input
            type="search"
            v-model="searchQuery"
            placeholder="Search students..."
            class="px-4 py-2 rounded-full bg-graytint"
          />
          <select
            v-model="filterYear"
            class="px-4 py-2 rounded-full bg-graytint"
          >
            <option value="">All Years</option>
            <option v-for="year in YEAR_OPTIONS" :key="year">{{ year }}</option>
          </select>
        </div>

        <!-- Student Table -->
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
              v-for="student in filteredStudents"
              :key="student.id"
              class="border-t border-graytint"
            >
              <td class="py-4">{{ student.studentId }}</td>
              <td>
                {{ student.lastName }}, {{ student.firstName }}
                {{ student.middleInitial }}
              </td>
              <td>{{ student.course }}</td>
              <td>{{ student.yearLevel }}</td>
              <td class="space-x-2">
                <button
                  v-for="(action, key) in ACTIONS"
                  :key="key"
                  @click="action.handler(student)"
                  :class="action.class"
                >
                  {{ action.text }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div
        class="bg-white rounded-2xl p-8 shadow-lg w-[800px] max-h-[90vh] overflow-y-auto"
      >
        <h2 class="text-xl font-satoshi-bold mb-4">
          {{ isEditing ? "Edit" : "Add" }} Student
        </h2>
        <form @submit.prevent="submitForm">
          <div class="space-y-12">
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
              class="space-y-4"
            >
              <h3 class="font-satoshi-bold text-md">{{ section.title }}</h3>
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
                      class="w-full px-3 py-2 border rounded"
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
                      <label
                        :for="field.name"
                        class="flex items-center gap-2 w-full px-3 py-2 border rounded text-gray-700 bg-white cursor-pointer hover:bg-gray-50"
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
                        <span class="text-md">{{
                          formData.labTest ? "Change file" : "Choose file"
                        }}</span>
                        <span
                          v-if="formData.labTest"
                          class="text-sm text-blue1 ml-2"
                        >
                          (File selected)
                        </span>
                      </label>
                    </div>
                  </template>
                  <template v-else>
                    <input
                      v-model="formData[field.name]"
                      :type="field.type"
                      class="w-full px-3 py-2 border rounded"
                      required
                    />
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-4 mt-6">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-blue1 text-white rounded">
              {{ isEditing ? "Update" : "Add" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, computed } from "vue";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import { handleImageUpload } from "@/utils/image-utils";

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const COURSE_OPTIONS = ["BSCRIM", "BSED", "BSIT", "BSAB", "HM"];
const TABLE_HEADERS = ["Student ID", "Name", "Course", "Year Level", "Actions"];

const INITIAL_FORM = {
  studentId: "",
  lastName: "",
  firstName: "",
  middleInitial: "",
  age: "",
  sex: "",
  nationality: "",
  address: "",
  religion: "",
  course: "",
  yearLevel: "1st Year",
  guardianName: "",
  guardianOccupation: "",
  guardianAddress: "",
  guardianContact: "",
  profileImage: "",
  labTest: "",
};

export default {
  name: "Students",
  setup() {
    const students = ref([]);
    const searchQuery = ref("");
    const filterYear = ref("");
    const showModal = ref(false);
    const isEditing = ref(false);
    const formData = ref({ ...INITIAL_FORM });
    const imagePreview = ref(null);

    const ACTIONS = {
      view: { text: "View", class: "text-blue1", handler: viewStudent },
      edit: { text: "Edit", class: "text-green-600", handler: editStudent },
      delete: { text: "Delete", class: "text-red-600", handler: deleteStudent },
    };

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
          {
            name: "address",
            label: "Address",
            type: "text",
            class: "col-span-2",
          },
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

    const filteredStudents = computed(() => {
      return students.value.filter((student) => {
        const matchesYear =
          !filterYear.value || student.yearLevel === filterYear.value;
        const searchLower = searchQuery.value.toLowerCase();
        return (
          matchesYear &&
          (!searchQuery.value ||
            student.lastName.toLowerCase().includes(searchLower) ||
            student.firstName.toLowerCase().includes(searchLower))
        );
      });
    });

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

    async function fetchStudents() {
      const querySnapshot = await getDocs(collection(db, "students"));
      students.value = querySnapshot.docs.map((doc) => ({ ...doc.data() }));
    }

    function add() {
      isEditing.value = false;
      formData.value = { ...INITIAL_FORM };
      imagePreview.value = null;
      showModal.value = true;
    }

    async function viewStudent(student) {
      const docSnap = await getDoc(doc(db, "students", student.studentId));
      if (docSnap.exists()) {
        formData.value = docSnap.data();
        imagePreview.value = docSnap.data().profileImage;
        isEditing.value = true;
        showModal.value = true;
      }
    }

    function editStudent(student) {
      isEditing.value = true;
      formData.value = { ...student };
      imagePreview.value = student.profileImage;
      showModal.value = true;
    }

    async function deleteStudent(student) {
      if (confirm("Are you sure you want to delete this student?")) {
        await deleteDoc(doc(db, "students", student.studentId));
        await fetchStudents();
      }
    }

    async function submitForm() {
      try {
        await setDoc(
          doc(db, "students", formData.value.studentId),
          formData.value
        );
        await fetchStudents();
        showModal.value = false;
      } catch (error) {
        console.error("Error saving student:", error);
      }
    }

    fetchStudents();

    return {
      students,
      searchQuery,
      filterYear,
      showModal,
      isEditing,
      formData,
      imagePreview,
      filteredStudents,
      YEAR_OPTIONS,
      TABLE_HEADERS,
      ACTIONS,
      FORM_SECTIONS,
      add,
      submitForm,
      handleImageChange,
      handleFileChange,
    };
  },
};
</script>

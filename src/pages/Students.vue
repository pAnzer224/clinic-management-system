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
        <div class="flex gap-4 mb-6 text-[13px]">
          <input
            type="search"
            v-model="searchQuery"
            placeholder="Search students..."
            class="px-4 py-2 rounded-full bg-graytint/40 border border-text/20"
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
                <button @click="viewStudent(student)" class="text-blue1">
                  <EyeIcon class="h-5 w-5 inline" />
                </button>
                <button @click="editStudent(student)" class="text-green-600">
                  <PencilIcon class="h-5 w-5 inline" />
                </button>
                <button @click="deleteStudent(student)" class="text-red-600">
                  <TrashIcon class="h-5 w-5 inline" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Student Modal -->
    <StudentModal
      v-model="showModal"
      :is-editing="isEditing"
      :initial-form-data="formData"
      @submit="submitForm"
    />
  </main>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";
import StudentModal from "@/components/StudentModal.vue";

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
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
  components: {
    StudentModal,
    EyeIcon,
    PencilIcon,
    TrashIcon,
  },
  setup() {
    const route = useRoute();
    const students = ref([]);
    const searchQuery = ref("");
    const filterYear = ref("");
    const showModal = ref(false);
    const isEditing = ref(false);
    const formData = ref({ ...INITIAL_FORM });

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

    onMounted(() => {
      if (route.query.openModal === "true") {
        add();
      }
    });

    async function fetchStudents() {
      const querySnapshot = await getDocs(collection(db, "students"));
      students.value = querySnapshot.docs.map((doc) => ({ ...doc.data() }));
    }

    function add() {
      isEditing.value = false;
      formData.value = { ...INITIAL_FORM };
      showModal.value = true;
    }

    async function viewStudent(student) {
      const docSnap = await getDoc(doc(db, "students", student.studentId));
      if (docSnap.exists()) {
        formData.value = docSnap.data();
        isEditing.value = true;
        showModal.value = true;
      }
    }

    function editStudent(student) {
      isEditing.value = true;
      formData.value = { ...student };
      showModal.value = true;
    }

    async function deleteStudent(student) {
      if (confirm("Are you sure you want to delete this student?")) {
        await deleteDoc(doc(db, "students", student.studentId));
        await fetchStudents();
      }
    }

    async function submitForm(data) {
      try {
        await setDoc(doc(db, "students", data.studentId), data);
        await fetchStudents();
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
      filteredStudents,
      YEAR_OPTIONS,
      TABLE_HEADERS,
      add,
      viewStudent,
      editStudent,
      deleteStudent,
      submitForm,
    };
  },
};
</script>

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
      <div class="bg-white rounded-2xl px-8 pt-8 pb-2 shadow-sm">
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

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-8">
          <intersecting-circles-spinner
            :animation-duration="1200"
            :size="70"
            color="#3f73ce"
          />
        </div>

        <!-- Table Container with Fixed Header -->
        <div v-else class="relative">
          <!-- Fixed Header -->
          <div class="sticky top-0 bg-white z-10">
            <table class="w-full table-fixed">
              <thead>
                <tr class="text-left text-text/60">
                  <th class="pb-4 w-1/5">Student ID</th>
                  <th class="pb-4 w-2/5">Name</th>
                  <th class="pb-4 w-1/5">Course</th>
                  <th class="pb-4 w-1/12">Year</th>
                  <th class="pb-4 w-1/12">Actions</th>
                </tr>
              </thead>
            </table>
            <!-- Sticky border -->
            <div
              class="absolute bottom-0 left-0 right-0 border-t border-graytint"
            ></div>
          </div>

          <!-- Table wrapper with relative positioning for gradient -->
          <div class="relative">
            <!-- Scrollable Body -->
            <div
              class="min-h-[calc(100vh-335px)] max-h-[calc(100vh-335px)] overflow-y-scroll no-scrollbar"
            >
              <table class="w-full table-fixed">
                <tbody>
                  <tr
                    v-for="student in filteredStudents"
                    :key="student.studentId"
                    class="border-t border-graytint/50"
                  >
                    <td class="py-4 w-1/5">
                      <div class="flex items-center gap-4">
                        <div
                          class="w-10 h-10 rounded-full bg-blue1/10 overflow-hidden flex-shrink-0"
                        >
                          <img
                            v-if="student.profileImage"
                            :src="student.profileImage"
                            class="w-full h-full object-cover"
                            alt="Profile"
                          />
                        </div>
                        <span class="truncate">{{ student.studentId }}</span>
                      </div>
                    </td>
                    <td class="w-2/5">
                      <div class="truncate">
                        {{ student.lastName }}, {{ student.firstName }}
                        {{ student.middleInitial }}
                      </div>
                    </td>
                    <td class="w-1/5">
                      <div class="truncate">{{ student.course }}</div>
                    </td>
                    <td class="w-1/12">{{ student.yearLevel }}</td>
                    <td class="w-1/12 space-x-2">
                      <button
                        @click="editStudent(student)"
                        class="text-blue2/90 hover:text-blue1"
                      >
                        <EyeIcon class="size-5 inline" />
                      </button>
                      <button
                        @click="deleteStudent(student.studentId)"
                        class="text-red-400 hover:text-red-600"
                      >
                        <TrashIcon class="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Gradient overlay -->
            <div
              class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"
            ></div>
          </div>
        </div>
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
import { EyeIcon, TrashIcon } from "@heroicons/vue/24/outline";
import StudentModal from "@/components/StudentModal.vue";
import { useCRUD } from "@/utils/firebaseCRUD";
import { serverTimestamp } from "firebase/firestore";
import { IntersectingCirclesSpinner } from "epic-spinners";

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
    TrashIcon,
    IntersectingCirclesSpinner,
  },
  setup() {
    const route = useRoute();
    const {
      items: students,
      loading,
      error,
      fetchItems: fetchStudents,
      addItem,
      updateItem,
      deleteItem,
      getItem,
    } = useCRUD("students");

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
      fetchStudents();
    });

    function add() {
      isEditing.value = false;
      formData.value = { ...INITIAL_FORM };
      showModal.value = true;
    }

    function editStudent(student) {
      isEditing.value = true;
      formData.value = { ...student };
      showModal.value = true;
    }

    async function deleteStudent(studentId) {
      try {
        await deleteItem(studentId);
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }

    async function submitForm(data) {
      try {
        const submitData = {
          ...data,
          id: data.studentId,
          updatedAt: serverTimestamp(),
        };

        if (!isEditing.value) {
          submitData.createdAt = serverTimestamp();
        }

        if (isEditing.value) {
          await updateItem(submitData);
        } else {
          await addItem(submitData);
        }
        showModal.value = false;
      } catch (error) {
        console.error("Error saving student:", error);
      }
    }

    return {
      students,
      loading,
      error,
      searchQuery,
      filterYear,
      showModal,
      isEditing,
      formData,
      filteredStudents,
      YEAR_OPTIONS,
      TABLE_HEADERS,
      add,
      editStudent,
      deleteStudent,
      submitForm,
    };
  },
};
</script>

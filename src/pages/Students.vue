<template>
  <main class="flex-1 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Student Management</h1>
      <button
        @click="add"
        class="bg-blue1 hover:bg-blue1/80 text-white px-4 py-2 rounded-full text-[15px]"
      >
        Add Student
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div class="bg-white rounded-2xl px-8 pt-8 pb-2 shadow-sm">
        <div class="flex gap-4 mb-6 text-[13px] relative">
          <div class="relative w-80 flex-1">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            />
            <input
              type="search"
              v-model="searchQuery"
              placeholder="Search by student name or ID..."
              class="pl-10 px-4 py-2 rounded-full bg-graytint/40 border border-text/20 focus:ring-1 focus:ring-blue1/50 focus:outline-none"
            />
          </div>
          <Dropdown
            v-model="filterYear"
            :options="yearFilterOptions"
            class="w-40"
          />
        </div>

        <div v-if="loading" class="flex justify-center items-center py-8">
          <intersecting-circles-spinner
            :animation-duration="1200"
            :size="70"
            color="#3f73ce"
          />
        </div>

        <div v-else class="relative">
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
                        <EyeIcon class="h-5 w-5 inline" />
                      </button>
                      <button
                        @click="deleteStudent(student)"
                        class="text-red-400 hover:text-red-600"
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

    <StudentModal
      v-model="showModal"
      :is-editing="isEditing"
      :initial-form-data="formData"
      :appointments="appointments"
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
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";
import StudentModal from "@/components/StudentModal.vue";
import { useCRUD } from "@/utils/firebaseCRUD";
import {
  serverTimestamp,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { IntersectingCirclesSpinner } from "epic-spinners";
import Dropdown from "@/components/Dropdown.vue";
import { logActivity } from "@/utils/activity-logger";
import { db } from "@/firebase-config";

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
  documents: {},
};

export default {
  name: "Students",
  components: {
    StudentModal,
    EyeIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    IntersectingCirclesSpinner,
    Dropdown,
  },
  setup() {
    const route = useRoute();
    const {
      items: students,
      loading,
      error,
      listenToChanges,
      stopListening,
      addItem,
      updateItem,
      deleteItem,
    } = useCRUD("students");

    const searchQuery = ref("");
    const filterYear = ref("");
    const showModal = ref(false);
    const isEditing = ref(false);
    const formData = ref({ ...INITIAL_FORM });
    const showToast = ref(false);
    const toastMessage = ref("");
    const currentUser = ref(
      JSON.parse(localStorage.getItem("currentUser")) || {}
    );
    const appointments = ref([]);
    let unsubscribeAppointments = null;

    function listenToAppointments() {
      const appointmentsQuery = query(
        collection(db, "appointments"),
        orderBy("date"),
        orderBy("time")
      );

      unsubscribeAppointments = onSnapshot(
        appointmentsQuery,
        (snapshot) => {
          appointments.value = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        },
        (error) => {
          console.error("Error fetching appointments:", error);
        }
      );
    }

    const yearFilterOptions = computed(() => {
      return [
        { value: "", label: "All Years" },
        ...YEAR_OPTIONS.map((year) => ({ value: year, label: year })),
      ];
    });

    const filteredStudents = computed(() => {
      return students.value.filter((student) => {
        const matchesYear =
          !filterYear.value || student.yearLevel === filterYear.value;
        const searchLower = searchQuery.value.toLowerCase();
        return (
          matchesYear &&
          (!searchQuery.value ||
            student.lastName?.toLowerCase().includes(searchLower) ||
            student.firstName?.toLowerCase().includes(searchLower) ||
            student.studentId?.toLowerCase().includes(searchLower))
        );
      });
    });

    function showNotification(message) {
      toastMessage.value = message;
      showToast.value = true;
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    }

    onMounted(() => {
      if (route.query.openModal === "true") {
        add();
      }
      listenToChanges();
      listenToAppointments();
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

    async function deleteStudent(student) {
      if (confirm("Are you sure you want to delete this student?")) {
        try {
          await deleteItem(student.studentId);
          logActivity({
            type: "student",
            action: "delete",
            title: "Student Removed",
            description: `Removed student ${student.firstName} ${student.lastName}`,
            timestamp: serverTimestamp(),
          });
          showNotification(
            `Student ${student.firstName} ${student.lastName} has been deleted`
          );
        } catch (error) {
          console.error("Error deleting student:", error);
          showNotification("Error deleting student");
        }
      }
    }

    async function submitForm(data) {
      try {
        const submitData = {
          ...data,
          updatedAt: serverTimestamp(),
        };

        if (!isEditing.value) {
          submitData.createdAt = serverTimestamp();
          await addItem(submitData);
        } else {
          await updateItem(submitData);
        }

        await logActivity({
          type: "student",
          action: isEditing.value ? "update" : "create",
          title: isEditing.value ? "Student Updated" : "New Student Added",
          description: isEditing.value
            ? `Updated student information for ${data.firstName} ${data.lastName}`
            : `Added new student ${data.firstName} ${data.lastName}`,
          timestamp: serverTimestamp(),
        });

        showNotification(
          `Student ${data.firstName} ${data.lastName} has been ${
            isEditing.value ? "updated" : "added"
          }`
        );
      } catch (error) {
        console.error("Error saving student:", error);
        showNotification("Error saving student information");
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
      yearFilterOptions,
      YEAR_OPTIONS,
      TABLE_HEADERS,
      showToast,
      toastMessage,
      currentUser,
      appointments,
      add,
      editStudent,
      deleteStudent,
      submitForm,
    };
  },
};
</script>

<template>
  <div
    class="bg-white p-6 rounded-2xl shadow-sm mb-4 cursor-pointer"
    @click="toggleAll"
  >
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-satoshi-medium flex items-center gap-2">
        <UsersIcon class="h-5 w-5 text-blue1" />
        Students by Course
        <div class="p-2 rounded-full hover:bg-blue1/10 transition-colors">
          <ChevronDownIcon
            class="h-5 w-5 text-gray-400 transition-transform duration-200"
            :class="{ 'rotate-180': isAllOpen }"
          />
        </div>
      </h2>
      <div class="flex items-center gap-2">
        <Dropdown
          v-if="isAllOpen"
          v-model="selectedYear"
          :options="academicYearOptions"
          class="w-32 text-sm"
          @click.stop
        />
      </div>
    </div>

    <p
      v-if="isAllOpen"
      class="text-xs text-gray-500 mt-2 mb-4 flex justify-end font-satoshi-italic tracking-wide"
    >
      Manage academic years in&nbsp;
      <router-link
        to="/settings"
        class="text-blue1 hover:underline"
        @click.stop
      >
        Settings
      </router-link>
    </p>

    <div v-if="isAllOpen" class="space-y-2 transition-all duration-300 mt-4">
      <div
        v-for="(course, index) in sortedCourses"
        :key="course.name"
        class="border border-gray-200 rounded-lg overflow-hidden"
      >
        <div
          class="flex justify-between items-center p-4 cursor-pointer hover:bg-blue1/5 transition-colors"
          @click.stop="toggleCourse(index)"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: getCourseColorBg(course.name) }"
            >
              <component
                :is="getCourseIcon(course.name)"
                class="h-5 w-5"
                :style="{ color: getCourseColor(course.name) }"
              />
            </div>
            <div>
              <h3 class="font-satoshi-medium">{{ course.name }}</h3>
              <p class="text-sm text-gray-500">
                {{ course.count }}
                {{ course.count === 1 ? "student" : "students" }} enrolled
              </p>
            </div>
          </div>
          <div class="p-2 rounded-full hover:bg-blue1/10 transition-colors">
            <ChevronDownIcon
              class="h-5 w-5 text-gray-400 transition-transform duration-200"
              :class="{ 'rotate-180': openIndex === index }"
            />
          </div>
        </div>

        <div
          v-if="openIndex === index"
          class="bg-gray-50 p-4 transition-all duration-300"
        >
          <div
            v-if="course.students.length === 0"
            class="text-gray-500 text-center py-2"
          >
            No student data available
          </div>
          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="student in paginatedStudents(course)"
              :key="student.id"
              class="py-3 flex justify-between"
            >
              <div class="flex items-center gap-3">
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
                <div>
                  <p class="font-medium">{{ student.name }}</p>
                  <p class="text-sm text-gray-500">{{ student.id }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-blue1 font-medium">
                  {{ student.year }}
                </p>
                <p class="text-xs text-gray-500">
                  Admitted: {{ student.admissionDate }}
                </p>
              </div>
            </div>
          </div>

          <Pagination
            v-if="getTotalPages(course) > 1"
            v-model="coursePages[course.name]"
            :total-pages="getTotalPages(course)"
            @click.stop
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from "vue";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase-config";
import {
  BookOpenIcon,
  ChevronDownIcon,
  UsersIcon,
  GavelIcon,
  GraduationCapIcon,
  ComputerIcon,
  CalculatorIcon,
  UtensilsIcon,
} from "lucide-vue-next";
import Dropdown from "@/components/Dropdown.vue";
import Pagination from "@/components/Pagination.vue";

export default {
  name: "CourseAccordion",
  components: {
    BookOpenIcon,
    ChevronDownIcon,
    UsersIcon,
    GavelIcon,
    GraduationCapIcon,
    ComputerIcon,
    CalculatorIcon,
    UtensilsIcon,
    Dropdown,
    Pagination,
  },
  props: {
    selectedAcademicYear: {
      type: String,
      default: "All",
    },
  },
  setup(props) {
    const selectedYear = ref(props.selectedAcademicYear);
    const academicYearOptions = computed(() => {
      const years = JSON.parse(localStorage.getItem("academicYears") || "[]");
      return [
        { value: "All", label: "All Years" },
        ...years.map((year) => ({ value: year, label: year })),
      ];
    });

    const courses = ref([
      { name: "BSCRIM", count: 0, students: [], order: 1 },
      { name: "BEED", count: 0, students: [], order: 2 },
      { name: "BSED", count: 0, students: [], order: 3 },
      { name: "BSIT", count: 0, students: [], order: 4 },
      { name: "BSAB", count: 0, students: [], order: 5 },
      { name: "BSHM", count: 0, students: [], order: 6 },
    ]);

    const sortedCourses = computed(() => {
      return [...courses.value].sort((a, b) => a.order - b.order);
    });

    const openIndex = ref(null);
    const isAllOpen = ref(true);

    // Pagination settings
    const itemsPerPage = 5;
    const coursePages = ref({
      BSCRIM: 1,
      BEED: 1,
      BSED: 1,
      BSIT: 1,
      BSAB: 1,
      BSHM: 1,
    });

    const getTotalPages = (course) => {
      return Math.ceil(course.students.length / itemsPerPage) || 1;
    };

    const paginatedStudents = (course) => {
      // Sort students by ID in ascending order
      const sortedStudents = [...course.students].sort((a, b) => {
        const aNum = parseInt(a.id, 10);
        const bNum = parseInt(b.id, 10);
        return aNum - bNum;
      });

      const currentPage = coursePages.value[course.name];
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return sortedStudents.slice(startIndex, endIndex);
    };

    const toggleAll = () => {
      isAllOpen.value = !isAllOpen.value;
      if (!isAllOpen.value) {
        openIndex.value = null;
      }
    };

    const toggleCourse = (index) => {
      openIndex.value = openIndex.value === index ? null : index;
    };

    const getCourseIcon = (courseName) => {
      switch (courseName) {
        case "BSCRIM":
          return GavelIcon;
        case "BEED":
        case "BSED":
          return GraduationCapIcon;
        case "BSIT":
          return ComputerIcon;
        case "BSAB":
          return CalculatorIcon;
        case "BSHM":
          return UtensilsIcon;
        default:
          return BookOpenIcon;
      }
    };

    const getCourseColor = (courseName) => {
      switch (courseName) {
        case "BSCRIM":
          return "#800000"; // Maroon
        case "BEED":
          return "#228B22"; // Forest green (unchanged)
        case "BSED":
          return "#0000FF"; // Blue
        case "BSIT":
          return "#8A2BE2"; // Violet
        case "BSAB":
          return "#008000"; // Green
        case "BSHM":
          return "#FFD700"; // Yellow
        default:
          return "#4169E1"; // Royal blue
      }
    };

    const getCourseColorBg = (courseName) => {
      switch (courseName) {
        case "BSCRIM":
          return "#FFD1D1"; // Light maroon
        case "BEED":
          return "#CCFFCC"; // Light green (unchanged)
        case "BSED":
          return "#D1D1FF"; // Light blue
        case "BSIT":
          return "#E8D1FF"; // Light violet
        case "BSAB":
          return "#D1FFD1"; // Light green
        case "BSHM":
          return "#FFFFD1"; // Light yellow
        default:
          return "#CCCCFF"; // Light blue-purple
      }
    };

    const fetchStudentData = async () => {
      try {
        // Reset counts
        courses.value.forEach((course) => {
          course.count = 0;
          course.students = [];
        });

        // Get all students based on academic year selection
        let studentsQuery;
        if (selectedYear.value === "All") {
          studentsQuery = collection(db, "students");
        } else {
          studentsQuery = query(
            collection(db, "students"),
            where("schoolYear", "==", selectedYear.value)
          );
        }

        const studentsSnapshot = await getDocs(studentsQuery);

        // Process each student
        studentsSnapshot.forEach((doc) => {
          const student = doc.data();
          const courseName = student.course;
          const courseIndex = courses.value.findIndex(
            (c) => c.name === courseName
          );

          if (courseIndex !== -1) {
            courses.value[courseIndex].count++;

            // Add student details to the course
            courses.value[courseIndex].students.push({
              id: student.studentId,
              name: `${student.firstName} ${student.lastName}`,
              year: student.schoolYear || "N/A",
              admissionDate: formatDate(
                student.admissionDate
                  ? new Date(student.admissionDate)
                  : new Date()
              ),
              profileImage: student.profileImage || null,
            });
          }
        });

        // Reset pagination for all courses
        Object.keys(coursePages.value).forEach((key) => {
          coursePages.value[key] = 1;
        });
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    const formatDate = (date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    // Watch for changes in selectedYear
    watch(selectedYear, (newYear) => {
      fetchStudentData();
    });

    // Also watch for props change
    watch(
      () => props.selectedAcademicYear,
      (newYear) => {
        selectedYear.value = newYear;
      }
    );

    onMounted(() => {
      fetchStudentData();
    });

    return {
      courses,
      sortedCourses,
      openIndex,
      isAllOpen,
      toggleAll,
      toggleCourse,
      getCourseIcon,
      getCourseColor,
      getCourseColorBg,
      selectedYear,
      academicYearOptions,
      coursePages,
      paginatedStudents,
      getTotalPages,
    };
  },
};
</script>

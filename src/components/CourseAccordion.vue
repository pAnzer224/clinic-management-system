<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm mb-4">
    <div
      class="flex justify-between items-center cursor-pointer py-1"
      @click="toggleMainAccordion"
    >
      <h2 class="text-lg font-satoshi-medium flex items-center gap-2">
        <ClipboardListIcon class="h-5 w-5 text-blue1" />
        Students Requiring Medication by Course
      </h2>
      <div class="p-2 hover:bg-blue1/15 hover:rounded-full">
        <ChevronDownIcon
          class="size-6 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': isMainAccordionOpen }"
        />
      </div>
    </div>

    <div
      v-show="isMainAccordionOpen"
      class="space-y-2 transition-all duration-300 mt-4"
    >
      <div
        v-for="(course, index) in courses"
        :key="course.name"
        class="border border-gray-200 rounded-lg overflow-hidden"
      >
        <div
          class="flex justify-between items-center p-4 cursor-pointer hover:bg-blue1/5 transition-colors"
          @click="toggleCourse(index)"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-blue1/10 flex items-center justify-center"
            >
              <component
                :is="getCourseIcon(course.name)"
                class="h-5 w-5 text-blue1"
              />
            </div>
            <div>
              <h3 class="font-satoshi-medium">{{ course.name }}</h3>
              <p class="text-sm text-gray-500">
                {{ course.count }}
                {{ course.count === 1 ? "student" : "students" }} requiring
                medication
              </p>
            </div>
          </div>
          <ChevronDownIcon
            class="h-5 w-5 text-gray-400 transition-transform duration-200"
            :class="{ 'rotate-180': openIndex === index }"
          />
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
              v-for="student in course.students"
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
                  {{ student.medicationCount }} medications
                </p>
                <p class="text-xs text-gray-500">
                  Last updated: {{ student.lastUpdated }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase-config";
import {
  BookOpenIcon,
  ChevronDownIcon,
  ClipboardListIcon,
  GavelIcon,
  GraduationCapIcon,
  ComputerIcon,
  CalculatorIcon,
  UtensilsIcon,
} from "lucide-vue-next";

export default {
  name: "CourseAccordion",
  components: {
    BookOpenIcon,
    ChevronDownIcon,
    ClipboardListIcon,
    GavelIcon,
    GraduationCapIcon,
    ComputerIcon,
    CalculatorIcon,
    UtensilsIcon,
  },
  props: {
    selectedAcademicYear: {
      type: String,
      default: "All",
    },
  },
  setup(props) {
    const courses = ref([
      { name: "BSCRIM", count: 0, students: [] },
      { name: "BEED", count: 0, students: [] },
      { name: "BSED", count: 0, students: [] },
      { name: "BSIT", count: 0, students: [] },
      { name: "BSAB", count: 0, students: [] },
      { name: "HM", count: 0, students: [] },
    ]);
    const openIndex = ref(null);
    const isMainAccordionOpen = ref(false);

    const toggleMainAccordion = () => {
      isMainAccordionOpen.value = !isMainAccordionOpen.value;
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
        case "HM":
          return UtensilsIcon;
        default:
          return BookOpenIcon;
      }
    };

    const fetchMedicationData = async () => {
      try {
        // Reset counts
        courses.value.forEach((course) => {
          course.count = 0;
          course.students = [];
        });

        // gets all medical records
        const recordsQuery = collection(db, "medicalRecords");
        const recordsSnapshot = await getDocs(recordsQuery);

        // Create a map of student IDs to their medication counts
        const studentMedicationMap = {};

        recordsSnapshot.forEach((doc) => {
          const record = doc.data();
          const studentId = record.studentId;

          if (!studentMedicationMap[studentId]) {
            studentMedicationMap[studentId] = {
              count: 0,
              lastUpdated: record.date ? new Date(record.date) : new Date(),
              medications: [],
            };
          }

          if (record.medications && record.medications.length > 0) {
            studentMedicationMap[studentId].count += record.medications.length;
            studentMedicationMap[studentId].medications.push(
              ...record.medications
            );

            // Update last updated date if this record is newer
            const recordDate = record.date ? new Date(record.date) : new Date();
            if (recordDate > studentMedicationMap[studentId].lastUpdated) {
              studentMedicationMap[studentId].lastUpdated = recordDate;
            }
          }
        });

        // Now get all students
        let studentsQuery;
        if (props.selectedAcademicYear === "All") {
          studentsQuery = collection(db, "students");
        } else {
          studentsQuery = query(
            collection(db, "students"),
            where("schoolYear", "==", props.selectedAcademicYear)
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
            // Check if this student has medications:
            if (
              studentMedicationMap[student.studentId] &&
              studentMedicationMap[student.studentId].count > 0
            ) {
              courses.value[courseIndex].count++;

              // student details to the course
              courses.value[courseIndex].students.push({
                id: student.studentId,
                name: `${student.firstName} ${student.lastName}`,
                medicationCount: studentMedicationMap[student.studentId].count,
                lastUpdated: formatDate(
                  studentMedicationMap[student.studentId].lastUpdated
                ),
                profileImage: student.profileImage || null,
              });
            }
          }
        });

        // Sort students by medication count (highest first)
        courses.value.forEach((course) => {
          course.students.sort((a, b) => b.medicationCount - a.medicationCount);
        });
      } catch (error) {
        console.error("Error fetching medication data:", error);
      }
    };

    const formatDate = (date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    // Watch for changes in selectedAcademicYear
    watch(
      () => props.selectedAcademicYear,
      () => {
        fetchMedicationData();
      }
    );

    onMounted(() => {
      fetchMedicationData();
    });

    return {
      courses,
      openIndex,
      isMainAccordionOpen,
      toggleMainAccordion,
      toggleCourse,
      getCourseIcon,
    };
  },
};
</script>

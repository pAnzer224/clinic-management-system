<template>
  <main class="flex-1 space-y-6">
    <h1 class="text-2xl font-satoshi-bold text-text">Dashboard Overview</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.title"
        class="bg-blue3/30 p-6 rounded-2xl shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-text font-medium text-[15px]">{{ stat.title }}</p>
            <p class="text-2xl font-satoshi-bold mt-2 text-blue1">
              {{ stat.value }}
            </p>
          </div>
          <component
            :is="stat.icon"
            class="size-10 text-blue1 bg-blue1/10 rounded-full p-2 mt-8"
          />
        </div>
        <p
          class="text-sm mt-4"
          :class="stat.trend >= 0 ? 'text-green-600' : 'text-red-600'"
        >
          {{ stat.trend >= 0 ? "+" : "" }}{{ stat.trend }}% from last month
        </p>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Students by Course -->
      <div class="bg-white p-6 rounded-2xl shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-satoshi-medium">Students by Course</h2>
          <Dropdown
            v-model="selectedAcademicYear"
            :options="academicYearOptions"
            class="w-40"
          />
        </div>
        <apexchart
          type="bar"
          height="350"
          :options="courseChartOptions"
          :series="courseChartSeries"
        />
      </div>

      <!-- weekly Appointments -->
      <div class="bg-white p-6 rounded-2xl shadow-sm">
        <h2 class="text-lg font-satoshi-medium mb-4">Weekly Appointments</h2>
        <apexchart
          type="area"
          height="350"
          :options="appointmentChartOptions"
          :series="appointmentChartSeries"
        />
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white p-6 rounded-2xl shadow-sm">
      <h2 class="text-lg font-satoshi-medium mb-4">Recent Activity</h2>
      <div class="max-h-[400px] overflow-y-auto">
        <div
          v-for="(activity, index) in sortedActivities"
          :key="activity.id"
          class="flex items-start gap-4 p-4"
          :class="{
            'border-b border-gray-200': index !== sortedActivities.length - 1,
          }"
        >
          <div
            class="w-10 h-10 rounded-full bg-blue1/10 flex items-center justify-center flex-shrink-0"
          >
            <component
              :is="getActivityIcon(activity.type, activity.action)"
              class="h-5 w-5 text-blue1"
            />
          </div>
          <div class="flex-grow">
            <p class="font-medium">{{ activity.title }}</p>
            <p class="text-sm text-gray-600">{{ activity.description }}</p>
            <div class="text-xs text-gray-400 mt-1 flex gap-2">
              <span>{{ formatTimeAgo(activity.timestamp) }}</span>
              <span>•</span>
              <span
                >by
                {{
                  currentUser.staffId && activity.performedBy?.role === "admin"
                    ? "Admin"
                    : activity.performedBy?.name || "Unknown User"
                }}{{
                  !currentUser.staffId || activity.performedBy?.role !== "admin"
                    ? ` (${activity.performedBy?.role})`
                    : ""
                }}</span
              >
            </div>
          </div>
          <button
            v-if="currentUser.role === 'admin'"
            @click="deleteActivity(activity.id)"
            class="text-red-500 hover:text-red-700 p-2 hover:bg-red-100 rounded-full"
          >
            <Trash2 class="h-5 w-5" />
          </button>
        </div>
        <div
          v-if="sortedActivities.length === 0"
          class="text-center text-gray-500 py-4"
        >
          No recent activities
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, computed, watch } from "vue";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import VueApexCharts from "vue3-apexcharts";
import {
  UsersIcon,
  CalendarIcon,
  PillIcon,
  ClipboardIcon,
  UserPlusIcon,
  PencilIcon,
  Trash2,
  TrashIcon,
  FileTextIcon,
  ActivityIcon,
} from "lucide-vue-next";
import Dropdown from "@/components/Dropdown.vue";

export default {
  name: "Overview",
  components: {
    apexchart: VueApexCharts,
    UsersIcon,
    CalendarIcon,
    PillIcon,
    ClipboardIcon,
    UserPlusIcon,
    FileTextIcon,
    ActivityIcon,
    TrashIcon,
    Trash2,
    Dropdown,
  },
  setup() {
    const currentUser = ref(
      JSON.parse(localStorage.getItem("currentUser")) || {}
    );
    const stats = ref([
      {
        title: "Total Students",
        value: 0,
        trend: 12,
        icon: UsersIcon,
      },
      {
        title: "Today's Appointments",
        value: 0,
        trend: 5,
        icon: CalendarIcon,
      },
      {
        title: "Available Medications",
        value: 0,
        trend: -3,
        icon: PillIcon,
      },
      {
        title: "Medical Records",
        value: 0,
        trend: 8,
        icon: ClipboardIcon,
      },
    ]);

    const selectedAcademicYear = ref("2024-2025");
    const academicYearOptions = [
      { value: "2023-2024", label: "2023-2024" },
      { value: "2024-2025", label: "2024-2025" },
      { value: "2025-2026", label: "2025-2026" },
    ];

    const courseChartOptions = {
      chart: {
        type: "bar",
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      xaxis: {
        categories: ["BSCRIM", "BEED", "BSED", "BSIT", "BSAB", "HM"],
      },
      colors: ["#3B82F6"],
      legend: {
        position: "bottom",
      },
    };

    const courseChartSeries = ref([
      {
        name: "Students",
        data: [0, 0, 0, 0, 0, 0],
      },
    ]);

    const appointmentChartOptions = {
      chart: {
        type: "area",
        toolbar: {
          show: false,
        },
        stacked: false,
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: [2, 2, 2],
      },
      colors: ["#3B82F6", "#EF4444", "#10B981"],
      xaxis: {
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      tooltip: {
        x: {
          format: "dd",
        },
      },
      legend: {
        position: "top",
      },
    };

    const appointmentChartSeries = ref([
      {
        name: "Regular Consultations",
        data: [12, 15, 14, 16, 13, 8, 5],
      },
      {
        name: "Emergency Cases",
        data: [2, 1, 2, 1, 2, 3, 2],
      },
      {
        name: "Follow-up Visits",
        data: [6, 8, 7, 9, 6, 2, 1],
      },
    ]);

    const recentActivities = ref([]);
    const sortedActivities = computed(() => {
      return [...recentActivities.value].sort((a, b) => {
        return b.timestamp - a.timestamp;
      });
    });

    // Watch for changes in selectedAcademicYear and update chart
    watch(selectedAcademicYear, (newYear) => {
      // Fetch students with the selected academic year
      fetchStudentsByAcademicYear(newYear);
    });

    const fetchStudentsByAcademicYear = (academicYear) => {
      const studentsQuery = query(
        collection(db, "students"),
        where("schoolYear", "==", academicYear)
      );

      onSnapshot(studentsQuery, (snapshot) => {
        updateCourseChart(snapshot);
      });
    };

    const fetchStats = () => {
      // Students count
      onSnapshot(collection(db, "students"), (snapshot) => {
        stats.value[0].value = snapshot.size;
        // Initial chart update on load (will be filtered by watch later)
        updateCourseChart(snapshot, true);
      });

      // Today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      onSnapshot(collection(db, "appointments"), (snapshot) => {
        stats.value[1].value = snapshot.docs.filter((doc) => {
          const appointmentDate = new Date(doc.data().date);
          return appointmentDate.toDateString() === today.toDateString();
        }).length;
      });

      // Available medications
      onSnapshot(collection(db, "medications"), (snapshot) => {
        stats.value[2].value = snapshot.docs.filter(
          (doc) => doc.data().status === "In Stock"
        ).length;
      });

      // Medical records
      onSnapshot(collection(db, "medicalRecords"), (snapshot) => {
        stats.value[3].value = snapshot.size;
      });
    };

    const updateCourseChart = (snapshot, initialLoad = false) => {
      const courseCounts = {
        BSCRIM: 0,
        BEED: 0,
        BSED: 0,
        BSIT: 0,
        BSAB: 0,
        HM: 0,
      };

      snapshot.forEach((doc) => {
        const data = doc.data();
        // If this is the initial load, only count students from the selected academic year
        if (initialLoad && data.schoolYear !== selectedAcademicYear.value) {
          return;
        }

        const course = data.course;
        if (courseCounts.hasOwnProperty(course)) {
          courseCounts[course]++;
        }
      });

      courseChartSeries.value[0].data = Object.values(courseCounts);
    };

    const fetchRecentActivities = () => {
      const activitiesQuery = query(
        collection(db, "activities"),
        orderBy("timestamp", "desc"),
        limit(6)
      );

      onSnapshot(activitiesQuery, (snapshot) => {
        recentActivities.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp:
            doc.data().timestamp instanceof Timestamp
              ? doc.data().timestamp.toDate()
              : new Date(doc.data().timestamp),
        }));
      });
    };

    const deleteActivity = async (activityId) => {
      if (!confirm("Are you sure you want to delete this activity?")) return;

      try {
        await deleteDoc(doc(db, "activities", activityId));
      } catch (error) {
        console.error("Error deleting activity:", error);
      }
    };

    const getActivityIcon = (type, action) => {
      if (type === "student") {
        switch (action) {
          case "create":
            return UserPlusIcon;
          case "update":
            return PencilIcon;
          case "delete":
            return TrashIcon;
          default:
            return UsersIcon;
        }
      }
      if (type === "record") return FileTextIcon;
      if (type === "appointment") return CalendarIcon;
      return ActivityIcon;
    };

    const formatTimeAgo = (timestamp) => {
      if (!timestamp) return "";

      const seconds = Math.floor((new Date() - timestamp) / 1000);

      let interval = Math.floor(seconds / 31536000);
      if (interval >= 1)
        return interval + " year" + (interval === 1 ? "" : "s") + " ago";

      interval = Math.floor(seconds / 2592000);
      if (interval >= 1)
        return interval + " month" + (interval === 1 ? "" : "s") + " ago";

      interval = Math.floor(seconds / 86400);
      if (interval >= 1)
        return interval + " day" + (interval === 1 ? "" : "s") + " ago";

      interval = Math.floor(seconds / 3600);
      if (interval >= 1)
        return interval + " hour" + (interval === 1 ? "" : "s") + " ago";

      interval = Math.floor(seconds / 60);
      if (interval >= 1)
        return interval + " minute" + (interval === 1 ? "" : "s") + " ago";

      return "just now";
    };

    onMounted(() => {
      fetchStats();
      fetchRecentActivities();
      // Initial load of students filtered by academic year
      fetchStudentsByAcademicYear(selectedAcademicYear.value);
    });

    return {
      stats,
      courseChartOptions,
      courseChartSeries,
      appointmentChartOptions,
      appointmentChartSeries,
      recentActivities,
      formatTimeAgo,
      getActivityIcon,
      currentUser,
      sortedActivities,
      deleteActivity,
      selectedAcademicYear,
      academicYearOptions,
    };
  },
};
</script>

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
        <h2 class="text-lg font-satoshi-medium mb-4">Students by Course</h2>
        <apexchart
          type="bar"
          height="350"
          :options="courseChartOptions"
          :series="courseChartSeries"
        />
      </div>

      <!-- Monthly Appointments -->
      <div class="bg-white p-6 rounded-2xl shadow-sm">
        <h2 class="text-lg font-satoshi-medium mb-4">Monthly Appointments</h2>
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
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-satoshi-medium">Recent Activity</h2>
        <button
          class="text-blue1 text-sm hover:underline"
          @click="viewAllActivities"
        >
          View All
        </button>
      </div>
      <div class="space-y-4">
        <div
          v-for="activity in recentActivities"
          :key="activity.id"
          class="flex items-start gap-4 p-4 rounded-lg bg-gray-50"
        >
          <div
            class="w-10 h-10 rounded-full bg-blue1/10 flex items-center justify-center flex-shrink-0"
          >
            <component :is="activity.icon" class="h-5 w-5 text-blue1" />
          </div>
          <div>
            <p class="font-medium">{{ activity.title }}</p>
            <p class="text-sm text-gray-600">{{ activity.description }}</p>
            <p class="text-xs text-gray-400 mt-1">
              {{ formatTimeAgo(activity.timestamp) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted } from "vue";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import VueApexCharts from "vue3-apexcharts";
import {
  UsersIcon,
  CalendarIcon,
  PillIcon,
  ClipboardIcon,
  UserPlusIcon,
  FileTextIcon,
  ActivityIcon,
} from "lucide-vue-next";

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
  },
  setup() {
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
      colors: [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6",
        "#EC4899",
      ],
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
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      },
      tooltip: {
        x: {
          format: "MMM",
        },
      },
    };

    const appointmentChartSeries = ref([
      {
        name: "Appointments",
        data: [30, 40, 35, 50, 49, 60, 70],
      },
    ]);

    const recentActivities = ref([]);

    const fetchStats = () => {
      // Students count
      onSnapshot(collection(db, "students"), (snapshot) => {
        stats.value[0].value = snapshot.size;
        updateCourseChart(snapshot);
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

    const updateCourseChart = (snapshot) => {
      const courseCounts = {
        BSCRIM: 0,
        BEED: 0,
        BSED: 0,
        BSIT: 0,
        BSAB: 0,
        HM: 0,
      };

      snapshot.forEach((doc) => {
        const course = doc.data().course;
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
        limit(5)
      );

      onSnapshot(activitiesQuery, (snapshot) => {
        recentActivities.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          icon: getActivityIcon(doc.data().type),
        }));
      });
    };

    const getActivityIcon = (type) => {
      const icons = {
        student: UserPlusIcon,
        record: FileTextIcon,
        appointment: CalendarIcon,
        default: ActivityIcon,
      };
      return icons[type] || icons.default;
    };

    const formatTimeAgo = (timestamp) => {
      // Add your time formatting logic here
      return new Date(timestamp).toLocaleDateString();
    };

    const viewAllActivities = () => {
      // Add your navigation logic here
    };

    onMounted(() => {
      fetchStats();
      fetchRecentActivities();
    });

    return {
      stats,
      courseChartOptions,
      courseChartSeries,
      appointmentChartOptions,
      appointmentChartSeries,
      recentActivities,
      formatTimeAgo,
      viewAllActivities,
    };
  },
};
</script>

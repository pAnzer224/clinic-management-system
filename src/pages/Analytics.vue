<template>
  <main class="flex-1 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Analytics Dashboard</h1>
      <button
        @click="downloadCSVReport"
        class="bg-blue1 hover:bg-blue1/80 text-white px-4 py-2 rounded-full text-[15px] flex items-center gap-2"
      >
        <DownloadIcon class="h-5 w-5" />
        Download Report
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <router-link
        v-for="stat in stats"
        :key="stat.title"
        :to="stat.route"
        class="bg-gradient-to-tr from-blue1/40 to-blue3/30 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
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
          class="text-sm mt-4 font-medium tracking-wide"
          :class="stat.trend >= 0 ? 'text-green-600' : 'text-red-600'"
        >
          {{ stat.trend >= 0 ? "+" : "" }}{{ stat.trend.toFixed(1) }}% from last
          month
        </p>
      </router-link>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Students Requiring Medication by Course -->
      <div class="bg-white p-6 rounded-2xl shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-satoshi-medium">
            Students Requiring Medication by Course
          </h2>
          <Dropdown
            v-model="selectedAcademicYear"
            :options="academicYearOptions"
            class="w-32 text-sm"
          />
        </div>
        <div
          v-if="loadingMedicationChart"
          class="flex justify-center items-center h-[350px]"
        >
          <intersecting-circles-spinner
            :animation-duration="1200"
            :size="70"
            color="#3f73ce"
          />
        </div>
        <apexchart
          v-else
          type="pie"
          height="350"
          :options="medicationChartOptions"
          :series="medicationChartSeries"
        />
      </div>

      <!-- Weekly Appointments -->
      <div class="bg-white p-6 rounded-2xl shadow-sm">
        <h2 class="text-lg font-satoshi-medium mb-4">Weekly Appointments</h2>
        <div
          v-if="loadingAppointmentChart"
          class="flex justify-center items-center h-[350px]"
        >
          <intersecting-circles-spinner
            :animation-duration="1200"
            :size="70"
            color="#3f73ce"
          />
        </div>
        <apexchart
          v-else
          type="area"
          height="350"
          :options="appointmentChartOptions"
          :series="appointmentChartSeries"
        />
      </div>
    </div>

    <!-- Medication Usage Analysis -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Most Used Medications by Gender -->
      <div class="bg-white p-6 rounded-2xl shadow-sm">
        <h2 class="text-lg font-satoshi-medium mb-4">
          Most Used Medications by Gender
        </h2>
        <div
          v-if="loadingGenderChart"
          class="flex justify-center items-center h-[350px]"
        >
          <intersecting-circles-spinner
            :animation-duration="1200"
            :size="70"
            color="#3f73ce"
          />
        </div>
        <apexchart
          v-else
          type="bar"
          height="350"
          :options="medicationByGenderOptions"
          :series="medicationByGenderSeries"
        />
      </div>

      <!-- Top Medications by Usage -->
      <div class="bg-white p-6 rounded-2xl shadow-sm">
        <h2 class="text-lg font-satoshi-medium mb-4">
          Top Medications by Usage
        </h2>
        <div
          v-if="loadingTopMedChart"
          class="flex justify-center items-center h-[350px]"
        >
          <intersecting-circles-spinner
            :animation-duration="1200"
            :size="70"
            color="#3f73ce"
          />
        </div>
        <apexchart
          v-else
          type="donut"
          height="350"
          :options="topMedicationsOptions"
          :series="topMedicationsSeries"
        />
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, computed, watch, onBeforeUnmount } from "vue";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import VueApexCharts from "vue3-apexcharts";
import {
  UsersIcon,
  CalendarIcon,
  PillIcon,
  ClipboardIcon,
  DownloadIcon,
} from "lucide-vue-next";
import { IntersectingCirclesSpinner } from "epic-spinners";
import Dropdown from "@/components/Dropdown.vue";

export default {
  name: "Analytics",
  components: {
    apexchart: VueApexCharts,
    UsersIcon,
    CalendarIcon,
    PillIcon,
    ClipboardIcon,
    DownloadIcon,
    Dropdown,
    IntersectingCirclesSpinner,
  },
  setup() {
    // Separate loading states for each chart
    const loadingMedicationChart = ref(true);
    const loadingAppointmentChart = ref(true);
    const loadingGenderChart = ref(true);
    const loadingTopMedChart = ref(true);

    const stats = ref([
      {
        title: "Total Students",
        value: 0,
        trend: 0,
        icon: UsersIcon,
        collection: "students",
        route: "/students",
      },
      {
        title: "Today's Appointments",
        value: 0,
        trend: 0,
        icon: CalendarIcon,
        collection: "appointments",
        route: "/appointments",
      },
      {
        title: "Available Medications",
        value: 0,
        trend: 0,
        icon: PillIcon,
        collection: "medications",
        route: "/medications",
      },
      {
        title: "Medical Records",
        value: 0,
        trend: 0,
        icon: ClipboardIcon,
        collection: "medicalRecords",
        route: "/records",
      },
    ]);

    const selectedAcademicYear = ref("All");
    const academicYearOptions = computed(() => {
      const years = JSON.parse(localStorage.getItem("academicYears") || "[]");
      return [
        { value: "All", label: "All Years" },
        ...years.map((year) => ({ value: year, label: year })),
      ];
    });

    // Course medication chart data
    const medicationChartSeries = ref([]);
    const medicationChartOptions = ref({
      chart: { type: "pie" },
      labels: ["BSIT", "BSHM", "BSCRIM", "BSAB", "BSED", "BEED"],
      colors: [
        "#D551D0",
        "#D5D051",
        "#800000",
        "#51D566",
        "#517ED5",
        "#51AED5",
      ],
      legend: { position: "right" },
      tooltip: {
        y: {
          formatter: (value) => `${value} students`,
        },
      },
      dataLabels: {
        formatter: (val, opts) => {
          return (
            opts.w.globals.series[opts.seriesIndex] +
            " (" +
            val.toFixed(0) +
            "%)"
          );
        },
      },
    });

    // Appointment chart data
    const appointmentChartSeries = ref([]);
    const appointmentChartOptions = ref({
      chart: {
        type: "area",
        toolbar: { show: false },
        stacked: false,
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: [2, 2, 2],
      },
      colors: ["#3B82F6", "#EF4444", "#10B981"],
      xaxis: {
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      tooltip: {
        x: { format: "dd" },
      },
      legend: { position: "top" },
    });

    // Medication by gender chart data
    const medicationByGenderOptions = ref({
      chart: {
        type: "bar",
        stacked: false,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded",
        },
      },
      dataLabels: { enabled: false },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: { categories: [] },
      yaxis: {
        title: { text: "Usage Count" },
      },
      fill: { opacity: 1 },
      tooltip: {
        y: {
          formatter: (val) => `${val} uses`,
        },
      },
      colors: ["#517ED5", "#D551D0"],
    });

    const medicationByGenderSeries = ref([
      { name: "Male", data: [] },
      { name: "Female", data: [] },
    ]);

    // Top medications chart data
    const topMedicationsOptions = ref({
      chart: { type: "donut" },
      labels: [],
      colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
      legend: { position: "bottom" },
      dataLabels: { enabled: true },
      tooltip: {
        y: {
          formatter: (val) => `${val} uses`,
        },
      },
    });

    const topMedicationsSeries = ref([]);
    const unsubscribes = [];

    // Fetch course medication data with year filter
    async function fetchMedicationByCoursesData() {
      loadingMedicationChart.value = true;
      try {
        const courseMedicationCounts = {
          BSIT: 0,
          BSHM: 0,
          BSCRIM: 0,
          BSAB: 0,
          BSED: 0,
          BEED: 0,
        };

        // Get all medical records for the selected year
        let recordsQuery = query(
          collection(db, "medicalRecords"),
          orderBy("date", "desc")
        );

        const recordsSnapshot = await getDocs(recordsQuery);
        const promises = [];

        // Process records
        for (const doc of recordsSnapshot.docs) {
          const record = doc.data();

          // Skip if no medications or no student ID
          if (!record.medications?.length || !record.studentId) continue;

          // Get student data to check course
          promises.push(
            getDocs(
              query(
                collection(db, "students"),
                where("studentId", "==", record.studentId),
                limit(1)
              )
            ).then((studentSnapshot) => {
              if (!studentSnapshot.empty) {
                const student = studentSnapshot.docs[0].data();

                // Apply academic year filter
                if (
                  selectedAcademicYear.value !== "All" &&
                  student.academicYear !== selectedAcademicYear.value
                ) {
                  return;
                }

                // Count medication usage by course
                if (
                  student.course &&
                  courseMedicationCounts.hasOwnProperty(student.course)
                ) {
                  courseMedicationCounts[student.course]++;
                }
              }
            })
          );
        }

        await Promise.all(promises);

        // Update chart series
        medicationChartSeries.value = Object.values(courseMedicationCounts);
      } catch (error) {
        console.error("Error fetching medication by courses data:", error);
      } finally {
        loadingMedicationChart.value = false;
      }
    }

    // Fetch medication usage data
    async function fetchMedicationUsageData() {
      loadingGenderChart.value = true;
      loadingTopMedChart.value = true;
      try {
        const medicationUsage = new Map();
        const medicationByGender = new Map();
        const recordsCache = new Map(); // Cache for student data

        // Get only recent records for better performance (limit to last 500)
        const recordsQuery = query(
          collection(db, "medicalRecords"),
          orderBy("date", "desc"),
          limit(500)
        );

        const recordsSnapshot = await getDocs(recordsQuery);

        // Process records in parallel
        const promises = recordsSnapshot.docs.map(async (doc) => {
          const record = doc.data();

          if (!record.medications?.length) return;

          // Get student data for gender information (use cache when possible)
          let student;
          if (recordsCache.has(record.studentId)) {
            student = recordsCache.get(record.studentId);
          } else {
            const studentDoc = await getDocs(
              query(
                collection(db, "students"),
                where("studentId", "==", record.studentId),
                limit(1)
              )
            );

            if (!studentDoc.empty) {
              student = studentDoc.docs[0].data();
              recordsCache.set(record.studentId, student);
            }
          }

          if (!student) return;

          const gender = student.sex?.toLowerCase();

          // Process medications
          for (const medication of record.medications) {
            // Update total usage count
            const currentCount = medicationUsage.get(medication.name) || 0;
            medicationUsage.set(medication.name, currentCount + 1);

            // Update gender-based usage
            if (!medicationByGender.has(medication.name)) {
              medicationByGender.set(medication.name, { male: 0, female: 0 });
            }

            if (gender === "male" || gender === "female") {
              medicationByGender.get(medication.name)[gender]++;
            }
          }
        });

        await Promise.all(promises);

        // Process data for charts
        const topMedications = Array.from(medicationUsage.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        // Update top medications donut chart
        topMedicationsOptions.value.labels = topMedications.map(
          ([name]) => name
        );
        topMedicationsSeries.value = topMedications.map(([, count]) => count);

        // Update medication by gender bar chart
        const topMedicationsByGender = Array.from(medicationByGender.entries())
          .sort((a, b) => b[1].male + b[1].female - (a[1].male + a[1].female))
          .slice(0, 5);

        medicationByGenderOptions.value.xaxis.categories =
          topMedicationsByGender.map(([name]) => name);

        medicationByGenderSeries.value = [
          {
            name: "Male",
            data: topMedicationsByGender.map(([, counts]) => counts.male),
          },
          {
            name: "Female",
            data: topMedicationsByGender.map(([, counts]) => counts.female),
          },
        ];
      } catch (error) {
        console.error("Error fetching medication usage data:", error);
      } finally {
        loadingGenderChart.value = false;
        loadingTopMedChart.value = false;
      }
    }

    // Fetch appointment data
    async function fetchAppointmentData() {
      loadingAppointmentChart.value = true;
      try {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());

        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("date", ">=", weekStart),
          orderBy("date"),
          limit(100) // Limit for better performance
        );

        const snapshot = await getDocs(appointmentsQuery);

        // Initialize data structure
        const appointmentsByType = {
          regular: Array(7).fill(0),
          emergency: Array(7).fill(0),
          followup: Array(7).fill(0),
        };

        // Process appointments
        snapshot.docs.forEach((doc) => {
          const appointment = doc.data();
          const appointmentDate = appointment.date.toDate
            ? appointment.date.toDate()
            : new Date(appointment.date);
          const dayIndex = appointmentDate.getDay();

          switch (appointment.type?.toLowerCase()) {
            case "emergency":
              appointmentsByType.emergency[dayIndex]++;
              break;
            case "follow-up":
              appointmentsByType.followup[dayIndex]++;
              break;
            default:
              appointmentsByType.regular[dayIndex]++;
          }
        });

        // Update chart series
        appointmentChartSeries.value = [
          {
            name: "Regular Consultations",
            data: appointmentsByType.regular,
          },
          {
            name: "Emergency Cases",
            data: appointmentsByType.emergency,
          },
          {
            name: "Follow-up Visits",
            data: appointmentsByType.followup,
          },
        ];
      } catch (error) {
        console.error("Error fetching appointment data:", error);
      } finally {
        loadingAppointmentChart.value = false;
      }
    }

    // Download CSV report
    function downloadCSVReport() {
      const csvData = [];

      // Add header row for stats
      csvData.push(["Statistics Summary", "Value", "Monthly Change (%)"]);

      // Add stats data
      stats.value.forEach((stat) => {
        csvData.push([stat.title, stat.value, stat.trend.toFixed(1)]);
      });

      csvData.push([]);

      // Add medication usage data
      if (topMedicationsOptions.value.labels.length) {
        csvData.push(["Top Medications by Usage", "Count"]);
        topMedicationsOptions.value.labels.forEach((label, index) => {
          csvData.push([label, topMedicationsSeries.value[index]]);
        });
      }

      csvData.push([]);

      // Add gender-based usage
      if (medicationByGenderSeries.value[0].data.length) {
        csvData.push(["Medication Usage by Gender"]);
        csvData.push(["Medication", "Male Usage", "Female Usage"]);
        medicationByGenderOptions.value.xaxis.categories.forEach(
          (med, index) => {
            csvData.push([
              med,
              medicationByGenderSeries.value[0].data[index],
              medicationByGenderSeries.value[1].data[index],
            ]);
          }
        );
      }

      // Convert to CSV string and download
      const csvContent = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `health_center_report_${new Date().toISOString().slice(0, 10)}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Set up real-time stats listeners
    function setupRealTimeStatsListeners() {
      stats.value.forEach((stat, index) => {
        const collectionRef = collection(db, stat.collection);
        let q = collectionRef;

        if (stat.title === "Today's Appointments") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          q = query(
            collectionRef,
            where("date", ">=", today),
            where("date", "<", tomorrow)
          );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
          stats.value[index].value = snapshot.size;

          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          getDocs(
            query(collectionRef, where("createdAt", ">=", lastMonth))
          ).then((lastMonthSnapshot) => {
            const change =
              ((snapshot.size - lastMonthSnapshot.size) /
                Math.max(lastMonthSnapshot.size, 1)) *
              100;
            stats.value[index].trend = isNaN(change) ? 0 : change;
          });
        });

        unsubscribes.push(unsubscribe);
      });
    }

    // Load all charts in parallel
    function loadAllCharts() {
      Promise.all([
        fetchMedicationByCoursesData(),
        fetchMedicationUsageData(),
        fetchAppointmentData(),
      ]);
    }

    onMounted(() => {
      setupRealTimeStatsListeners();
      loadAllCharts();
    });

    onBeforeUnmount(() => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    });

    // Only reload the Course Medication chart when the academic year changes
    watch(selectedAcademicYear, () => {
      fetchMedicationByCoursesData();
    });

    return {
      stats,
      loadingMedicationChart,
      loadingAppointmentChart,
      loadingGenderChart,
      loadingTopMedChart,
      selectedAcademicYear,
      academicYearOptions,
      medicationChartOptions,
      medicationChartSeries,
      appointmentChartOptions,
      appointmentChartSeries,
      medicationByGenderOptions,
      medicationByGenderSeries,
      topMedicationsOptions,
      topMedicationsSeries,
      downloadCSVReport,
    };
  },
};
</script>

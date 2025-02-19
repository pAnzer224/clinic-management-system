<template>
  <main class="flex-1 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Health Alerts</h1>
      <button
        @click="showAddAlertModal"
        class="bg-blue1 text-white px-4 py-2 rounded-full"
      >
        Create Alert
      </button>
    </div>

    <!-- Alerts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Active Alerts -->
      <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-satoshi-medium">Active Alerts</h2>
          <div class="flex gap-2">
            <input
              type="search"
              v-model="searchQuery"
              placeholder="Search alerts..."
              class="px-4 py-2 rounded-full bg-graytint/40 border border-text/20 text-sm"
            />
            <Dropdown
              v-model="filterPriority"
              :options="priorityOptions"
              class="w-40"
            />
          </div>
        </div>

        <div v-if="loading" class="flex justify-center items-center py-8">
          <intersecting-circles-spinner
            :animation-duration="1200"
            :size="70"
            color="#3f73ce"
          />
        </div>

        <div v-else-if="filteredAlerts.length === 0" class="text-center py-8">
          <p class="text-gray-500">No active alerts found</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="alert in filteredAlerts"
            :key="alert.id"
            class="p-4 rounded-xl border"
            :class="{
              'border-red-200 bg-red-50': alert.priority === 'High',
              'border-yellow-200 bg-yellow-50': alert.priority === 'Medium',
              'border-blue-200 bg-blue-50': alert.priority === 'Low',
            }"
          >
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-satoshi-medium">{{ alert.title }}</h3>
                  <span
                    class="px-2 py-1 rounded-full text-xs"
                    :class="{
                      'bg-red-200 text-red-800': alert.priority === 'High',
                      'bg-yellow-200 text-yellow-800':
                        alert.priority === 'Medium',
                      'bg-blue-200 text-blue-800': alert.priority === 'Low',
                    }"
                  >
                    {{ alert.priority }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mt-1">
                  {{ alert.description }}
                </p>
                <div class="flex gap-4 mt-2 text-sm text-gray-500">
                  <span>{{ formatDate(alert.date) }}</span>
                  <span>•</span>
                  <span>By {{ alert.createdBy?.name || "System" }}</span>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="editAlert(alert)"
                  class="text-blue1 hover:text-blue-700"
                >
                  <PencilIcon class="h-4 w-4" />
                </button>
                <button
                  @click="deleteAlert(alert)"
                  class="text-red-600 hover:text-red-700"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alert Statistics -->
      <div class="bg-white rounded-2xl p-6 shadow-sm space-y-6">
        <h2 class="text-lg font-satoshi-medium">Alert Statistics</h2>

        <!-- Priority Distribution -->
        <div>
          <h3 class="text-sm text-gray-500 mb-2">Priority Distribution</h3>
          <div class="space-y-2">
            <div v-for="priority in priorityStats" :key="priority.label">
              <div class="flex justify-between text-sm mb-1">
                <span>{{ priority.label }}</span>
                <span>{{ priority.count }}</span>
              </div>
              <div class="h-2 rounded-full bg-gray-100">
                <div
                  class="h-full rounded-full"
                  :class="{
                    'bg-red-500': priority.label === 'High',
                    'bg-yellow-500': priority.label === 'Medium',
                    'bg-blue-500': priority.label === 'Low',
                  }"
                  :style="{ width: `${priority.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Trend -->
        <div>
          <h3 class="text-sm text-gray-500 mb-4">Monthly Alert Trend</h3>
          <div class="h-40">
            <apexchart
              type="line"
              :options="chartOptions"
              :series="chartSeries"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Alert Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-2xl p-8 shadow-lg w-[500px]">
        <h2 class="text-xl font-satoshi-bold mb-6">
          {{ isEditing ? "Edit Alert" : "Create Alert" }}
        </h2>
        <form @submit.prevent="submitAlert" class="space-y-4">
          <div>
            <label class="block mb-1">Title</label>
            <input
              v-model="alertForm.title"
              type="text"
              required
              class="w-full px-4 py-2 rounded-lg bg-graytint"
            />
          </div>
          <div>
            <label class="block mb-1">Description</label>
            <textarea
              v-model="alertForm.description"
              required
              class="w-full px-4 py-2 rounded-lg bg-graytint min-h-[100px]"
            ></textarea>
          </div>
          <div>
            <label class="block mb-1">Priority</label>
            <Dropdown
              v-model="alertForm.priority"
              :options="priorityOptions"
              required
            />
          </div>
          <div>
            <label class="block mb-1">Date</label>
            <input
              v-model="alertForm.date"
              type="date"
              required
              class="w-full px-4 py-2 rounded-lg bg-graytint"
            />
          </div>
          <div class="flex justify-end gap-4 mt-6">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue1 text-white rounded-full hover:bg-blue-700"
            >
              {{ isEditing ? "Update" : "Create" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";
import VueApexCharts from "vue3-apexcharts";
import { IntersectingCirclesSpinner } from "epic-spinners";
import Dropdown from "@/components/Dropdown.vue";
import { useCRUD } from "@/utils/firebaseCRUD";
import { serverTimestamp } from "firebase/firestore";
import { logActivity } from "@/utils/activity-logger";

export default {
  name: "Alerts",
  components: {
    apexchart: VueApexCharts,
    PencilIcon,
    TrashIcon,
    IntersectingCirclesSpinner,
    Dropdown,
  },
  setup() {
    const {
      items: alerts,
      loading,
      error,
      listenToChanges,
      addItem,
      updateItem,
      deleteItem,
    } = useCRUD("healthAlerts");

    const searchQuery = ref("");
    const filterPriority = ref("");
    const showModal = ref(false);
    const isEditing = ref(false);
    const currentUser = ref(
      JSON.parse(localStorage.getItem("currentUser")) || {}
    );

    const initialAlertForm = {
      id: "",
      title: "",
      description: "",
      priority: "Medium",
      date: new Date().toISOString().split("T")[0],
      createdBy: currentUser.value,
    };

    const alertForm = ref({ ...initialAlertForm });

    const priorityOptions = [
      { value: "", label: "All Priorities" },
      { value: "High", label: "High" },
      { value: "Medium", label: "Medium" },
      { value: "Low", label: "Low" },
    ];

    const filteredAlerts = computed(() => {
      return alerts.value.filter((alert) => {
        const matchesSearch =
          !searchQuery.value ||
          alert.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          alert.description
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase());
        const matchesPriority =
          !filterPriority.value || alert.priority === filterPriority.value;
        return matchesSearch && matchesPriority;
      });
    });

    const priorityStats = computed(() => {
      const total = alerts.value.length;
      const counts = {
        High: alerts.value.filter((a) => a.priority === "High").length,
        Medium: alerts.value.filter((a) => a.priority === "Medium").length,
        Low: alerts.value.filter((a) => a.priority === "Low").length,
      };

      return Object.entries(counts).map(([label, count]) => ({
        label,
        count,
        percentage: total ? (count / total) * 100 : 0,
      }));
    });

    const chartOptions = {
      chart: {
        type: "line",
        toolbar: { show: false },
        height: 160,
      },
      stroke: { curve: "smooth", width: 2 },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      },
      yaxis: {
        show: false,
      },
      colors: ["#3B82F6"],
    };

    const chartSeries = ref([
      {
        name: "Alerts",
        data: [30, 40, 35, 50, 49, 60],
      },
    ]);

    function formatDate(date) {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    function showAddAlertModal() {
      isEditing.value = false;
      alertForm.value = { ...initialAlertForm, id: Date.now().toString() };
      showModal.value = true;
    }

    function editAlert(alert) {
      isEditing.value = true;
      alertForm.value = { ...alert };
      showModal.value = true;
    }

    async function deleteAlert(alert) {
      if (confirm("Are you sure you want to delete this alert?")) {
        try {
          await deleteItem(alert.id);
          await logActivity({
            type: "alert",
            action: "delete",
            title: "Alert Deleted",
            description: `Deleted alert: ${alert.title}`,
            timestamp: serverTimestamp(),
            performedBy: currentUser.value,
          });
        } catch (error) {
          console.error("Error deleting alert:", error);
        }
      }
    }

    async function submitAlert() {
      try {
        const alertData = {
          ...alertForm.value,
          updatedAt: serverTimestamp(),
        };

        if (!isEditing.value) {
          alertData.createdAt = serverTimestamp();
          await addItem(alertData);
        } else {
          await updateItem(alertData);
        }

        await logActivity({
          type: "alert",
          action: isEditing.value ? "update" : "create",
          title: isEditing.value ? "Alert Updated" : "New Alert Created",
          description: isEditing.value
            ? `Updated alert: ${alertData.title}`
            : `Created new alert: ${alertData.title}`,
          timestamp: serverTimestamp(),
          performedBy: currentUser.value,
        });

        showModal.value = false;
      } catch (error) {
        console.error("Error saving alert:", error);
      }
    }

    onMounted(() => {
      listenToChanges();
    });

    return {
      alerts,
      loading,
      error,
      searchQuery,
      filterPriority,
      showModal,
      isEditing,
      alertForm,
      priorityOptions,
      filteredAlerts,
      priorityStats,
      chartOptions,
      chartSeries,
      formatDate,
      showAddAlertModal,
      editAlert,
      deleteAlert,
      submitAlert,
    };
  },
};
</script>

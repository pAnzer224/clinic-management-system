<template>
  <main class="h-full space-y-6">
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

    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-2">
        <!-- Active Alerts Grid -->
        <div
          class="bg-white rounded-2xl shadow-sm h-[calc(92vh-8rem)] flex flex-col"
        >
          <div class="sticky top-0 p-6 bg-white rounded-t-2xl z-10">
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-satoshi-medium">Active Alerts</h2>
              <div class="flex gap-2">
                <div class="relative">
                  <Search
                    class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  />
                  <input
                    type="search"
                    v-model="searchQuery"
                    placeholder="Search alerts..."
                    class="pl-10 px-4 py-2 rounded-full bg-graytint/40 border border-text/20 text-sm"
                  />
                </div>
                <Dropdown
                  v-model="filterPriority"
                  :options="priorityOptions"
                  class="w-40"
                />
              </div>
            </div>
          </div>

          <div class="px-6 pb-4 flex-1 overflow-y-scroll no-scrollbar">
            <div v-if="loading" class="flex justify-center items-center py-8">
              <Loader2 class="h-10 w-10 text-blue1 animate-spin" />
            </div>

            <div
              v-else-if="filteredAlerts.length === 0"
              class="text-center py-8"
            >
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
                      <span
                        v-if="!alert.isRead"
                        class="px-2 py-1 rounded-full text-xs bg-blue-200 text-blue-800"
                      >
                        New
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ alert.description }}
                    </p>
                    <div class="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>{{ formatDate(alert.date) }}</span>
                      <span>•</span>
                      <span
                        >by
                        {{
                          currentUser.staffId &&
                          alert.createdBy?.role === "admin"
                            ? "Admin"
                            : alert.createdBy?.name || "Unknown User"
                        }}{{
                          !currentUser.staffId ||
                          alert.createdBy?.role !== "admin"
                            ? ` (${alert.createdBy?.role || "Unknown"})`
                            : ""
                        }}</span
                      >
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button
                      v-if="!alert.isRead"
                      @click="markAsRead(alert)"
                      class="text-green-600 hover:text-green-800"
                      title="Mark as read"
                    >
                      <CheckCircle class="size-4" />
                    </button>
                    <button
                      @click="editAlert(alert)"
                      class="text-blue1 hover:text-blue-700"
                    >
                      <Pencil class="h-4 w-4" />
                    </button>
                    <button
                      @click="deleteAlert(alert)"
                      class="text-red-600 hover:text-red-700"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl shadow-sm h-[calc(92vh-8rem)] flex flex-col"
      >
        <div class="sticky top-0 p-6 bg-white rounded-t-2xl z-10">
          <h2 class="text-lg font-satoshi-medium">Alert Analytics</h2>
        </div>

        <div class="px-6 pb-4 flex-1 overflow-y-auto space-y-6">
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

          <!-- Unread Alerts Summary -->
          <div>
            <h3 class="text-sm text-gray-500 mb-4">Unread Alerts</h3>
            <div v-if="unreadAlerts.length === 0" class="text-center py-4">
              <p class="text-gray-500 text-sm">No unread alerts</p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="alert in unreadAlerts"
                :key="alert.id"
                class="p-3 rounded-lg border border-blue-100 bg-blue-50 flex items-center justify-between"
              >
                <div>
                  <p class="text-sm font-medium text-text">{{ alert.title }}</p>
                  <div class="flex items-center gap-1 text-xs text-gray-500">
                    <span>{{ formatDate(alert.date) }}</span>
                    <span
                      class="px-1.5 py-0.5 rounded-full text-xs"
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
                </div>
                <button
                  @click="markAsRead(alert)"
                  class="text-green-600 hover:text-green-800 p-1"
                  title="Mark as read"
                >
                  <CheckCircle class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Follow-up Reminders -->
          <div>
            <h3 class="text-sm text-gray-500 mb-4">Follow-up Reminders</h3>
            <div v-if="followUpReminders.length === 0" class="text-center py-6">
              <p class="text-gray-500 text-sm">No follow-ups scheduled</p>
            </div>
            <div v-else>
              <div class="relative overflow-hidden">
                <div
                  class="reminder-slider"
                  :style="{
                    transform: `translateX(-${currentReminderIndex * 100}%)`,
                  }"
                >
                  <div
                    v-for="reminder in followUpReminders"
                    :key="reminder.id"
                    class="p-3 rounded-lg border border-blue-100 bg-blue-50 w-full flex-shrink-0"
                  >
                    <div class="flex gap-2 items-center">
                      <Calendar class="h-4 w-4 text-blue-600" />
                      <p class="text-sm font-medium text-text">
                        {{ reminder.studentName }}
                      </p>
                    </div>
                    <p class="text-xs text-gray-600 mt-1">
                      Follow-up on {{ formatDate(reminder.followUpDate) }}
                    </p>
                    <p class="text-xs text-gray-600 mt-1">
                      {{ reminder.reason }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex justify-center items-center gap-4 mt-4">
                <button
                  @click="prevReminder"
                  class="hover:bg-blue3/60 rounded-full p-2 disabled:opacity-50"
                  :disabled="currentReminderIndex === 0"
                >
                  <ChevronLeft class="h-5 w-5 text-text" />
                </button>
                <span class="text-sm text-text/60">
                  {{ currentReminderIndex + 1 }} /
                  {{ followUpReminders.length }}
                </span>
                <button
                  @click="nextReminder"
                  class="hover:bg-blue3/60 rounded-full p-2 shadow-sm disabled:opacity-50"
                  :disabled="
                    currentReminderIndex >= followUpReminders.length - 1
                  "
                >
                  <ChevronRight class="h-5 w-5 text-text" />
                </button>
              </div>
            </div>
          </div>

          <!-- Patient Count by Diagnosis -->
          <div>
            <h3 class="text-sm text-gray-500 mb-4">Common Diagnoses</h3>
            <div class="h-60">
              <apexchart
                type="bar"
                :options="diagnosisChartOptions"
                :series="diagnosisChartSeries"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex justify-center items-center z-50"
    >
      <div class="fixed inset-0 bg-black/50" @click="showModal = false"></div>
      <div
        class="relative bg-white rounded-2xl p-8 shadow-lg w-[500px]"
        @click.stop
      >
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
              :options="alertPriorityOptions"
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
import {
  Search,
  Pencil,
  Trash2,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-vue-next";
import VueApexCharts from "vue3-apexcharts";
import Dropdown from "@/components/Dropdown.vue";
import { useAlertsLogic } from "@/composables/alertsManagement";
import { ref, onMounted } from "vue";

export default {
  name: "Alerts",
  components: {
    apexchart: VueApexCharts,
    Search,
    Pencil,
    Trash2,
    Calendar,
    Loader2,
    Dropdown,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
  },
  setup() {
    const currentUser = ref(null);

    onMounted(() => {
      const storedUser = localStorage.getItem("currentUser");
      currentUser.value = storedUser ? JSON.parse(storedUser) : {};
    });

    return {
      currentUser,
      ...useAlertsLogic(),
    };
  },
};
</script>

<style>
.reminder-slider {
  display: flex;
  transition: transform 0.3s ease;
}

.reminder-slider > div {
  width: 100%;
  flex-shrink: 0;
}
</style>

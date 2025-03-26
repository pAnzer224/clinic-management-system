<template>
  <main class="flex-1 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Activity History</h1>
      <router-link
        to="/overview"
        class="group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-blue1 px-4 py-2 font-medium text-white transition hover:scale-110 top-[0.1px] right-[7.2px]"
      >
        <span
          class="flex items-center text-[12px] tracking-wide font-satoshi-regular"
        >
          Back to Dashboard
          <ArrowLeftIcon class="size-3 ml-1" />
        </span>
      </router-link>
    </div>

    <!-- Activity History -->
    <div class="bg-white p-6 rounded-2xl shadow-sm">
      <!-- Filters -->
      <div
        class="flex justify-between mb-4 items-center sticky top-0 bg-white z-10 pb-4"
      >
        <h2 class="text-lg font-satoshi-medium">All Activities</h2>
        <div class="flex gap-4 items-center">
          <div>
            <Dropdown
              v-model="activityTypeFilter"
              :options="activityTypeOptions"
              placeholder="All Types"
              class="text-sm w-32"
            />
          </div>
        </div>
        <div
          class="absolute bottom-0 left-0 right-0 border-t border-graytint"
        ></div>
      </div>

      <!-- Activities List -->
      <div class="max-h-[600px] overflow-y-auto">
        <div
          v-for="(activity, index) in filteredActivities"
          :key="activity.id"
          class="flex items-start gap-4 p-4"
          :class="{
            'border-b border-gray-200': index !== filteredActivities.length - 1,
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
              <span>{{ formatDateTime(activity.timestamp) }}</span>
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
            @click.prevent="deleteActivity(activity.id)"
            class="text-red-500 hover:text-red-700 p-2 hover:bg-red-100 rounded-full"
          >
            <Trash2 class="h-5 w-5" />
          </button>
        </div>
        <div
          v-if="filteredActivities.length === 0"
          class="text-center text-gray-500 py-4"
        >
          No activities found
        </div>
      </div>
    </div>
  </main>

  <!-- Using Pagination Component -->
  <Pagination
    v-if="activities.length > itemsPerPage"
    v-model="currentPage"
    :total-pages="totalPages"
  />
</template>

<script>
import { ref, onMounted, computed, watch } from "vue";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import {
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  ActivityIcon,
  TrashIcon,
  Trash2,
  UserPlusIcon,
  PencilIcon,
  PillIcon,
  ClipboardIcon,
  ArrowLeftIcon,
} from "lucide-vue-next";
import Dropdown from "@/components/Dropdown.vue";
import Pagination from "@/components/Pagination.vue";

export default {
  name: "ActivityHistory",
  components: {
    UsersIcon,
    CalendarIcon,
    FileTextIcon,
    ActivityIcon,
    TrashIcon,
    Trash2,
    UserPlusIcon,
    PencilIcon,
    PillIcon,
    ClipboardIcon,
    ArrowLeftIcon,
    Dropdown,
    Pagination,
  },
  setup() {
    const currentUser = ref(
      JSON.parse(localStorage.getItem("currentUser")) || {}
    );
    const activities = ref([]);
    const activityTypeFilter = ref("all");
    const currentPage = ref(1);
    const itemsPerPage = ref(15);

    const activityTypeOptions = ref([
      { value: "all", label: "All Types" },
      { value: "student", label: "Student" },
      { value: "record", label: "Record" },
      { value: "appointment", label: "Appointment" },
      { value: "medication", label: "Medication" },
    ]);

    const filteredActivities = computed(() => {
      let filtered = activities.value;

      // Apply type filter
      if (activityTypeFilter.value !== "all") {
        filtered = filtered.filter(
          (activity) => activity.type === activityTypeFilter.value
        );
      }

      // Apply pagination
      const startIndex = (currentPage.value - 1) * itemsPerPage.value;
      const endIndex = startIndex + itemsPerPage.value;

      return filtered.slice(startIndex, endIndex);
    });

    const totalPages = computed(() => {
      let filtered = activities.value;
      if (activityTypeFilter.value !== "all") {
        filtered = filtered.filter(
          (activity) => activity.type === activityTypeFilter.value
        );
      }
      return Math.ceil(filtered.length / itemsPerPage.value) || 1;
    });

    // Reset to page 1 when filter changes
    watch(activityTypeFilter, () => {
      currentPage.value = 1;
    });

    const fetchAllActivities = () => {
      const activitiesQuery = query(
        collection(db, "activities"),
        orderBy("timestamp", "desc")
      );

      onSnapshot(activitiesQuery, (snapshot) => {
        activities.value = snapshot.docs.map((doc) => ({
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
      if (type === "medication") return PillIcon;
      return ActivityIcon;
    };

    const formatDateTime = (timestamp) => {
      if (!timestamp) return "";

      return new Date(timestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    onMounted(() => {
      fetchAllActivities();
    });

    return {
      activities,
      activityTypeFilter,
      activityTypeOptions,
      currentPage,
      filteredActivities,
      totalPages,
      itemsPerPage,
      formatDateTime,
      getActivityIcon,
      currentUser,
      deleteActivity,
    };
  },
};
</script>

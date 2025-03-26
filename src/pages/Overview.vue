<template>
  <main class="flex-1 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Dashboard Overview</h1>
      <router-link
        to="/analytics"
        class="group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-blue1 px-4 py-2 font-medium text-white transition hover:scale-110 top-[0.1px] right-[7.2px]"
      >
        <span
          class="flex items-center text-[12px] tracking-wide font-satoshi-regular"
        >
          View Analytics
          <ArrowRightIcon class="size-3 ml-1" />
        </span>
        <div
          class="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]"
        >
          <div class="relative h-full w-8 bg-white/20"></div>
        </div>
      </router-link>
    </div>

    <!-- Quick Action Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <router-link
        v-for="action in quickActions"
        :key="action.title"
        :to="action.route"
        class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden relative group"
      >
        <!-- Background gradient with animation -->
        <div
          class="absolute inset-0 bg-gradient-to-tr from-blue1/5 to-blue3/10 opacity-50 group-hover:opacity-100 group-hover:bg-gradient-to-tr group-hover:from-blue1/40 group-hover:to-blue3/30 transition-opacity duration-300"
        ></div>

        <!-- Card content -->
        <div class="relative z-10 p-6">
          <div class="flex flex-col items-start">
            <div class="mb-4 bg-blue1/10 p-3 rounded-full">
              <component :is="action.icon" class="h-6 w-6 text-blue1" />
            </div>
            <h3 class="text-lg font-satoshi-bold text-text mb-1">
              {{ action.title }}
            </h3>
            <p class="text-sm text-gray-600 mb-4">{{ action.description }}</p>
            <div
              class="text-blue1 text-sm font-medium flex items-center mt-auto"
            >
              View
              <ArrowRightIcon class="h-4 w-4 ml-1" />
            </div>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Course Information -->
    <CourseAccordion :selectedAcademicYear="selectedAcademicYear" />

    <!-- Recent Activity -->
    <div class="bg-white p-6 rounded-2xl shadow-sm">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-satoshi-medium">Recent Activity</h2>
        <router-link
          to="/overview/activities"
          class="text-blue1/80 hover:text-blue1 text-sm font-medium flex items-center"
        >
          View All
        </router-link>
      </div>
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
            @click.prevent="deleteActivity(activity.id)"
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
import { ref, onMounted, computed } from "vue";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
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
  ArrowRightIcon,
} from "lucide-vue-next";
import CourseAccordion from "@/components/CourseAccordion.vue";

export default {
  name: "Overview",
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
    ArrowRightIcon,
    CourseAccordion,
  },
  setup() {
    const currentUser = ref(
      JSON.parse(localStorage.getItem("currentUser")) || {}
    );
    const selectedAcademicYear = ref("All");

    //  quick action cards
    const quickActions = ref([
      {
        title: "Student Management",
        description:
          "Add, view, update, and manage student profiles and information",
        icon: UsersIcon,
        route: "/students",
      },
      {
        title: "Appointments",
        description: "Schedule and manage student healthcare appointments",
        icon: CalendarIcon,
        route: "/appointments",
      },
      {
        title: "Medication Inventory",
        description: "Monitor and manage medication stock and prescriptions",
        icon: PillIcon,
        route: "/medications",
      },
      {
        title: "Medical Records",
        description: "Access and update student health history and documents",
        icon: ClipboardIcon,
        route: "/records",
      },
    ]);

    const recentActivities = ref([]);
    const sortedActivities = computed(() => {
      return [...recentActivities.value].sort((a, b) => {
        return b.timestamp - a.timestamp;
      });
    });

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
      fetchRecentActivities();
    });

    return {
      quickActions,
      recentActivities,
      formatTimeAgo,
      getActivityIcon,
      currentUser,
      sortedActivities,
      deleteActivity,
      selectedAcademicYear,
    };
  },
};
</script>

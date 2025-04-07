<template>
  <div class="relative">
    <!-- Desktop/Tablet Sidebar -->
    <aside
      class="hidden sm:block sticky w-56 bg-graytint rounded-2xl shadow-sm h-[calc(99.9vh-8rem)] transition-all duration-300 ease-in-out"
      :class="{
        'lg:p-6 md:p-5 sm:p-4': true,
      }"
    >
      <div class="flex items-center mb-12 relative">
        <router-link
          to="/security"
          class="flex items-center gap-3 p-2 -ml-2 rounded-full group hover:bg-blue3/10 transition-all duration-200 flex-grow"
        >
          <div
            class="w-8 h-8 rounded-full bg-blue1/10 overflow-hidden flex-shrink-0"
          >
            <img
              v-if="currentUser.profileImage"
              :src="currentUser.profileImage"
              class="w-full h-full object-cover"
              alt="Profile"
            />
          </div>
          <span
            class="text-[13px] font-satoshi-medium text-text group-hover:text-blue1"
          >
            {{ getUserId }}
          </span>
          <span
            class="text-[10px] bg-blue1/10 text-blue1 px-2 py-1 rounded-full"
          >
            {{ currentUser.role }}
          </span>
        </router-link>

        <div class="relative ml-2" ref="menuContainer">
          <button
            @click="isMenuOpen = !isMenuOpen"
            class="text-text/70 rounded-full hover:bg-blue1/20 p-1"
          >
            <EllipsisVerticalIcon class="size-5" />
          </button>

          <div
            v-if="isMenuOpen"
            class="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg py-1 z-10"
          >
            <button
              @click="handleLogout"
              class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 font-medium flex items-center"
            >
              <ArrowRightOnRectangleIcon class="w-5 h-5 mr-2" />
              Log out
            </button>
          </div>
        </div>
      </div>

      <nav class="space-y-4">
        <router-link
          v-for="item in filteredNavigation"
          :key="item.path"
          :to="item.path"
          class="group w-full flex items-center gap-3 p-2 rounded-full text-md transition-colors font-satoshi-medium"
          :class="{
            'bg-blue1/10 text-blue1/80': $route.path === item.path,
            'text-text/60 hover:text-text': $route.path !== item.path,
          }"
        >
          <component
            v-if="item.name !== 'Appointments' && item.name !== 'Alerts'"
            :is="item.icon"
            class="size-6 text-blue2/80 group-hover:text-blue2 ml-2"
          />
          <svg
            v-else-if="item.name === 'Appointments'"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="size-6 text-blue2/80 group-hover:text-blue2 ml-2"
          >
            <path
              d="M7.7501 2.5C7.7501 2.30109 7.67108 2.11032 7.53043 1.96967C7.38978 1.82902 7.19901 1.75 7.0001 1.75C6.80119 1.75 6.61042 1.82902 6.46977 1.96967C6.32912 2.11032 6.2501 2.30109 6.2501 2.5V4.08C4.8101 4.195 3.8661 4.477 3.1721 5.172C2.4771 5.866 2.1951 6.811 2.0791 8.25H21.9211C21.8051 6.81 21.5231 5.866 20.8281 5.172C20.1341 4.477 19.1891 4.195 17.7501 4.079V2.5C17.7501 2.30109 17.6711 2.11032 17.5304 1.96967C17.3898 1.82902 17.199 1.75 17.0001 1.75C16.8012 1.75 16.6104 1.82902 16.4698 1.96967C16.3291 2.11032 16.2501 2.30109 16.2501 2.5V4.013C15.5851 4 14.8391 4 14.0001 4H10.0001C9.1611 4 8.4151 4 7.7501 4.013V2.5Z"
              fill="currentColor"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M2 12C2 11.161 2 10.415 2.013 9.75H21.987C22 10.415 22 11.161 22 12V14C22 17.771 22 19.657 20.828 20.828C19.656 21.999 17.771 22 14 22H10C6.229 22 4.343 22 3.172 20.828C2.001 19.656 2 17.771 2 14V12ZM17 14C17.2652 14 17.5196 13.8946 17.7071 13.7071C17.8946 13.5196 18 13.2652 18 13C18 12.7348 17.8946 12.4804 17.7071 12.2929C17.5196 12.1054 17.2652 12 17 12C16.7348 12 16.4804 12.1054 16.2929 12.2929C16.1054 12.4804 16 12.7348 16 13C16 13.2652 16.1054 13.5196 16.2929 13.7071C16.4804 13.8946 16.7348 14 17 14ZM17 18C17.2652 18 17.5196 17.8946 17.7071 17.7071C17.8946 17.5196 18 17.2652 18 17C18 16.7348 17.8946 16.4804 17.7071 16.2929C17.5196 16.1054 17.2652 16 17 16C16.7348 16 16.4804 16.1054 16.2929 16.2929C16.1054 16.4804 16 16.7348 16 17C16 17.2652 16.1054 17.5196 16.2929 17.7071C16.4804 17.8946 16.7348 18 17 18ZM13 13C13 13.2652 12.8946 13.5196 12.7071 13.7071C12.5196 13.8946 12.2652 14 12 14C11.7348 14 11.4804 13.8946 11.2929 13.7071C11.1054 13.5196 11 13.2652 11 13C11 12.7348 11.1054 12.4804 11.2929 12.2929C11.4804 12.1054 11.7348 12 12 12C12.2652 12 12.5196 12.1054 12.7071 12.2929C12.8946 12.4804 13 12.7348 13 13ZM13 17C13 17.2652 12.8946 17.5196 12.7071 17.7071C12.5196 17.8946 12.2652 18 12 18C11.7348 18 11.4804 17.8946 11.2929 17.7071C11.1054 17.5196 11 17.2652 11 17C11 16.7348 11.1054 16.4804 11.2929 16.2929C11.4804 16.1054 11.7348 16 12 16C12.2652 16 12.5196 16.1054 12.7071 16.2929C12.8946 16.4804 13 16.7348 13 17ZM7 14C7.26522 14 7.51957 13.8946 7.70711 13.7071C7.89464 13.5196 8 13.2652 8 13C8 12.7348 7.89464 12.4804 7.70711 12.2929C7.51957 12.1054 7.26522 12 7 12C6.73478 12 6.48043 12.1054 6.29289 12.2929C6.10536 12.4804 6 12.7348 6 13C6 13.2652 6.10536 13.5196 6.29289 13.7071C6.48043 13.8946 6.73478 14 7 14ZM7 18C7.26522 18 7.51957 17.8946 7.70711 17.7071C7.89464 17.5196 8 17.2652 8 17C8 16.7348 7.89464 16.4804 7.70711 16.2929C7.51957 16.1054 7.26522 16 7 16C6.73478 16 6.48043 16.1054 6.29289 16.2929C6.10536 16.4804 6 16.7348 6 17C6 17.2652 6.10536 17.5196 6.29289 17.7071C6.48043 17.8946 6.73478 18 7 18Z"
              fill="currentColor"
            />
          </svg>
          <div v-else-if="item.name === 'Alerts'" class="relative ml-2">
            <BellIcon class="size-6 text-blue2/80 group-hover:text-blue2" />
            <span
              v-if="alertNotificationsCount > 0"
              class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 animate-pulse"
            >
              {{ alertNotificationsCount }}
            </span>
          </div>
          <span class="truncate">{{ item.name }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- Mobile Bottom Navigation Bar -->
    <nav
      class="sm:hidden fixed bottom-6 left-4 right-4 bg-white rounded-full shadow-lg z-50 transition-all duration-300 ease-in-out"
    >
      <div class="flex justify-between items-center px-6 py-4">
        <router-link
          v-for="item in filteredNavigation"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center relative pt-1"
          :class="{
            'text-blue1': $route.path === item.path,
            'text-text/60': $route.path !== item.path,
          }"
        >
          <component
            v-if="item.name !== 'Appointments' && item.name !== 'Alerts'"
            :is="item.icon"
            class="size-6"
            :class="{
              'text-blue1': $route.path === item.path,
              'text-text/60': $route.path !== item.path,
            }"
          />
          <svg
            v-else-if="item.name === 'Appointments'"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="size-6"
            :class="{
              'text-blue1': $route.path === item.path,
              'text-text/60': $route.path !== item.path,
            }"
          >
            <path
              d="M7.7501 2.5C7.7501 2.30109 7.67108 2.11032 7.53043 1.96967C7.38978 1.82902 7.19901 1.75 7.0001 1.75C6.80119 1.75 6.61042 1.82902 6.46977 1.96967C6.32912 2.11032 6.2501 2.30109 6.2501 2.5V4.08C4.8101 4.195 3.8661 4.477 3.1721 5.172C2.4771 5.866 2.1951 6.811 2.0791 8.25H21.9211C21.8051 6.81 21.5231 5.866 20.8281 5.172C20.1341 4.477 19.1891 4.195 17.7501 4.079V2.5C17.7501 2.30109 17.6711 2.11032 17.5304 1.96967C17.3898 1.82902 17.199 1.75 17.0001 1.75C16.8012 1.75 16.6104 1.82902 16.4698 1.96967C16.3291 2.11032 16.2501 2.30109 16.2501 2.5V4.013C15.5851 4 14.8391 4 14.0001 4H10.0001C9.1611 4 8.4151 4 7.7501 4.013V2.5Z"
              fill="currentColor"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M2 12C2 11.161 2 10.415 2.013 9.75H21.987C22 10.415 22 11.161 22 12V14C22 17.771 22 19.657 20.828 20.828C19.656 21.999 17.771 22 14 22H10C6.229 22 4.343 22 3.172 20.828C2.001 19.656 2 17.771 2 14V12ZM17 14C17.2652 14 17.5196 13.8946 17.7071 13.7071C17.8946 13.5196 18 13.2652 18 13C18 12.7348 17.8946 12.4804 17.7071 12.2929C17.5196 12.1054 17.2652 12 17 12C16.7348 12 16.4804 12.1054 16.2929 12.2929C16.1054 12.4804 16 12.7348 16 13C16 13.2652 16.1054 13.5196 16.2929 13.7071C16.4804 13.8946 16.7348 14 17 14ZM17 18C17.2652 18 17.5196 17.8946 17.7071 17.7071C17.8946 17.5196 18 17.2652 18 17C18 16.7348 17.8946 16.4804 17.7071 16.2929C17.5196 16.1054 17.2652 16 17 16C16.7348 16 16.4804 16.1054 16.2929 16.2929C16.1054 16.4804 16 16.7348 16 17C16 17.2652 16.1054 17.5196 16.2929 17.7071C16.4804 17.8946 16.7348 18 17 18ZM13 13C13 13.2652 12.8946 13.5196 12.7071 13.7071C12.5196 13.8946 12.2652 14 12 14C11.7348 14 11.4804 13.8946 11.2929 13.7071C11.1054 13.5196 11 13.2652 11 13C11 12.7348 11.1054 12.4804 11.2929 12.2929C11.4804 12.1054 11.7348 12 12 12C12.2652 12 12.5196 12.1054 12.7071 12.2929C12.8946 12.4804 13 12.7348 13 13ZM13 17C13 17.2652 12.8946 17.5196 12.7071 17.7071C12.5196 17.8946 12.2652 18 12 18C11.7348 18 11.4804 17.8946 11.2929 17.7071C11.1054 17.5196 11 17.2652 11 17C11 16.7348 11.1054 16.4804 11.2929 16.2929C11.4804 16.1054 11.7348 16 12 16C12.2652 16 12.5196 16.1054 12.7071 16.2929C12.8946 16.4804 13 16.7348 13 17ZM7 14C7.26522 14 7.51957 13.8946 7.70711 13.7071C7.89464 13.5196 8 13.2652 8 13C8 12.7348 7.89464 12.4804 7.70711 12.2929C7.51957 12.1054 7.26522 12 7 12C6.73478 12 6.48043 12.1054 6.29289 12.2929C6.10536 12.4804 6 12.7348 6 13C6 13.2652 6.10536 13.5196 6.29289 13.7071C6.48043 13.8946 6.73478 14 7 14ZM7 18C7.26522 18 7.51957 17.8946 7.70711 17.7071C7.89464 17.5196 8 17.2652 8 17C8 16.7348 7.89464 16.4804 7.70711 16.2929C7.51957 16.1054 7.26522 16 7 16C6.73478 16 6.48043 16.1054 6.29289 16.2929C6.10536 16.4804 6 16.7348 6 17C6 17.2652 6.10536 17.5196 6.29289 17.7071C6.48043 17.8946 6.73478 18 7 18Z"
              fill="currentColor"
            />
          </svg>
          <div v-else-if="item.name === 'Alerts'" class="relative">
            <BellIcon class="size-6" />
            <span
              v-if="alertNotificationsCount > 0"
              class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-pulse"
            >
              {{ alertNotificationsCount }}
            </span>
          </div>
          <span class="text-xs mt-1 hidden">{{ item.name }}</span>
        </router-link>
      </div>
    </nav>
    <audio ref="notificationSound" src="/notif-sound.mp3"></audio>
  </div>
</template>
<script>
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  BellIcon,
  ShieldCheckIcon,
  EllipsisVerticalIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/solid";
import { useRouter } from "vue-router";
import { ref, onMounted, computed, onBeforeUnmount, watch } from "vue";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

export default {
  name: "Sidebar",
  components: {
    HomeIcon,
    UsersIcon,
    DocumentTextIcon,
    BellIcon,
    ShieldCheckIcon,
    EllipsisVerticalIcon,
    ArrowRightOnRectangleIcon,
  },
  setup() {
    const router = useRouter();
    const isMenuOpen = ref(false);
    const currentUser = ref({});
    const menuContainer = ref(null);
    const alertNotificationsCount = ref(0);
    const previousAlertCount = ref(0);
    const notificationSound = ref(null);
    const systemAlerts = ref([]);
    const db = getFirestore();

    const handleClickOutside = (event) => {
      if (menuContainer.value && !menuContainer.value.contains(event.target)) {
        isMenuOpen.value = false;
      }
    };

    const setupAlertNotifications = () => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const alertsRef = collection(db, "healthAlerts");
      const unreadQuery = query(
        alertsRef,
        where("isRead", "==", false),
        where("priority", "in", ["High", "Medium"])
      );

      const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
        updateNotificationCount(snapshot.docs.length);
      });

      return unsubscribe;
    };

    const updateNotificationCount = (dbAlertsCount) => {
      previousAlertCount.value = alertNotificationsCount.value;

      // Get system alerts from localStorage
      const storedSystemAlerts = localStorage.getItem("systemAlerts");
      if (storedSystemAlerts) {
        systemAlerts.value = JSON.parse(storedSystemAlerts);
      }

      // Count high and medium priority system alerts
      const highPrioritySystemAlerts = systemAlerts.value.filter(
        (alert) => alert.priority === "High" || alert.priority === "Medium"
      ).length;

      // Total count is database alerts + system alerts
      alertNotificationsCount.value = dbAlertsCount + highPrioritySystemAlerts;

      // Play sound only when total count increases
      if (alertNotificationsCount.value > previousAlertCount.value) {
        playNotificationSound();
      }
    };

    const playNotificationSound = () => {
      const audio = new Audio("/notif-sound.mp3");
      audio.play().catch((error) => {
        console.warn("Unable to play notification sound:", error);
      });
    };

    // Watch for changes in system alerts in localStorage
    const watchSystemAlerts = () => {
      window.addEventListener("storage", (event) => {
        if (event.key === "systemAlerts") {
          const storedSystemAlerts = event.newValue
            ? JSON.parse(event.newValue)
            : [];
          systemAlerts.value = storedSystemAlerts;

          // Get current db alerts count
          const alertsRef = collection(db, "healthAlerts");
          const unreadQuery = query(
            alertsRef,
            where("isRead", "==", false),
            where("priority", "in", ["High", "Medium"])
          );

          onSnapshot(unreadQuery, (snapshot) => {
            updateNotificationCount(snapshot.docs.length);
          });
        }
      });
    };

    onMounted(() => {
      const userData = localStorage.getItem("currentUser");
      if (userData) {
        currentUser.value = JSON.parse(userData);
      }
      document.addEventListener("click", handleClickOutside);
      setupAlertNotifications();
      watchSystemAlerts();

      // Initial load of system alerts
      const storedSystemAlerts = localStorage.getItem("systemAlerts");
      if (storedSystemAlerts) {
        systemAlerts.value = JSON.parse(storedSystemAlerts);
      }
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleClickOutside);
    });

    const handleLogout = () => {
      localStorage.removeItem("currentUser");
      isMenuOpen.value = false;
      router.push("/login");
    };

    return {
      isMenuOpen,
      handleLogout,
      currentUser,
      menuContainer,
      alertNotificationsCount,
      notificationSound,
    };
  },
  methods: {
    onAlertClick() {
      // Any additional logic when alerts are clicked
    },
  },
  data() {
    return {
      navigation: [
        { name: "Overview", path: "/overview", icon: "HomeIcon" },
        { name: "Students", path: "/students", icon: "UsersIcon" },
        { name: "Appointments", path: "/appointments", icon: "CalendarIcon" },
        { name: "Records", path: "/records", icon: "DocumentTextIcon" },
        {
          name: "Alerts",
          path: "/alerts",
          icon: "BellIcon",
        },
        {
          name: "Security",
          path: "/security",
          icon: "ShieldCheckIcon",
          adminOnly: true,
        },
      ],
    };
  },
  computed: {
    filteredNavigation() {
      return this.navigation.filter((item) => {
        if (item.adminOnly) {
          return this.currentUser.role === "admin";
        }
        return true;
      });
    },
    getUserId() {
      if (this.currentUser.role === "admin") {
        return this.currentUser.adminId;
      } else if (this.currentUser.role === "staff") {
        return this.currentUser.staffId;
      }
      return "";
    },
  },
};
</script>

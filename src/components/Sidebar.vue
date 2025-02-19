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
            :is="item.icon"
            class="size-6 text-blue2/80 group-hover:text-blue2 ml-2"
          />
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
            :is="item.icon"
            class="size-6"
            :class="{
              'text-blue1': $route.path === item.path,
              'text-text/60': $route.path !== item.path,
            }"
          />
          <span class="text-xs mt-1 hidden">{{ item.name }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script>
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  BellIcon,
  ShieldCheckIcon,
  EllipsisVerticalIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/solid";
import { useRouter } from "vue-router";
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { ShieldCheck } from "lucide-vue-next";

export default {
  name: "Sidebar",
  components: {
    HomeIcon,
    UsersIcon,
    CalendarIcon,
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

    const handleClickOutside = (event) => {
      if (menuContainer.value && !menuContainer.value.contains(event.target)) {
        isMenuOpen.value = false;
      }
    };

    onMounted(() => {
      const userData = localStorage.getItem("currentUser");
      if (userData) {
        currentUser.value = JSON.parse(userData);
      }
      document.addEventListener("click", handleClickOutside);
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
    };
  },
  data() {
    return {
      navigation: [
        { name: "Overview", path: "/overview", icon: "HomeIcon" },
        { name: "Students", path: "/students", icon: "UsersIcon" },
        { name: "Appointments", path: "/appointments", icon: "CalendarIcon" },
        { name: "Records", path: "/records", icon: "DocumentTextIcon" },
        { name: "Alerts", path: "/alerts", icon: "BellIcon" },
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

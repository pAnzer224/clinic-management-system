<template>
  <aside
    class="sticky w-56 bg-graytint rounded-2xl p-6 shadow-sm h-[calc(99.9vh-8rem)]"
  >
    <div class="flex items-center gap-3 mb-12 relative">
      <div class="w-8 h-8 rounded-full bg-blue1/10 overflow-hidden">
        <img
          v-if="currentAdmin.profileImage"
          :src="currentAdmin.profileImage"
          class="w-full h-full object-cover"
          alt="Profile"
        />
      </div>
      <span class="text-md font-satoshi-medium text-text">{{
        currentAdmin.fullName
      }}</span>

      <div class="relative ml-auto">
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="text-text/60 hover:text-text p-1"
        >
          <EllipsisVerticalIcon class="size-6" />
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
        v-for="item in navigation"
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
        {{ item.name }}
      </router-link>
    </nav>
  </aside>
</template>

<script>
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  BellIcon,
  CogIcon,
  EllipsisVerticalIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/solid";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";

export default {
  name: "Sidebar",
  components: {
    HomeIcon,
    UsersIcon,
    CalendarIcon,
    DocumentTextIcon,
    BellIcon,
    CogIcon,
    EllipsisVerticalIcon,
    ArrowRightOnRectangleIcon,
  },
  setup() {
    const router = useRouter();
    const isMenuOpen = ref(false);
    const currentAdmin = ref({});

    onMounted(() => {
      const adminData = localStorage.getItem("currentAdmin");
      if (adminData) {
        currentAdmin.value = JSON.parse(adminData);
      }
    });

    const handleLogout = () => {
      localStorage.removeItem("currentAdmin");
      isMenuOpen.value = false;
      router.push("/login");
    };

    return {
      isMenuOpen,
      handleLogout,
      currentAdmin,
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
        { name: "Settings", path: "/settings", icon: "CogIcon" },
      ],
    };
  },
};
</script>

<template>
  <nav
    class="w-full bg-background border-b border-text/20 p-4 sm:p-6 lg:px-[140px] lg:py-4 sticky top-0 z-50"
  >
    <div class="max-w-screen-2xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2">
        <img
          src="../assets/images/logo.svg"
          alt="Logo"
          class="size-8 rounded-lg"
        />
        <router-link
          to="/overview"
          class="text-lg font-satoshi-medium"
          :class="{
            'text-text': $route.path === '/overview',
            'text-text/70 hover:text-text': $route.path !== '/overview',
          }"
        >
          Clinic Management System
        </router-link>
      </div>
      <div class="flex items-center gap-4 sm:gap-6">
        <!-- Date and Time Display -->
        <div class="relative group">
          <Clock
            class="size text-gray-400 hover:text-blue1 transition-colors cursor-pointer"
          />
          <div
            class="absolute z-10 bottom-[-40px] left-1/2 transform -translate-x-1/2 bg-gray-800/70 text-background text-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
          >
            {{ formattedDateTime }}
          </div>
        </div>

        <router-link
          to="/medications"
          class="hidden sm:block"
          :class="{
            'text-blue1 font-satoshi-medium': $route.path === '/medications',
            'text-gray-600 hover:text-gray-900': $route.path !== '/medications',
          }"
          >Medications</router-link
        >
        <router-link
          to="/sops"
          class="hidden sm:block"
          :class="{
            'text-blue1 font-satoshi-medium': $route.path === '/sops',
            'text-gray-600 hover:text-gray-900': $route.path !== '/sops',
          }"
          >SOPs</router-link
        >
        <router-link
          to="/Settings"
          class="hidden sm:block"
          :class="{
            'text-blue1 font-satoshi-medium ': $route.path === '/Settings',
            'text-gray-600 hover:text-gray-900': $route.path !== '/Settings',
          }"
          >Settings</router-link
        >
        <button @click="toggleMenu" class="sm:hidden">
          <Menu class="w-6 h-6" />
        </button>
      </div>
    </div>
    <div v-if="isMenuOpen" class="sm:hidden">
      <router-link
        to="/medications"
        class="block px-4 py-2"
        :class="{
          'text-blue1 font-satoshi-medium': $route.path === '/medications',
          'text-gray-600 hover:text-gray-900': $route.path !== '/medications',
        }"
        >Medications</router-link
      >
      <router-link
        to="/sops"
        class="block px-4 py-2"
        :class="{
          'text-blue1 font-satoshi-medium underli': $route.path === '/sops',
          'text-gray-600 hover:text-gray-900': $route.path !== '/sops',
        }"
        >SOPs</router-link
      >
      <router-link
        to="/settings"
        class="block px-4 py-2"
        :class="{
          'text-blue1 font-satoshi-medium': $route.path === '/settings',
          'text-gray-600 hover:text-gray-900': $route.path !== '/settings',
        }"
        >Settings</router-link
      >
    </div>
  </nav>
</template>

<script>
import { Clock, Menu } from "lucide-vue-next";

export default {
  name: "Header",
  components: {
    Clock,
    Menu,
  },
  data() {
    return {
      isMenuOpen: false,
      formattedDateTime: this.getCurrentDateTime(),
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    getCurrentDateTime() {
      const now = new Date();
      return now.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    },
  },
};
</script>

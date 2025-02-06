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
          class="text-lg font-satoshi-medium text-text/70 hover:text-text"
        >
          Clinic Management System
        </router-link>
      </div>
      <div class="flex items-center gap-4 sm:gap-6">
        <router-link
          to="/medications"
          class="text-gray-600 hover:text-gray-900 hidden sm:block"
          >Medications</router-link
        >
        <router-link
          to="/sops"
          class="text-gray-600 hover:text-gray-900 hidden sm:block"
          >SOPs</router-link
        >
        <router-link
          to="/analytics"
          class="text-gray-600 hover:text-gray-900 hidden sm:block"
          >Analytics</router-link
        >
        <router-link
          to="/security"
          class="text-gray-600 hover:text-gray-900 hidden sm:block"
          >Security</router-link
        >
        <button @click="toggleMenu" class="sm:hidden">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
      </div>
    </div>
    <div v-if="isMenuOpen" class="sm:hidden">
      <router-link
        to="/medications"
        class="block px-4 py-2 text-gray-600 hover:text-gray-900"
        >Medications</router-link
      >
      <router-link
        to="/sops"
        class="block px-4 py-2 text-gray-600 hover:text-gray-900"
        >SOPs</router-link
      >
      <router-link
        to="/analytics"
        class="block px-4 py-2 text-gray-600 hover:text-gray-900"
        >Analytics</router-link
      >
      <router-link
        to="/security"
        class="block px-4 py-2 text-gray-600 hover:text-gray-900"
        >Security</router-link
      >
    </div>
  </nav>
</template>

<script>
export default {
  name: "Header",
  data() {
    return {
      isMenuOpen: false,
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
  },
};
</script>

<template>
  <nav
    class="w-full bg-background border-b border-text/20 p-[140px] py-4 sticky top-0 z-50"
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
      <div class="flex items-center gap-6">
        <router-link to="/medications" class="text-gray-600 hover:text-gray-900"
          >Medications</router-link
        >
        <router-link to="/sops" class="text-gray-600 hover:text-gray-900"
          >SOPs</router-link
        >
        <router-link to="/analytics" class="text-gray-600 hover:text-gray-900"
          >Analytics</router-link
        >
        <router-link to="/security" class="text-gray-600 hover:text-gray-900"
          >Security</router-link
        >
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "Header",
};
</script>

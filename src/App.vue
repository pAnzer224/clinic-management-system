<template>
  <div class="min-h-screen bg-background font-satoshi">
    <template v-if="isAuthenticated && !isLoginPage">
      <div class="h-screen flex flex-col overflow-hidden">
        <Header />
        <div
          class="flex-1 flex overflow-hidden px-4 sm:px-6 lg:px-[140px] py-8"
        >
          <div class="flex gap-5 h-full w-full">
            <Sidebar />
            <div
              class="flex-1 overflow-y-scroll no-scrollbar router-view-container"
              :class="{ 'pb-20 sm:pb-0': isAuthenticated && !isLoginPage }"
            >
              <router-view></router-view>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <router-view></router-view>
    </template>
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import { computed, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "FloatingDashboard",
  components: {
    Header,
    Sidebar,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const isAuthenticated = ref(false);

    const isLoginPage = computed(() => {
      return route.path === "/login";
    });

    const checkAuth = () => {
      // Check for currentUser (from LoginPage.vue) instead of currentAdmin
      const user = localStorage.getItem("currentUser");
      isAuthenticated.value = !!user;
    };

    watch(isAuthenticated, (newValue) => {
      if (!newValue && !isLoginPage.value) {
        router.push("/login");
      }
    });

    // Check authentication whenever route changes
    watch(
      () => route.path,
      () => {
        checkAuth();
      }
    );

    onMounted(() => {
      checkAuth();

      // Redirect to overview if already authenticated and on login page
      if (isAuthenticated.value && isLoginPage.value) {
        router.push("/overview");
      }
    });

    return {
      isLoginPage,
      isAuthenticated,
    };
  },
};
</script>

<style>
.router-view-container {
  transition: padding-bottom 0.3s ease-in-out;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
@media (max-width: 640px) {
  .router-view-container {
    padding-bottom: 5rem !important;
  }
}
</style>

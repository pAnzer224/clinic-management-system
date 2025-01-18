<template>
  <div class="min-h-screen bg-background font-satoshi">
    <template v-if="isAuthenticated && !isLoginPage">
      <div class="h-screen flex flex-col overflow-hidden">
        <Header />
        <div class="flex-1 flex overflow-hidden px-[140px] py-8">
          <div class="flex gap-5 h-full w-full">
            <Sidebar />
            <div class="flex-1 overflow-y-auto">
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

    watch(isAuthenticated, (newValue) => {
      if (!newValue && !isLoginPage.value) {
        router.push("/login");
      }
    });

    watch(
      () => route.path,
      (newPath) => {
        if (newPath !== "/login" && !isAuthenticated.value) {
          router.push("/login");
        }
      }
    );

    onMounted(() => {
      const admin = localStorage.getItem("currentAdmin");
      isAuthenticated.value = !!admin;

      // Redirect to overview if authenticated and on login page
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

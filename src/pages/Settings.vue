<template>
  <main class="flex-1">
    <div class="sticky bg-background top-0 pt-6 pb-4 z-10">
      <h1 class="text-2xl font-satoshi-bold text-text mb-6">Settings</h1>

      <!-- Settings Tabs -->
      <div class="flex justify-center max-w-[14rem] m-auto">
        <div class="relative flex w-full p-1 bg-white rounded-full shadow-sm">
          <span
            class="absolute inset-0 m-1 pointer-events-none"
            aria-hidden="true"
          >
            <span
              class="absolute inset-0 w-1/2 bg-blue1 rounded-full shadow-sm transform transition-transform duration-150 ease-in-out"
              :class="
                activeTab === 'academic' ? 'translate-x-0' : 'translate-x-full'
              "
            ></span>
          </span>
          <button
            class="relative flex-1 text-sm font-medium h-8 rounded-full focus-visible:outline-none transition-colors duration-150 ease-in-out"
            :class="activeTab === 'academic' ? 'text-white' : 'text-slate-500'"
            @click="activeTab = 'academic'"
            :aria-pressed="activeTab === 'academic'"
          >
            Academic
          </button>
          <button
            class="relative flex-1 text-sm font-medium h-8 rounded-full focus-visible:outline-none transition-colors duration-150 ease-in-out"
            :class="activeTab === 'academic' ? 'text-slate-500' : 'text-white'"
            @click="activeTab = 'security'"
            :aria-pressed="activeTab === 'security'"
          >
            Security
          </button>
        </div>
      </div>
    </div>

    <div class="space-y-6 mt-6">
      <!-- Academic Settings Tab Content -->
      <AcademicSettings
        v-if="activeTab === 'academic'"
        ref="academicSettings"
      />

      <!-- Security Settings Tab Content -->
      <SecuritySettings
        v-if="activeTab === 'security'"
        ref="securitySettings"
      />

      <div class="flex justify-end">
        <button
          @click="saveSettings"
          class="bg-blue1 text-white px-6 py-2 rounded-full transition-opacity duration-200"
          :class="{ 'opacity-70': loading }"
          :disabled="loading"
        >
          {{ loading ? "Saving..." : "Save Settings" }}
        </button>
      </div>
    </div>

    <!-- Activity Toast -->
    <div
      v-if="showToast"
      class="fixed bottom-4 right-4 bg-blue1 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500"
      :class="{ 'opacity-100': showToast, 'opacity-0': !showToast }"
    >
      {{ toastMessage }}
    </div>
  </main>
</template>

<script>
import { logActivity } from "@/utils/activity-logger";
import { serverTimestamp } from "firebase/firestore";
import AcademicSettings from "./Settings subtabs/AcademicSettings.vue";
import SecuritySettings from "./Settings subtabs/SecuritySettings.vue";

export default {
  name: "Settings",
  components: {
    AcademicSettings,
    SecuritySettings,
  },
  data() {
    return {
      activeTab: "academic", // Default tab is Academic Years
      showToast: false,
      toastMessage: "",
      loading: false,
    };
  },
  async mounted() {
    this.setupSessionTimeout();
  },
  methods: {
    showNotification(message) {
      this.toastMessage = message;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    },
    async saveSettings() {
      this.loading = true;
      try {
        // Save child component settings
        if (this.activeTab === "academic") {
          await this.$refs.academicSettings.saveSettings();
        } else {
          await this.$refs.securitySettings.saveSettings();
          this.setupSessionTimeout();
        }

        // Log activity
        await logActivity({
          type: "settings",
          action: "update",
          title: `${
            this.activeTab === "academic" ? "Academic" : "Security"
          } Settings Updated`,
          description:
            this.activeTab === "academic"
              ? "Updated academic years and time slots settings"
              : "Updated security settings",
          timestamp: serverTimestamp(),
        });

        this.showNotification(
          `${
            this.activeTab === "academic" ? "Academic" : "Security"
          } settings saved successfully`
        );
      } catch (error) {
        console.error("Error saving settings:", error);
        this.showNotification("Error saving settings");
      } finally {
        this.loading = false;
      }
    },
    setupSessionTimeout() {
      // Get timeout settings from localStorage
      const savedSettings = localStorage.getItem("securitySettings");
      let sessionTimeout = 15; // default timeout

      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        sessionTimeout = settings.sessionTimeout || 15;
      }

      if (window.sessionTimeoutId) {
        clearTimeout(window.sessionTimeoutId);
      }

      const timeoutMs = sessionTimeout * 60 * 1000;
      let lastActivity = Date.now();

      const resetTimer = () => {
        lastActivity = Date.now();
      };

      ["mousedown", "keypress", "scroll", "touchstart"].forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
        window.addEventListener(eventName, resetTimer);
      });

      const checkInactivity = () => {
        const now = Date.now();
        const inactive = now - lastActivity;

        if (inactive >= timeoutMs) {
          localStorage.removeItem("currentUser");
          this.$router.push("/");
        } else {
          window.sessionTimeoutId = setTimeout(checkInactivity, 60000);
        }
      };

      window.sessionTimeoutId = setTimeout(checkInactivity, 60000);
    },
  },
  beforeUnmount() {
    // Clean up event listeners
    ["mousedown", "keypress", "scroll", "touchstart"].forEach((eventName) => {
      window.removeEventListener(eventName, this.resetTimer);
    });

    if (window.sessionTimeoutId) {
      clearTimeout(window.sessionTimeoutId);
    }
  },
};
</script>

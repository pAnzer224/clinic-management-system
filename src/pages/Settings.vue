<template>
  <main class="flex-1 space-y-6">
    <h1 class="text-2xl font-satoshi-bold text-text">Security</h1>
    <!-- Academic Years -->
    <div class="bg-white rounded-2xl p-8 shadow-sm">
      <h2 class="text-md font-satoshi-medium text-text mb-6">Academic Years</h2>
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <input
            v-model="newAcademicYear"
            placeholder="YYYY-YYYY"
            class="w-full px-4 py-2 rounded-full border bg-graytint"
            pattern="\d{4}-\d{4}"
          />
          <button
            @click="addAcademicYear"
            class="bg-blue1 text-white px-6 py-2 rounded-full"
          >
            Add
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="year in academicYears"
            :key="year"
            class="flex justify-between items-center p-3 bg-graytint/40 rounded-lg"
          >
            <span>{{ year }}</span>
            <button
              @click="removeAcademicYear(year)"
              class="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Account Lock -->
    <div class="bg-white rounded-2xl p-8 shadow-sm">
      <h2 class="text-md font-satoshi-medium text-text mb-6">Account Lock</h2>
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <p class="text-text/60">
            Lock account after multiple failed login attempts
          </p>
          <div class="relative flex items-center">
            <input
              type="checkbox"
              id="account-lock-toggle"
              v-model="accountLockEnabled"
              class="sr-only"
            />
            <label
              for="account-lock-toggle"
              class="block h-6 w-12 rounded-full cursor-pointer transition-colors duration-300 ease-in-out"
              :class="accountLockEnabled ? 'bg-blue1' : 'bg-gray-300'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ease-in-out transform"
                :class="accountLockEnabled ? 'translate-x-6' : ''"
              ></span>
            </label>
          </div>
        </div>
        <div v-if="accountLockEnabled">
          <label class="block text-text/60 mb-2">
            Maximum failed attempts before locking
          </label>
          <input
            v-model.number="maxFailedAttempts"
            type="number"
            min="1"
            max="10"
            class="w-full px-4 py-2 rounded-full border bg-graytint"
          />
        </div>
      </div>
    </div>

    <!-- Session Timeout -->
    <div class="bg-white rounded-2xl p-8 shadow-sm">
      <h2 class="text-md font-satoshi-medium text-text mb-6">
        Session Timeout
      </h2>
      <div class="space-y-4">
        <div>
          <label class="block text-text/60 mb-2"
            >Session Timeout (minutes)</label
          >
          <input
            v-model.number="sessionTimeout"
            type="number"
            min="1"
            max="240"
            class="w-full px-4 py-2 rounded-full border bg-graytint"
          />
        </div>
        <p class="text-sm text-text/60">
          Your session will automatically log out after
          {{ sessionTimeout }} minutes of inactivity
        </p>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        @click="saveSecuritySettings"
        class="bg-blue1 text-white px-6 py-2 rounded-full"
        :disabled="loading"
      >
        {{ loading ? "Saving..." : "Save Settings" }}
      </button>
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

export default {
  name: "Settings",
  data() {
    return {
      accountLockEnabled: false,
      maxFailedAttempts: 5,
      sessionTimeout: 15,
      showToast: false,
      toastMessage: "",
      academicYears: [],
      newAcademicYear: "",
      loading: false,
    };
  },
  mounted() {
    const savedSettings = localStorage.getItem("securitySettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.accountLockEnabled = settings.accountLockEnabled || false;
      this.maxFailedAttempts = settings.maxFailedAttempts || 5;
      this.sessionTimeout = settings.sessionTimeout || 15;
    }

    const savedYears = localStorage.getItem("academicYears");
    if (savedYears) {
      this.academicYears = JSON.parse(savedYears);
    } else {
      // Default years
      this.academicYears = ["2023-2024", "2024-2025", "2025-2026"];
      localStorage.setItem("academicYears", JSON.stringify(this.academicYears));
    }

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
    async saveSecuritySettings() {
      this.loading = true;
      try {
        const settings = {
          accountLockEnabled: this.accountLockEnabled,
          maxFailedAttempts: this.maxFailedAttempts,
          sessionTimeout: this.sessionTimeout,
        };

        localStorage.setItem("securitySettings", JSON.stringify(settings));
        localStorage.setItem(
          "academicYears",
          JSON.stringify(this.academicYears)
        );

        await logActivity({
          type: "settings",
          action: "update",
          title: "Security Settings Updated",
          description: `Updated security settings: Account Lock ${
            this.accountLockEnabled ? "enabled" : "disabled"
          }, Max Failed Attempts: ${this.maxFailedAttempts}, Session Timeout: ${
            this.sessionTimeout
          }min`,
          timestamp: serverTimestamp(),
        });

        this.setupSessionTimeout();
        this.showNotification("Security settings saved successfully");
      } catch (error) {
        console.error("Error saving settings:", error);
        this.showNotification("Error saving settings");
      } finally {
        this.loading = false;
      }
    },
    setupSessionTimeout() {
      if (window.sessionTimeoutId) {
        clearTimeout(window.sessionTimeoutId);
      }

      const timeoutMs = this.sessionTimeout * 60 * 1000;
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
    addAcademicYear() {
      if (!this.newAcademicYear.match(/^\d{4}-\d{4}$/)) {
        this.showNotification("Please use YYYY-YYYY format");
        return;
      }

      if (!this.academicYears.includes(this.newAcademicYear)) {
        this.academicYears.push(this.newAcademicYear);
        localStorage.setItem(
          "academicYears",
          JSON.stringify(this.academicYears)
        );
        this.newAcademicYear = "";
        this.showNotification("Academic year added");
      }
    },
    removeAcademicYear(year) {
      this.academicYears = this.academicYears.filter((y) => y !== year);
      localStorage.setItem("academicYears", JSON.stringify(this.academicYears));
      this.showNotification("Academic year removed");
    },
  },
  beforeUnmount() {
    ["mousedown", "keypress", "scroll", "touchstart"].forEach((eventName) => {
      window.removeEventListener(eventName, this.resetTimer);
    });

    if (window.sessionTimeoutId) {
      clearTimeout(window.sessionTimeoutId);
    }
  },
};
</script>

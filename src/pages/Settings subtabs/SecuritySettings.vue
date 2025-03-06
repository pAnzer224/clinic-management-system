<template>
  <div class="space-y-6">
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
  </div>
</template>

<script>
export default {
  name: "SecuritySettings",
  emits: ["notification"],
  data() {
    return {
      accountLockEnabled: false,
      maxFailedAttempts: 5,
      sessionTimeout: 15,
    };
  },
  mounted() {
    // Load security settings
    const savedSettings = localStorage.getItem("securitySettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.accountLockEnabled = settings.accountLockEnabled || false;
      this.maxFailedAttempts = settings.maxFailedAttempts || 5;
      this.sessionTimeout = settings.sessionTimeout || 15;
    }
  },
  methods: {
    async saveSettings() {
      try {
        // Save security settings
        const settings = {
          accountLockEnabled: this.accountLockEnabled,
          maxFailedAttempts: this.maxFailedAttempts,
          sessionTimeout: this.sessionTimeout,
        };
        localStorage.setItem("securitySettings", JSON.stringify(settings));

        return true;
      } catch (error) {
        console.error("Error saving security settings:", error);
        throw error;
      }
    },
  },
};
</script>

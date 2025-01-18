<template>
  <main class="flex-1 space-y-6">
    <h1 class="text-2xl font-satoshi-bold text-text">Security</h1>

    <!-- Two-factor Authentication -->
    <div class="bg-white rounded-2xl p-8 shadow-sm">
      <h2 class="text-md font-satoshi-medium text-text mb-6">
        Two-Factor Authentication
      </h2>
      <div class="flex justify-between items-center">
        <p class="text-text/60">
          Enable two-factor authentication for added security.
        </p>
        <button
          @click="toggleTwoFactor"
          class="bg-blue1 text-white px-4 py-2 rounded-full"
        >
          {{ twoFactorEnabled ? "Disable" : "Enable" }}
        </button>
      </div>
    </div>

    <!-- Account Lock -->
    <div class="bg-white rounded-2xl p-8 shadow-sm">
      <h2 class="text-md font-satoshi-medium text-text mb-6">Account Lock</h2>
      <div class="flex justify-between items-center">
        <p class="text-text/60">
          Lock your account after multiple failed login attempts.
        </p>
        <button
          @click="toggleAccountLock"
          class="bg-blue1 text-white px-4 py-2 rounded-full"
        >
          {{ accountLocked ? "Unlock Account" : "Lock Account" }}
        </button>
      </div>
    </div>

    <!-- Session Timeout -->
    <div class="bg-white rounded-2xl p-8 shadow-sm">
      <h2 class="text-md font-satoshi-medium text-text mb-6">
        Session Timeout
      </h2>
      <div class="space-y-4">
        <div>
          <label class="block text-text/60">Session Timeout (minutes)</label>
          <input
            v-model="sessionTimeout"
            type="number"
            min="1"
            class="w-full px-4 py-2 rounded-full border bg-graytint"
          />
        </div>
        <button
          @click="saveSecuritySettings"
          class="bg-blue1 text-white px-4 py-2 rounded-full"
        >
          Save Settings
        </button>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: "Security",
  data() {
    return {
      twoFactorEnabled: false,
      accountLocked: false,
      sessionTimeout: 15,
    };
  },
  methods: {
    toggleTwoFactor() {
      this.twoFactorEnabled = !this.twoFactorEnabled;
      console.log(this.twoFactorEnabled ? "2FA Enabled" : "2FA Disabled");
    },
    toggleAccountLock() {
      this.accountLocked = !this.accountLocked;
      console.log(this.accountLocked ? "Account Locked" : "Account Unlocked");
    },
    saveSecuritySettings() {
      console.log("Security settings saved", {
        twoFactorEnabled: this.twoFactorEnabled,
        accountLocked: this.accountLocked,
        sessionTimeout: this.sessionTimeout,
      });
    },
  },
};
</script>

<style scoped>
/* Add any custom styles if needed */
</style>

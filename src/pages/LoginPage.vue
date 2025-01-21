<template>
  <div
    class="min-h-screen flex items-center justify-center bg-background font-satoshi"
  >
    <div class="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md relative">
      <img
        src="@/assets/images/cpsulogo.png"
        alt="CPSU Logo"
        class="absolute -top-4 -left-4 h-16 w-auto"
      />
      <div class="text-center mb-10">
        <div class="flex items-center justify-center gap-3">
          <h1 class="text-2xl font-satoshi-bold text-text">Welcome Back</h1>
          <img
            src="@/assets/images/logo.svg"
            alt="CMS Logo"
            class="h-7 w-auto"
          />
        </div>
        <p class="text-text/60 mt-2">
          Log in to access the clinic management system
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="relative">
          <input
            id="fullName"
            v-model="fullName"
            type="text"
            class="peer h-14 w-full px-4 rounded-xl border border-gray-200 text-text placeholder-transparent focus:border-blue1 focus:ring-2 focus:ring-blue1/20 outline-none transition-colors"
            placeholder=" "
            required
          />
          <label
            for="fullName"
            class="absolute left-4 -top-2.5 text-sm text-text/70 transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-placeholder-shown:text-text/60 peer-placeholder-shown:top-4 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue1"
          >
            Full Name
          </label>
        </div>

        <div class="relative">
          <input
            id="email"
            v-model="email"
            type="email"
            class="peer h-14 w-full px-4 rounded-xl border border-gray-200 text-text placeholder-transparent focus:border-blue1 focus:ring-2 focus:ring-blue1/20 outline-none transition-colors"
            placeholder=" "
            required
          />
          <label
            for="email"
            class="absolute left-4 -top-2.5 text-sm text-text/70 transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-placeholder-shown:text-text/60 peer-placeholder-shown:top-4 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue1"
          >
            Email
          </label>
        </div>

        <div class="relative">
          <input
            id="password"
            v-model="password"
            type="password"
            class="peer h-14 w-full px-4 rounded-xl border border-gray-200 text-text placeholder-transparent focus:border-blue1 focus:ring-2 focus:ring-blue1/20 outline-none transition-colors"
            placeholder=" "
            required
          />
          <label
            for="password"
            class="absolute left-4 -top-2.5 text-sm text-text/70 transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-placeholder-shown:text-text/60 peer-placeholder-shown:top-4 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue1"
          >
            Password
          </label>
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          class="w-full bg-blue1 text-white py-3 rounded-xl hover:bg-blue1/90 transition-colors font-satoshi-medium disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading"
        >
          {{ isLoading ? "Logging in..." : "Log In" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { db } from "@/firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";

export default {
  name: "LoginPage",
  setup() {
    const router = useRouter();
    const email = ref("");
    const fullName = ref("");
    const password = ref("");
    const error = ref("");
    const isLoading = ref(false);

    const handleLogin = async () => {
      error.value = "";
      isLoading.value = true;

      try {
        const adminCollection = collection(db, "admins");
        const q = query(adminCollection, where("email", "==", email.value));
        const snapshot = await getDocs(q);

        const admin = snapshot.docs[0]?.data();

        if (
          admin &&
          admin.password === password.value &&
          admin.fullName === fullName.value
        ) {
          localStorage.setItem(
            "currentAdmin",
            JSON.stringify({
              ...admin,
              lastLogin: new Date(),
            })
          );
          router.push("/overview");
        } else {
          error.value = "Invalid credentials. Please try again.";
        }
      } catch (err) {
        error.value = "Login failed. Please try again later.";
        console.error(err);
      } finally {
        isLoading.value = false;
      }
    };

    return {
      email,
      fullName,
      password,
      handleLogin,
      error,
      isLoading,
    };
  },
};
</script>

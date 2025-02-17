<template>
  <div
    :class="[
      'min-h-screen flex items-center justify-center transition-colors duration-300',
      {
        'bg-[#0D1521]': selectedRole === 'admin',
        'bg-background': selectedRole === 'staff',
      },
    ]"
  >
    <div
      :class="[
        'p-10 rounded-2xl shadow-xl w-full max-w-md relative transition-colors duration-300',
        {
          'bg-text': selectedRole === 'admin',
          'bg-white': selectedRole === 'staff',
        },
      ]"
    >
      <img
        :src="
          selectedRole === 'admin'
            ? require('@/assets/images/cpsulogo-admin.png')
            : require('@/assets/images/cpsulogo-staff.png')
        "
        alt="CPSU Logo"
        class="absolute -top-10 -left-6 h-24 w-auto"
      />
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-3">
          <h1
            :class="[
              'text-2xl font-satoshi-bold transition-colors duration-300',
              {
                'text-white': selectedRole === 'admin',
                'text-text': selectedRole === 'staff',
              },
            ]"
          >
            Welcome Back
          </h1>
          <img
            src="@/assets/images/logo.svg"
            alt="CMS Logo"
            class="h-7 w-auto"
          />
        </div>
        <p
          :class="[
            'mt-2 transition-colors duration-300',
            {
              'text-white/60': selectedRole === 'admin',
              'text-text/60': selectedRole === 'staff',
            },
          ]"
        >
          Log in to access the clinic management system
        </p>
      </div>

      <!-- Role Selection Toggle -->
      <div class="flex justify-center max-w-[14rem] m-auto mb-8">
        <div class="relative flex w-full p-1 bg-gray-100 rounded-full">
          <span
            class="absolute inset-0 m-1 pointer-events-none"
            aria-hidden="true"
          >
            <span
              class="absolute inset-0 w-1/2 bg-blue1 rounded-full shadow-sm transition-transform duration-150 ease-in-out"
              :class="{
                'translate-x-0': selectedRole === 'admin',
                'translate-x-full': selectedRole === 'staff',
              }"
            ></span>
          </span>
          <button
            class="relative flex-1 text-sm font-ob h-8 rounded-full focus-visible:outline-none focus-visible:ring focus-visible:ring-blue1/20 transition-colors duration-150 ease-in-out"
            :class="{
              'text-white': selectedRole === 'admin',
              'text-text/60': selectedRole === 'staff',
            }"
            @click="selectedRole = 'admin'"
            :aria-pressed="selectedRole === 'admin'"
          >
            Admin
          </button>
          <button
            class="relative flex-1 text-sm font-medium h-8 rounded-full focus-visible:outline-none focus-visible:ring focus-visible:ring-blue1/20 transition-colors duration-150 ease-in-out"
            :class="{
              'text-text/60': selectedRole === 'admin',
              'text-white': selectedRole === 'staff',
            }"
            @click="selectedRole = 'staff'"
            :aria-pressed="selectedRole === 'staff'"
          >
            Staff
          </button>
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="relative">
          <input
            id="fullName"
            v-model="fullName"
            type="text"
            :class="[
              'peer h-14 w-full px-4 rounded-xl border placeholder-transparent focus:ring-2 focus:ring-blue1/20 outline-none transition-colors',
              {
                'border-gray-600 bg-text/80 focus:border-blue1 text-blue1':
                  selectedRole === 'admin',
                'border-gray-200 bg-white focus:border-blue1 text-text':
                  selectedRole === 'staff',
              },
            ]"
            placeholder=" "
            required
          />
          <label
            for="fullName"
            :class="[
              'absolute left-4 -top-2.5 text-sm transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue1',
              {
                'text-white/70 peer-placeholder-shown:text-white/60':
                  selectedRole === 'admin',
                'text-text/70 peer-placeholder-shown:text-text/60':
                  selectedRole === 'staff',
              },
            ]"
          >
            Full Name
          </label>
        </div>

        <div class="relative">
          <input
            id="email"
            v-model="email"
            type="email"
            :class="[
              'peer h-14 w-full px-4 rounded-xl border placeholder-transparent focus:ring-2 focus:ring-blue1/20 outline-none transition-colors',
              {
                'border-gray-600 bg-text/80 focus:border-blue1 text-blue1':
                  selectedRole === 'admin',
                'border-gray-200 bg-white focus:border-blue1 text-text':
                  selectedRole === 'staff',
              },
            ]"
            placeholder=" "
            required
          />
          <label
            for="email"
            :class="[
              'absolute left-4 -top-2.5 text-sm transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue1',
              {
                'text-white/70 peer-placeholder-shown:text-white/60':
                  selectedRole === 'admin',
                'text-text/70 peer-placeholder-shown:text-text/60':
                  selectedRole === 'staff',
              },
            ]"
          >
            Email
          </label>
        </div>

        <div class="relative">
          <input
            id="password"
            v-model="password"
            type="password"
            :class="[
              'peer h-14 w-full px-4 rounded-xl border placeholder-transparent focus:ring-2 focus:ring-blue1/20 outline-none transition-colors',
              {
                'border-gray-600 bg-text/80 focus:border-blue1 text-blue1':
                  selectedRole === 'admin',
                'border-gray-200 bg-white focus:border-blue1 text-text':
                  selectedRole === 'staff',
              },
            ]"
            placeholder=" "
            required
          />
          <label
            for="password"
            :class="[
              'absolute left-4 -top-2.5 text-sm transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-5 peer-focus:text-sm peer-focus:text-blue1',
              {
                'text-white/70 peer-placeholder-shown:text-white/60':
                  selectedRole === 'admin',
                'text-text/70 peer-placeholder-shown:text-text/60':
                  selectedRole === 'staff',
              },
            ]"
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
    const selectedRole = ref("admin");

    const handleLogin = async () => {
      error.value = "";
      isLoading.value = true;

      try {
        const collectionName =
          selectedRole.value === "admin" ? "admins" : "staff";
        const userCollection = collection(db, collectionName);
        const q = query(userCollection, where("email", "==", email.value));
        const snapshot = await getDocs(q);

        const user = snapshot.docs[0]?.data();

        if (
          user &&
          user.password === password.value &&
          user.fullName === fullName.value
        ) {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              ...user,
              role: selectedRole.value,
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
      selectedRole,
    };
  },
};
</script>

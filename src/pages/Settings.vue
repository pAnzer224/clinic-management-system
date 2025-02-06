<template>
  <main class="flex-1 space-y-6">
    <h1 class="text-2xl font-satoshi-bold text-text px-4 sm:px-6 lg:px-0">
      Admin Settings
    </h1>

    <div
      class="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm mx-4 sm:mx-6 lg:mx-0"
    >
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0"
      >
        <h2 class="text-md font-satoshi-medium text-text">Admin Management</h2>
        <button
          @click="openAdminModal(null)"
          :disabled="admins.length >= 3"
          class="bg-blue1 text-white px-4 py-2 rounded-full w-full sm:w-auto"
        >
          Add Admin
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <intersecting-circles-spinner
          :animation-duration="1200"
          :size="70"
          color="#3f73ce"
        />
      </div>

      <!-- Admin List -->
      <div v-else class="space-y-4">
        <div
          v-for="admin in items"
          :key="admin.adminId"
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg gap-4 sm:gap-0"
        >
          <div class="flex items-center gap-4 w-full sm:w-auto">
            <div
              class="w-12 h-12 rounded-full bg-blue1/10 overflow-hidden flex-shrink-0"
            >
              <img
                v-if="admin.profileImage"
                :src="admin.profileImage"
                class="w-full h-full object-cover"
                alt="Profile"
              />
            </div>
            <div>
              <p class="font-medium mb-1">{{ admin.fullName }}</p>
              <p
                class="text-md text-blue1/80 tracking-wide font-satoshi-regular"
              >
                {{ admin.email }}
              </p>
              <p class="text-md text-text/50">ID: {{ admin.adminId }}</p>
            </div>
          </div>
          <div
            class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end"
          >
            <span class="text-sm text-gray-400">
              Last Login: {{ formatLastLogin(admin.lastLogin) }}
            </span>
            <button
              @click="openAdminModal(admin)"
              class="text-blue1 hover:text-blue-700"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Modal -->
    <div
      v-if="showAdminModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-2xl p-4 sm:p-8 w-full max-w-md">
        <h3 class="text-lg font-satoshi-medium mb-6">
          {{ editingAdmin ? "Edit Admin" : "Add New Admin" }}
        </h3>
        <form @submit.prevent="saveAdmin" class="space-y-4">
          <div class="flex justify-center mb-4">
            <div class="relative">
              <div class="w-24 h-24 rounded-full bg-blue1/10 overflow-hidden">
                <img
                  v-if="imagePreview"
                  :src="imagePreview"
                  class="w-full h-full object-cover"
                  alt="Profile Preview"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                @change="handleImageChange"
                class="hidden"
                ref="fileInput"
              />
              <button
                type="button"
                @click="$refs.fileInput.click()"
                class="absolute bottom-0 right-0 bg-blue1 text-white p-2 rounded-full"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label class="block text-text/60">Admin ID</label>
            <select
              v-model="adminForm.adminId"
              class="w-full px-4 py-2 rounded-full border bg-graytint"
              :disabled="editingAdmin"
            >
              <option v-for="id in availableAdminIds" :key="id" :value="id">
                {{ id }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-text/60">Full Name</label>
            <input
              v-model="adminForm.fullName"
              type="text"
              class="w-full px-4 py-2 rounded-full border bg-graytint"
              required
            />
          </div>
          <div>
            <label class="block text-text/60">Email</label>
            <input
              v-model="adminForm.email"
              type="email"
              class="w-full px-4 py-2 rounded-full border bg-graytint"
              required
            />
          </div>
          <div>
            <label class="block text-text/60">
              {{
                editingAdmin
                  ? "New Password (leave blank to keep current)"
                  : "Password"
              }}
            </label>
            <input
              v-model="adminForm.password"
              type="password"
              class="w-full px-4 py-2 rounded-full border bg-graytint"
              :required="!editingAdmin"
            />
          </div>
          <div class="flex justify-end gap-4">
            <button
              type="button"
              @click="showAdminModal = false"
              class="px-4 py-2 rounded-full border"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-blue1 text-white px-4 py-2 rounded-full"
            >
              {{ editingAdmin ? "Save Changes" : "Add Admin" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script>
import { db } from "@/firebase-config";
import { useCRUD } from "@/utils/firebaseCRUD";
import { serverTimestamp } from "firebase/firestore";
import { PencilIcon } from "@heroicons/vue/24/solid";
import { handleImageUpload } from "@/utils/image-utils";
import { IntersectingCirclesSpinner } from "epic-spinners";

export default {
  name: "Settings",
  components: {
    PencilIcon,
    IntersectingCirclesSpinner,
  },
  setup() {
    const {
      items,
      loading,
      error,
      fetchItems,
      addItem,
      updateItem,
      deleteItem,
    } = useCRUD("admins");
    return {
      items,
      loading,
      error,
      fetchItems,
      addItem,
      updateItem,
      deleteItem,
    };
  },
  data() {
    return {
      admins: [],
      showAdminModal: false,
      editingAdmin: null,
      adminForm: {
        adminId: "",
        fullName: "",
        email: "",
        password: "",
        profileImage: "",
      },
      imagePreview: null,
    };
  },
  computed: {
    availableAdminIds() {
      const usedIds = new Set(this.items.map((admin) => admin.adminId));
      return ["ADMIN1", "ADMIN2", "ADMIN3"].filter(
        (id) =>
          !usedIds.has(id) ||
          (this.editingAdmin && this.editingAdmin.adminId === id)
      );
    },
  },
  watch: {
    items: {
      immediate: true,
      handler(newItems) {
        this.admins = newItems;
      },
    },
  },
  methods: {
    formatLastLogin(timestamp) {
      if (!timestamp) return "Never";

      // Convert Firebase timestamp to JS Date
      const date = timestamp.toDate();

      // Format the date
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },
    async fetchAdmins() {
      await this.fetchItems();
    },
    openAdminModal(admin) {
      this.editingAdmin = admin;
      if (admin) {
        this.adminForm = { ...admin };
        this.adminForm.password = "";
        this.imagePreview = admin.profileImage;
      } else {
        this.adminForm = {
          adminId: this.availableAdminIds[0],
          fullName: "",
          email: "",
          password: "",
          profileImage: "",
        };
        this.imagePreview = null;
      }
      this.showAdminModal = true;
    },
    async handleImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        const base64 = await handleImageUpload(file);
        this.imagePreview = base64;
        this.adminForm.profileImage = base64;
      }
    },
    async saveAdmin() {
      const adminData = {
        id: this.adminForm.adminId,
        adminId: this.adminForm.adminId,
        fullName: this.adminForm.fullName,
        email: this.adminForm.email,
        profileImage: this.adminForm.profileImage,
        updatedAt: serverTimestamp(),
      };

      if (!this.editingAdmin || this.adminForm.password) {
        adminData.password = this.adminForm.password;
      }

      if (!this.editingAdmin) {
        adminData.createdAt = serverTimestamp();
        adminData.lastLogin = null;
      }

      if (this.editingAdmin) {
        await this.updateItem(adminData);
      } else {
        await this.addItem(adminData);
      }

      if (
        JSON.parse(localStorage.getItem("currentAdmin"))?.adminId ===
        this.adminForm.adminId
      ) {
        localStorage.setItem(
          "currentAdmin",
          JSON.stringify({
            ...JSON.parse(localStorage.getItem("currentAdmin")),
            ...adminData,
          })
        );
      }

      this.showAdminModal = false;
    },
  },
  async mounted() {
    await this.fetchAdmins();
  },
};
</script>

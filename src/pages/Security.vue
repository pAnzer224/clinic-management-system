<template>
  <!-- Template remains unchanged -->
  <main v-if="currentUser.role === 'admin'" class="flex-1 space-y-6">
    <h1 class="text-2xl font-satoshi-bold text-text px-4 sm:px-6 lg:px-0">
      User Management
    </h1>

    <!-- Admin Management Section -->
    <div
      class="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm mx-4 sm:mx-6 lg:mx-0"
    >
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0"
      >
        <h2 class="text-md font-satoshi-medium text-text">Admin Management</h2>
        <button
          @click="openModal('admin', null)"
          :disabled="admins.length >= 3"
          class="bg-blue1 text-white px-4 py-2 rounded-full w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Admin
        </button>
      </div>

      <!-- Admin List -->
      <div class="space-y-4">
        <div
          v-for="admin in admins"
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
              <p class="font-medium mb-1">{{ admin.email }}</p>
              <p class="text-md text-text/50">ID: {{ admin.adminId }}</p>
              <p class="text-sm text-gray-400" v-if="admin.createdAt">
                Created: {{ formatTimestamp(admin.createdAt) }}
              </p>
            </div>
          </div>
          <div
            class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end"
          >
            <span class="text-sm text-gray-400">
              Last Login: {{ formatLastLogin(admin.lastLogin) }}
            </span>
            <div class="flex gap-3">
              <button
                @click="openModal('admin', admin)"
                class="text-blue1 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                v-if="admin.adminId !== currentUser.adminId"
                @click="confirmDelete('admin', admin.adminId)"
                class="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Staff Management Section -->
    <div
      class="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm mx-4 sm:mx-6 lg:mx-0"
    >
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0"
      >
        <h2 class="text-md font-satoshi-medium text-text">Staff Management</h2>
        <button
          @click="openModal('staff', null)"
          class="bg-blue1 text-white px-4 py-2 rounded-full w-full sm:w-auto"
        >
          Add Staff
        </button>
      </div>

      <!-- Staff List -->
      <div class="space-y-4">
        <div
          v-for="staff in staffMembers"
          :key="staff.staffId"
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg gap-4 sm:gap-0"
        >
          <div class="flex items-center gap-4 w-full sm:w-auto">
            <div
              class="w-12 h-12 rounded-full bg-blue1/10 overflow-hidden flex-shrink-0"
            >
              <img
                v-if="staff.profileImage"
                :src="staff.profileImage"
                class="w-full h-full object-cover"
                alt="Profile"
              />
            </div>
            <div>
              <p class="font-medium mb-1">{{ staff.email }}</p>
              <p class="text-md text-text/50">ID: {{ staff.staffId }}</p>
              <p class="text-sm text-gray-400" v-if="staff.createdAt">
                Created: {{ formatTimestamp(staff.createdAt) }}
              </p>
            </div>
          </div>
          <div
            class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end"
          >
            <span class="text-sm text-gray-400">
              Last Login: {{ formatLastLogin(staff.lastLogin) }}
            </span>
            <div class="flex gap-3">
              <button
                @click="openModal('staff', staff)"
                class="text-blue1 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                @click="confirmDelete('staff', staff.staffId)"
                class="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex justify-center items-center z-50"
    >
      <div class="fixed inset-0 bg-black/50" @click="showModal = false"></div>
      <div
        class="relative bg-white rounded-2xl p-4 sm:p-8 w-full max-w-md"
        @click.stop
      >
        <h3 class="text-lg font-satoshi-medium mb-6">
          {{ editingUser ? `Edit ${currentRole}` : `Add New ${currentRole}` }}
        </h3>
        <form @submit.prevent="saveUser" class="space-y-4">
          <div class="flex justify-center mb-4">
            <div class="relative">
              <div class="w-24 h-24 rounded-full bg-blue1/10 overflow-hidden">
                <img
                  v-if="imagePreview"
                  :src="imagePreview"
                  class="w-full h-full object-cover"
                  alt="Profile Preview"
                />
                <!-- Simple loading text overlay -->
                <div
                  v-if="uploading"
                  class="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full text-white text-xs"
                >
                  Please wait...
                </div>
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
                :disabled="uploading"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label class="block text-text/60">{{
              currentRole === "admin" ? "Admin ID" : "Staff ID"
            }}</label>
            <Dropdown
              v-model="userForm.id"
              :options="availableIds.map((id) => ({ value: id, label: id }))"
              placeholder="Select ID"
              :disabled="editingUser"
            />
          </div>
          <div>
            <label class="block text-text/60">Email</label>
            <input
              v-model="userForm.email"
              type="email"
              class="w-full px-4 py-2 rounded-full border bg-graytint"
              required
            />
          </div>
          <div>
            <label class="block text-text/60">
              {{
                editingUser
                  ? "New Password (leave blank to keep current)"
                  : "Password"
              }}
            </label>
            <input
              v-model="userForm.password"
              type="password"
              class="w-full px-4 py-2 rounded-full border bg-graytint"
              :required="!editingUser"
            />
          </div>
          <div class="flex justify-end gap-4">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 rounded-full border"
              :disabled="uploading"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-blue1 text-white px-4 py-2 rounded-full"
              :disabled="uploading"
            >
              {{ editingUser ? "Save Changes" : `Add ${currentRole}` }}
            </button>
          </div>
        </form>
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
import { db } from "@/firebase-config";
import { useCRUD } from "@/utils/firebaseCRUD";
import { serverTimestamp } from "firebase/firestore";
import { PencilIcon } from "@heroicons/vue/24/solid";
import { uploadImageToSupabase } from "@/utils/supabase-storage";
import { ref, computed, onMounted } from "vue";
import Dropdown from "@/components/Dropdown.vue";
import { logActivity } from "@/utils/activity-logger";
// Removed LoaderIcon import for faster loading

export default {
  name: "Security",
  components: {
    PencilIcon,
    Dropdown,
    // Removed LoaderIcon component for performance
  },
  setup() {
    const adminCRUD = useCRUD("admins");
    const staffCRUD = useCRUD("staff");

    return {
      adminCRUD,
      staffCRUD,
    };
  },
  data() {
    return {
      admins: [],
      staffMembers: [],
      showModal: false,
      editingUser: null,
      currentRole: "admin",
      userForm: {
        id: "",
        email: "",
        password: "",
        profileImage: "",
      },
      imageFile: null, // Store the actual file object
      imagePreview: null,
      currentUser: {},
      showToast: false,
      toastMessage: "",
      uploading: false, // Flag to track upload state - now displays simple text
    };
  },
  computed: {
    availableIds() {
      if (this.currentRole === "admin") {
        const usedIds = new Set(this.admins.map((admin) => admin.adminId));
        return ["ADMIN1", "ADMIN2", "ADMIN3"].filter(
          (id) =>
            !usedIds.has(id) ||
            (this.editingUser && this.editingUser.adminId === id)
        );
      } else {
        const usedIds = new Set(
          this.staffMembers.map((staff) => staff.staffId)
        );
        const availableStaffIds = [];
        for (let i = 1; i <= 10; i++) {
          const id = `STAFF${i}`;
          if (
            !usedIds.has(id) ||
            (this.editingUser && this.editingUser.staffId === id)
          ) {
            availableStaffIds.push(id);
          }
        }
        return availableStaffIds;
      }
    },
  },
  methods: {
    async handleImageChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Set uploading state to show simple loading text
      this.uploading = true;
      try {
        // Display preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);

        // Store the file for later upload
        this.imageFile = file;

        // Use a short timeout to ensure UI updates before heavy processing
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Upload to Supabase and get the URL
        const imageUrl = await uploadImageToSupabase(file);
        this.userForm.profileImage = imageUrl;
      } catch (error) {
        console.error("Error handling image:", error);
        this.showNotification("Failed to upload image");
      } finally {
        // Clear uploading state to remove loading text
        this.uploading = false;
      }
    },
    showNotification(message) {
      this.toastMessage = message;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    },
    formatLastLogin(timestamp) {
      if (!timestamp) return "Never";

      try {
        // Handle different timestamp formats
        let date;

        if (timestamp.toDate) {
          // Firebase Timestamp
          date = timestamp.toDate();
        } else if (timestamp.seconds) {
          // Firebase Timestamp format in JSON
          date = new Date(timestamp.seconds * 1000);
        } else if (typeof timestamp === "string") {
          // ISO string
          date = new Date(timestamp);
        } else if (timestamp instanceof Date) {
          // JS Date object
          date = timestamp;
        } else if (typeof timestamp === "object") {
          // Handle potential JSON date object from localStorage
          date = new Date(timestamp);
        } else {
          // Fallback for number or other formats
          date = new Date(timestamp);
        }

        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn("Invalid timestamp format:", timestamp);
          return "Invalid date";
        }

        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
      } catch (error) {
        console.error("Error formatting timestamp:", error, timestamp);
        return "Error";
      }
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return "Unknown";

      try {
        let date;

        if (timestamp.toDate) {
          date = timestamp.toDate();
        } else if (timestamp.seconds) {
          date = new Date(timestamp.seconds * 1000);
        } else {
          date = new Date(timestamp);
        }

        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(date);
      } catch (error) {
        console.error("Error formatting timestamp:", error);
        return "Unknown";
      }
    },
    async fetchAdmins() {
      try {
        await this.adminCRUD.fetchItems();
        this.admins = this.adminCRUD.items.value;
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    },
    async fetchStaff() {
      try {
        await this.staffCRUD.fetchItems();
        this.staffMembers = this.staffCRUD.items.value;
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    },
    openModal(role, user) {
      this.currentRole = role;
      this.editingUser = user;
      if (user) {
        this.userForm = {
          ...user,
          id: role === "admin" ? user.adminId : user.staffId,
        };
        this.userForm.password = "";
        this.imagePreview = user.profileImage;
      } else {
        this.userForm = {
          id: this.availableIds[0],
          email: "",
          password: "",
          profileImage: "",
        };
        this.imagePreview = null;
      }
      this.imageFile = null; // Reset the image file
      this.showModal = true;
    },

    async saveUser() {
      // Set uploading state for form submission loading
      this.uploading = true;
      const isAdmin = this.currentRole === "admin";
      const idField = isAdmin ? "adminId" : "staffId";

      try {
        const userData = {
          id: this.userForm.id,
          [idField]: this.userForm.id,
          email: this.userForm.email,
          profileImage: this.userForm.profileImage,
          updatedAt: serverTimestamp(),
        };

        if (!this.editingUser || this.userForm.password) {
          userData.password = this.userForm.password;
        }

        if (!this.editingUser) {
          userData.createdAt = serverTimestamp();
          userData.lastLogin = null;
        } else if (this.editingUser.lastLogin) {
          // Preserve the lastLogin timestamp when updating a user
          userData.lastLogin = this.editingUser.lastLogin;
        }

        if (isAdmin) {
          if (this.editingUser) {
            await this.adminCRUD.updateItem(userData);
            await logActivity({
              type: "admin",
              action: "update",
              title: "Admin Updated",
              description: `Updated admin ${userData.email}`,
              timestamp: serverTimestamp(),
            });
          } else {
            await this.adminCRUD.addItem(userData);
            await logActivity({
              type: "admin",
              action: "create",
              title: "New Admin Added",
              description: `Added new admin ${userData.email}`,
              timestamp: serverTimestamp(),
            });
          }
          await this.fetchAdmins();
        } else {
          if (this.editingUser) {
            await this.staffCRUD.updateItem(userData);
            await logActivity({
              type: "staff",
              action: "update",
              title: "Staff Updated",
              description: `Updated staff member ${userData.email}`,
              timestamp: serverTimestamp(),
            });
          } else {
            await this.staffCRUD.addItem(userData);
            await logActivity({
              type: "staff",
              action: "create",
              title: "New Staff Added",
              description: `Added new staff member ${userData.email}`,
              timestamp: serverTimestamp(),
            });
          }
          await this.fetchStaff();
        }

        // Update local storage if updating current user
        const storedUser = JSON.parse(localStorage.getItem("currentUser"));
        if (storedUser && storedUser[idField] === this.userForm.id) {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              ...storedUser,
              ...userData,
            })
          );
        }

        this.showModal = false;
        this.showNotification(
          `${isAdmin ? "Admin" : "Staff"} ${
            this.editingUser ? "updated" : "added"
          } successfully`
        );
      } catch (err) {
        console.error("Error saving user:", err);
        this.showNotification(
          `Failed to ${this.editingUser ? "update" : "add"} ${
            isAdmin ? "admin" : "staff"
          }`
        );
      } finally {
        // Clear uploading state regardless of success or failure
        this.uploading = false;
      }
    },
    async confirmDelete(role, userId) {
      if (
        confirm(
          "Are you sure you want to delete this user? This action cannot be undone."
        )
      ) {
        const isAdmin = role === "admin";
        const user = isAdmin
          ? this.admins.find((a) => a.adminId === userId)
          : this.staffMembers.find((s) => s.staffId === userId);

        try {
          if (isAdmin) {
            await this.adminCRUD.deleteItem(userId);
            await logActivity({
              type: "admin",
              action: "delete",
              title: "Admin Removed",
              description: `Removed admin ${user.email}`,
              timestamp: serverTimestamp(),
            });
            await this.fetchAdmins();
          } else {
            await this.staffCRUD.deleteItem(userId);
            await logActivity({
              type: "staff",
              action: "delete",
              title: "Staff Removed",
              description: `Removed staff member ${user.email}`,
              timestamp: serverTimestamp(),
            });
            await this.fetchStaff();
          }
          this.showNotification(
            `${isAdmin ? "Admin" : "Staff"} deleted successfully`
          );
        } catch (err) {
          console.error("Error deleting user:", err);
          this.showNotification(
            `Failed to delete ${isAdmin ? "admin" : "staff"}`
          );
        }
      }
    },
  },
  async mounted() {
    // Get current user from localStorage
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }

    await this.fetchAdmins();
    await this.fetchStaff();
  },
};
</script>

<template>
  <main class="flex-1 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">
        Standard Operating Procedures
      </h1>
      <button class="bg-blue1 text-white px-4 py-2 rounded-full">
        Add SOP
      </button>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div
        v-for="category in sopCategories"
        :key="category.id"
        class="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div class="flex items-center gap-3 mb-4">
          <component :is="category.icon" class="size-6 text-blue1" />
          <h2 class="text-md font-satoshi-medium text-text">
            {{ category.name }}
          </h2>
        </div>
        <div class="space-y-3">
          <div
            v-for="sop in category.sops"
            :key="sop.id"
            class="p-3 rounded-xl hover:bg-graytint cursor-pointer"
          >
            <h3 class="font-satoshi-medium mb-1">{{ sop.title }}</h3>
            <p class="text-sm text-text/60">
              Last updated: {{ sop.lastUpdated }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-8 shadow-sm">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-md font-satoshi-medium text-text">
          Recently Updated SOPs
        </h2>
        <div class="flex gap-4">
          <input
            type="search"
            placeholder="Search SOPs..."
            class="px-4 py-2 rounded-full bg-graytint"
          />
          <select class="px-4 py-2 rounded-full bg-graytint">
            <option>All Categories</option>
            <option>Emergency</option>
            <option>General</option>
            <option>Administration</option>
          </select>
        </div>
      </div>

      <table class="w-full">
        <thead>
          <tr class="text-left text-text/60">
            <th class="pb-4">Title</th>
            <th class="pb-4">Category</th>
            <th class="pb-4">Last Updated</th>
            <th class="pb-4">Status</th>
            <th class="pb-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="sop in recentSOPs"
            :key="sop.id"
            class="border-t border-graytint"
          >
            <td class="py-4">{{ sop.title }}</td>
            <td>{{ sop.category }}</td>
            <td>{{ sop.lastUpdated }}</td>
            <td>
              <span
                :class="[
                  'px-2 py-1 rounded-full text-sm',
                  sop.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800',
                ]"
              >
                {{ sop.status }}
              </span>
            </td>
            <td>
              <div class="flex gap-2">
                <button class="text-blue1">View</button>
                <button class="text-blue1">Edit</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script>
import {
  ShieldExclamationIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/solid";

export default {
  name: "SOPs",
  components: {
    ShieldExclamationIcon,
    ClipboardDocumentCheckIcon,
    UserGroupIcon,
  },
  data() {
    return {
      sopCategories: [
        {
          id: 1,
          name: "Emergency Procedures",
          icon: "ShieldExclamationIcon",
          sops: [
            {
              id: 1,
              title: "Medical Emergency Response",
              lastUpdated: "2024-01-15",
            },
            { id: 2, title: "First Aid Protocol", lastUpdated: "2024-01-14" },
          ],
        },
        {
          id: 2,
          name: "General Procedures",
          icon: "ClipboardDocumentCheckIcon",
          sops: [
            {
              id: 3,
              title: "Student Check-in Process",
              lastUpdated: "2024-01-13",
            },
            {
              id: 4,
              title: "Medication Administration",
              lastUpdated: "2024-01-12",
            },
          ],
        },
        {
          id: 3,
          name: "Administrative Procedures",
          icon: "UserGroupIcon",
          sops: [
            {
              id: 5,
              title: "Record Keeping Guidelines",
              lastUpdated: "2024-01-11",
            },
            {
              id: 6,
              title: "Staff Responsibilities",
              lastUpdated: "2024-01-10",
            },
          ],
        },
      ],
      recentSOPs: [
        {
          id: 1,
          title: "Medical Emergency Response",
          category: "Emergency",
          lastUpdated: "2024-01-15",
          status: "Active",
        },
        {
          id: 2,
          title: "Student Check-in Process",
          category: "General",
          lastUpdated: "2024-01-13",
          status: "Under Review",
        },
      ],
    };
  },
};
</script>

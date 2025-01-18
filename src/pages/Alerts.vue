<template>
  <main class="flex-1 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Health Alerts</h1>
      <button class="bg-blue1 text-white px-4 py-2 rounded-full">
        Create Alert
      </button>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-2xl p-8 shadow-sm">
        <h2 class="text-md font-satoshi-medium text-text mb-6">
          Active Alerts
        </h2>
        <div class="space-y-4">
          <div
            v-for="alert in activeAlerts"
            :key="alert.id"
            class="p-4 rounded-xl border-l-4"
            :class="[
              alert.priority === 'High'
                ? 'border-red-500 bg-red-50'
                : alert.priority === 'Medium'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-blue-500 bg-blue-50',
            ]"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-satoshi-medium">{{ alert.title }}</h3>
                <p class="text-text/60">{{ alert.description }}</p>
              </div>
              <span
                class="px-2 py-1 rounded-full text-sm"
                :class="[
                  alert.priority === 'High'
                    ? 'bg-red-100 text-red-800'
                    : alert.priority === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800',
                ]"
              >
                {{ alert.priority }}
              </span>
            </div>
            <div class="mt-2 text-text/60 text-sm">
              Affected Students: {{ alert.affectedStudents }}
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-8 shadow-sm">
        <h2 class="text-md font-satoshi-medium text-text mb-6">
          Scheduled Alerts
        </h2>
        <div class="space-y-4">
          <div
            v-for="alert in scheduledAlerts"
            :key="alert.id"
            class="p-4 rounded-xl border border-graytint"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-satoshi-medium">{{ alert.title }}</h3>
                <p class="text-text/60">{{ alert.description }}</p>
              </div>
              <p class="text-text/60">{{ alert.scheduledDate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-8 shadow-sm">
      <h2 class="text-md font-satoshi-medium text-text mb-6">Alert History</h2>
      <table class="w-full">
        <thead>
          <tr class="text-left text-text/60">
            <th class="pb-4">Date</th>
            <th class="pb-4">Title</th>
            <th class="pb-4">Priority</th>
            <th class="pb-4">Status</th>
            <th class="pb-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="alert in alertHistory"
            :key="alert.id"
            class="border-t border-graytint"
          >
            <td class="py-4">{{ alert.date }}</td>
            <td>{{ alert.title }}</td>
            <td>
              <span
                :class="[
                  'px-2 py-1 rounded-full text-sm',
                  alert.priority === 'High'
                    ? 'bg-red-100 text-red-800'
                    : alert.priority === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800',
                ]"
              >
                {{ alert.priority }}
              </span>
            </td>
            <td>{{ alert.status }}</td>
            <td>
              <button class="text-blue1">View Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Alerts",
  data() {
    return {
      activeAlerts: [
        {
          id: 1,
          title: "Flu Outbreak Alert",
          description: "Multiple cases of flu reported in dormitory A",
          priority: "High",
          affectedStudents: 15,
        },
        {
          id: 2,
          title: "Medication Reminder",
          description: "Scheduled medication for chronic condition patients",
          priority: "Medium",
          affectedStudents: 8,
        },
      ],
      scheduledAlerts: [
        {
          id: 1,
          title: "Vaccination Drive",
          description: "Annual flu vaccination campaign",
          scheduledDate: "2024-02-01",
        },
      ],
      alertHistory: [
        {
          id: 1,
          date: "2024-01-10",
          title: "Food Allergy Alert",
          priority: "High",
          status: "Resolved",
        },
      ],
    };
  },
};
</script>

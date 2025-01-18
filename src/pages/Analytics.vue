<template>
  <main class="flex-1 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Analytics Dashboard</h1>
      <div class="flex gap-2">
        <select class="px-4 py-2 rounded-full bg-graytint">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 3 months</option>
        </select>
        <button class="bg-blue1 text-white px-4 py-2 rounded-full">
          Export Report
        </button>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-4">
      <div
        v-for="metric in metrics"
        :key="metric.title"
        class="bg-blue3/30 rounded-2xl p-6 shadow-sm"
      >
        <h3 class="text-md text-text/60 mb-2">{{ metric.title }}</h3>
        <p class="text-2xl font-satoshi-bold text-text mb-2">
          {{ metric.value }}
        </p>
        <div
          class="flex items-center gap-1"
          :class="metric.trend >= 0 ? 'text-green-600' : 'text-red-600'"
        >
          <span class="text-xs">{{ metric.trend >= 0 ? "↗" : "↘" }}</span>
          <span class="text-md font-satoshi-medium"
            >{{ Math.abs(metric.trend) }}%</span
          >
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-2xl p-8 shadow-sm">
        <h2 class="text-md font-satoshi-medium text-text mb-6">
          Visit Types Distribution
        </h2>
        <div class="h-64 flex items-center justify-center">
          [Pie Chart Placeholder]
        </div>
      </div>

      <div class="bg-white rounded-2xl p-8 shadow-sm">
        <h2 class="text-md font-satoshi-medium text-text mb-6">
          Daily Visits Trend
        </h2>
        <div class="h-64 flex items-center justify-center">
          [Line Chart Placeholder]
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-8 shadow-sm">
      <h2 class="text-md font-satoshi-medium text-text mb-6">
        Top Health Issues
      </h2>
      <table class="w-full">
        <thead>
          <tr class="text-left text-text/60">
            <th class="pb-4">Issue</th>
            <th class="pb-4">Cases</th>
            <th class="pb-4">Trend</th>
            <th class="pb-4">Avg. Recovery Time</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="issue in healthIssues"
            :key="issue.name"
            class="border-t border-graytint"
          >
            <td class="py-4">{{ issue.name }}</td>
            <td>{{ issue.cases }}</td>
            <td>
              <span
                :class="[
                  'px-2 py-1 rounded-full text-sm',
                  issue.trend >= 0
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800',
                ]"
              >
                {{ issue.trend >= 0 ? "+" : "-" }}{{ Math.abs(issue.trend) }}%
              </span>
            </td>
            <td>{{ issue.recoveryTime }} days</td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Analytics",
  data() {
    return {
      metrics: [
        { title: "Total Visits", value: "12,345", trend: 10 },
        { title: "Appointments Scheduled", value: "2,567", trend: 5 },
        { title: "Revenue Generated", value: "$12,000", trend: -2 },
        { title: "Medications Prescribed", value: "1,234", trend: 8 },
      ],
      healthIssues: [
        { name: "Flu", cases: 234, trend: 12, recoveryTime: 7 },
        { name: "Diabetes", cases: 187, trend: -5, recoveryTime: 30 },
        { name: "Hypertension", cases: 152, trend: 4, recoveryTime: 15 },
        { name: "Pneumonia", cases: 80, trend: -8, recoveryTime: 21 },
      ],
    };
  },
};
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
a

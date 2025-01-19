<template>
  <main class="flex-1 space-y-6">
    <div class="grid grid-cols-4 gap-3">
      <div
        v-for="stat in stats"
        :key="stat.title"
        class="bg-blue3/30 rounded-2xl p-8 shadow-sm"
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-md text-text/60 font-satoshi-regular">
            {{ stat.title }}
          </h3>
          <button class="text-text/60">⋯</button>
        </div>
        <p class="text-2xl font-satoshi-bold text-text mb-3">
          {{ stat.value }}
        </p>
        <div class="flex items-center gap-1 text-blue1">
          <span class="text-xs">↗</span>
          <span class="text-md font-satoshi-medium">+{{ stat.change }}%</span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-8 shadow-sm">
      <div class="flex justify-between items-center mb-8">
        <button class="text-text/60">⋯</button>
      </div>
      <div class="h-64 flex items-end gap-4">
        <div
          v-for="(data, idx) in visitData"
          :key="idx"
          class="flex-1 flex gap-3"
        >
          <div
            class="flex-1 bg-blue1 rounded-xl transition-all duration-300"
            :style="`height: ${data.visits}%`"
          ></div>
          <div
            class="flex-1 bg-blue3 rounded-xl transition-all duration-300"
            :style="`height: ${data.followups}%`"
          ></div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-2xl p-8 shadow-sm">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-md font-satoshi-medium text-text">Recent tickets</h2>
          <button class="text-text/60">⋯</button>
        </div>
        <div class="space-y-4">
          <div
            v-for="ticket in recentTickets"
            :key="ticket.id"
            class="flex items-center gap-4"
          >
            <div
              class="w-2 h-2 rounded-full"
              :class="ticket.status === 'released' ? 'bg-blue1' : 'bg-blue3'"
            ></div>
            <div class="text-md font-satoshi-regular">{{ ticket.title }}</div>
            <div class="ml-auto text-md text-text/60 font-satoshi-regular">
              {{ ticket.status }}
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-3xl p-8 shadow-sm">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-md font-satoshi-medium text-text">Lorem Ipsum</h2>
          <button class="text-text/60">⋯</button>
        </div>
        <div class="space-y-4">
          <div
            v-for="category in categories"
            :key="category.name"
            class="flex items-center justify-between border-b border-background pb-2"
          >
            <span class="text-md font-satoshi-regular">{{
              category.name
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Overview",
  data() {
    return {
      stats: [
        { title: "Sample Data", value: "150,040", change: 0 },
        { title: "Sample Data", value: "300", change: 0 },
        { title: "Sample Data", value: "2", change: 0 },
        { title: "Sample Data", value: "42%", change: 0 },
      ],
      visitData: Array.from({ length: 7 }, () => ({
        visits: Math.floor(Math.random() * 80) + 20,
        followups: Math.floor(Math.random() * 60) + 20,
      })),

      categories: [{ name: "Development" }, { name: "Web Design" }],
    };
  },
};
</script>

<template>
  <main class="flex-1 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Medical Records</h1>
      <div class="flex gap-2">
        <button class="bg-blue1 text-white px-4 py-2 rounded-full">
          Add Record
        </button>
        <button class="bg-blue3/30 text-blue1 px-4 py-2 rounded-full">
          Export Records
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div class="bg-white rounded-2xl p-8 shadow-sm">
        <div class="flex justify-between items-center mb-6">
          <div class="flex gap-4">
            <input
              type="search"
              placeholder="Search records..."
              class="px-4 py-2 rounded-full bg-graytint"
            />
            <select class="px-4 py-2 rounded-full bg-graytint">
              <option>All Types</option>
              <option>Checkup</option>
              <option>Emergency</option>
              <option>Follow-up</option>
            </select>
          </div>
        </div>

        <table class="w-full">
          <thead>
            <tr class="text-left text-text/60">
              <th class="pb-4">Date</th>
              <th class="pb-4">Student</th>
              <th class="pb-4">Type</th>
              <th class="pb-4">Diagnosis</th>
              <th class="pb-4">Prescribed</th>
              <th class="pb-4">Follow-up</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="record in records"
              :key="record.id"
              class="border-t border-graytint"
            >
              <td class="py-4">{{ record.date }}</td>
              <td>{{ record.student }}</td>
              <td>
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-sm',
                    record.type === 'Checkup'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ record.type }}
                </span>
              </td>
              <td>{{ record.diagnosis }}</td>
              <td>{{ record.prescribed }}</td>
              <td>{{ record.followup }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Records",
  data() {
    return {
      records: [
        {
          id: 1,
          date: "2024-01-15",
          student: "John Doe",
          type: "Checkup",
          diagnosis: "Common Cold",
          prescribed: "Paracetamol",
          followup: "None",
        },
        {
          id: 2,
          date: "2024-01-14",
          student: "Jane Smith",
          type: "Emergency",
          diagnosis: "Sprained Ankle",
          prescribed: "Ice Pack",
          followup: "2024-01-21",
        },
      ],
    };
  },
};
</script>

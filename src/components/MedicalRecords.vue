<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-satoshi-bold">Medical Records</h3>
      <div class="text-sm text-gray-500">Total: {{ records.length }}</div>
    </div>

    <div
      v-if="!records.length"
      class="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl text-gray-500"
    >
      <div class="mb-2">
        <InboxIcon class="w-12 h-12 text-gray-300" />
      </div>
      <p>No medical records found for this student.</p>
    </div>

    <div v-else>
      <!-- Wrap the slider and records in a container with hidden overflow -->
      <div class="relative overflow-hidden">
        <div
          class="flex transition-transform duration-300 ease-in-out"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div
            v-for="record in records"
            :key="record.id"
            class="w-full flex-shrink-0"
          >
            <div
              class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <div
                class="flex justify-between items-center mb-3 pb-2 border-b border-gray-100"
              >
                <div class="font-medium text-blue1">
                  {{ formatDate(record.date) }}
                </div>
                <div
                  class="text-xs font-medium px-3 py-1 rounded-full"
                  :class="{
                    'bg-green-100 text-green-700':
                      record.status === 'Completed',
                    'bg-yellow-100 text-yellow-700':
                      record.status === 'Pending',
                    'bg-blue-100 text-blue-700': record.status === 'Ongoing',
                    'bg-gray-100 text-gray-700': ![
                      'Completed',
                      'Pending',
                      'Ongoing',
                    ].includes(record.status),
                  }"
                >
                  {{ record.status }}
                </div>
              </div>

              <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <span class="text-gray-500 font-medium block mb-1"
                    >Chief Complaint:</span
                  >
                  <p class="text-gray-800">{{ record.chiefComplaint }}</p>
                </div>
                <div>
                  <span class="text-gray-500 font-medium block mb-1"
                    >Diagnosis:</span
                  >
                  <p class="text-gray-800">{{ record.diagnosis }}</p>
                </div>
                <div class="col-span-2">
                  <span class="text-gray-500 font-medium block mb-1"
                    >Treatment:</span
                  >
                  <p class="text-gray-800">{{ record.treatment }}</p>
                </div>

                <div v-if="record.medications?.length" class="col-span-2">
                  <span class="text-gray-500 font-medium block mb-1"
                    >Medications:</span
                  >
                  <div class="grid grid-cols-2 gap-2 mt-1">
                    <div
                      v-for="med in record.medications"
                      :key="med.medicationId"
                      class="bg-blue1/5 px-3 py-2 rounded-lg flex items-center"
                    >
                      <div class="w-2 h-2 bg-blue1 rounded-full mr-2"></div>
                      <span>{{ med.name }} - {{ med.dosage }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation buttons -->
      <div class="flex justify-center items-center gap-4 mt-4">
        <button
          type="button"
          @click.prevent="prevRecord"
          class="hover:bg-blue3/60 rounded-full p-2 disabled:opacity-50"
          :disabled="currentIndex === 0"
        >
          <ChevronLeftIcon class="h-5 w-5 text-text" />
        </button>
        <span class="text-sm text-text/60">
          {{ currentIndex + 1 }} / {{ records.length }}
        </span>
        <button
          type="button"
          @click.prevent="nextRecord"
          class="hover:bg-blue3/60 rounded-full p-2 shadow-sm disabled:opacity-50"
          :disabled="currentIndex >= records.length - 1"
        >
          <ChevronRightIcon class="h-5 w-5 text-text" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { Inbox as InboxIcon } from "lucide-vue-next";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";

export default {
  name: "MedicalRecords",
  components: {
    InboxIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
  },
  props: {
    records: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    // Add props parameter here
    const currentIndex = ref(0);

    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const nextRecord = () => {
      currentIndex.value = Math.min(
        currentIndex.value + 1,
        props.records.length - 1
      );
    };

    const prevRecord = () => {
      currentIndex.value = Math.max(currentIndex.value - 1, 0);
    };

    return {
      formatDate,
      currentIndex,
      nextRecord,
      prevRecord,
    };
  },
};
</script>

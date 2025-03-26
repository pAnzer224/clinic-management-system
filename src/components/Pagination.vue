<template>
  <div
    class="fixed bottom-4 left-1/2 transform -translate-x-1/2 ml-14 sm:ml-28 bg-gradient-to-tr from-[#D3E0F6] to-[#B7CBED] rounded-lg shadow-md z-50 border border-gray-200"
    v-if="totalPages > 1"
  >
    <div class="flex items-center justify-center">
      <!-- Go to page input -->
      <div class="px-3 py-2 border-r border-gray-200 flex items-center">
        <span class="text-xs text-blue1 mr-2 font-medium tracking-wide"
          >Go to page</span
        >
        <div class="relative">
          <input
            v-model="goToPageInput"
            @keyup.enter="handleGoToPage"
            type="number"
            min="1"
            :max="totalPages"
            class="w-12 px-2 py-1 bg-graytint/70 rounded text-center text-xs appearance-none outline-none"
          />
        </div>
      </div>

      <!-- Pagination buttons -->
      <div class="flex items-center px-2">
        <button
          @click="$emit('update:modelValue', 1)"
          class="mx-1 px-2 py-1 rounded-md text-xs hover:bg-blue1/10"
          :class="{
            'bg-blue1/10 text-blue1': currentPage === 1,
            'text-text/60': currentPage !== 1,
          }"
        >
          1
        </button>

        <span v-if="showLeftEllipsis" class="mx-1 text-xs text-text/60"
          >...</span
        >

        <button
          v-for="page in displayedPages"
          :key="page"
          @click="$emit('update:modelValue', page)"
          class="mx-1 px-2 py-1 rounded-md text-xs hover:bg-blue1/10"
          :class="{
            'bg-blue1/10 text-blue1': currentPage === page,
            'text-text/60': currentPage !== page,
          }"
        >
          {{ page }}
        </button>

        <span v-if="showRightEllipsis" class="mx-1 text-xs text-text/60"
          >...</span
        >

        <button
          v-if="totalPages > 1"
          @click="$emit('update:modelValue', totalPages)"
          class="mx-1 px-2 py-1 rounded-md text-xs hover:bg-blue1/10"
          :class="{
            'bg-blue1/10 text-blue1': currentPage === totalPages,
            'text-text/60': currentPage !== totalPages,
          }"
        >
          {{ totalPages }}
        </button>
      </div>

      <!-- Nav controls -->
      <div class="flex items-center pl-2 pr-2 border-l border-gray-200">
        <button
          @click="$emit('update:modelValue', currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-1 py-1 rounded-full hover:bg-blue1/10 disabled:opacity-50"
        >
          <ChevronLeftIcon class="h-4 w-4 text-text/60" />
        </button>
        <button
          @click="$emit('update:modelValue', currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-1 py-1 rounded-full hover:bg-blue1/10 disabled:opacity-50"
        >
          <ChevronRightIcon class="h-4 w-4 text-text/60" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-vue-next";

export default {
  name: "Pagination",
  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
  },
  props: {
    modelValue: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const goToPageInput = ref("");

    const currentPage = computed(() => props.modelValue);

    const displayedPages = computed(() => {
      const maxDisplayed = 3; // Number of pages to display between ellipses
      let start, end;

      if (props.totalPages <= maxDisplayed + 2) {
        start = 2;
        end = props.totalPages - 1;
      } else {
        // Calculate range around current page
        const half = Math.floor(maxDisplayed / 2);

        if (props.modelValue <= 2 + half) {
          // Near the start
          start = 2;
          end = 2 + maxDisplayed - 1;
        } else if (props.modelValue >= props.totalPages - 1 - half) {
          // Near the end
          start = props.totalPages - maxDisplayed;
          end = props.totalPages - 1;
        } else {
          // In the middle
          start = props.modelValue - half;
          end = props.modelValue + half;
        }
      }

      start = Math.max(start, 2);
      end = Math.min(end, props.totalPages - 1);

      //  range of pages
      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    });

    const showLeftEllipsis = computed(() => {
      return displayedPages.value.length > 0 && displayedPages.value[0] > 2;
    });

    const showRightEllipsis = computed(() => {
      return (
        displayedPages.value.length > 0 &&
        displayedPages.value[displayedPages.value.length - 1] <
          props.totalPages - 1
      );
    });

    const handleGoToPage = () => {
      const page = parseInt(goToPageInput.value);
      if (!isNaN(page) && page >= 1 && page <= props.totalPages) {
        emit("update:modelValue", page);
      }
      goToPageInput.value = "";
    };

    return {
      goToPageInput,
      currentPage,
      displayedPages,
      showLeftEllipsis,
      showRightEllipsis,
      handleGoToPage,
    };
  },
};
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>

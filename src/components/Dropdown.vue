<template>
  <div
    class="relative dropdown-container"
    style="z-index: 50"
    @click.stop="toggleDropdown"
  >
    <div
      class="px-5 py-2 rounded-lg bg-graytint text-text border border-text/20 flex justify-between items-center cursor-pointer hover:bg-graytint/80 transition-colors duration-200"
    >
      <span>{{ displayValue }}</span>
      <ChevronDownIcon
        class="h-4 w-4 ml-2 text-text/60 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-text/10 overflow-hidden"
      >
        <div
          v-for="option in options"
          :key="option.value"
          @click="selectOption(option)"
          class="px-5 py-2 text-text hover:bg-blue1/10 cursor-pointer transition-colors duration-150 last:border-b-0 border-b border-text/10"
          :class="{
            'bg-blue1/10': modelValue === option.value,
            'hover:bg-blue1/20': modelValue === option.value,
          }"
        >
          {{ option.label }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  options: {
    type: Array,
    default: () => [
      { value: "", label: "All Time" },
      { value: "today", label: "Today" },
      { value: "week", label: "This Week" },
      { value: "month", label: "This Month" },
    ],
  },
});

const emit = defineEmits(["update:modelValue"]);
const isOpen = ref(false);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = (event) => {
  if (!event.target.closest(".dropdown-container")) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
});

const selectOption = (option) => {
  emit("update:modelValue", option.value);
  isOpen.value = false;
};

const displayValue = computed(() => {
  const selectedOption = props.options.find(
    (opt) => opt.value === props.modelValue
  );
  return selectedOption ? selectedOption.label : "Select an option";
});
</script>

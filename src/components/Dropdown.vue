<template>
  <div
    class="relative dropdown-container"
    style="z-index: 50"
    @click.stop="!disabled && toggleDropdown()"
  >
    <div
      class="px-5 py-2 rounded-lg bg-graytint text-text border border-text/20 flex justify-between items-center cursor-pointer hover:bg-graytint/80 transition-colors duration-200"
      :class="{ 'cursor-not-allowed': disabled }"
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
        v-if="isOpen && !disabled"
        class="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-text/10 overflow-hidden"
      >
        <div
          class="max-h-[280px] overflow-y-auto"
          :class="{ 'overflow-y-scroll': options.length > 7 }"
        >
          <div
            v-for="option in options"
            :key="option.value"
            @click.stop="selectOption(option)"
            class="px-5 py-2 text-text hover:bg-blue1/10 cursor-pointer transition-colors duration-150 last:border-b-0 border-b border-text/10"
            :class="{
              'bg-blue1/10': modelValue === option.value,
              'hover:bg-blue1/20': modelValue === option.value,
            }"
          >
            {{ option.label }}
          </div>
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
    type: [String, Number, Boolean, Object],
    default: "",
  },
  options: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(
        (option) =>
          option.hasOwnProperty("value") && option.hasOwnProperty("label")
      );
    },
  },
  placeholder: {
    type: String,
    default: "Select an option",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);
const isOpen = ref(false);

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
  }
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
  if (!props.disabled) {
    emit("update:modelValue", option.value);
    isOpen.value = false;
  }
};

const displayValue = computed(() => {
  const selectedOption = props.options.find(
    (opt) => opt.value === props.modelValue
  );
  return selectedOption ? selectedOption.label : props.placeholder;
});
</script>

<script>
export default {
  props: {
    modelValue: {
      type: [String, Object],
      default: "",
    },
    options: {
      type: Array,
      required: true,
    },
    placeholder: {
      type: String,
      default: "Select an option",
    },
    searchable: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

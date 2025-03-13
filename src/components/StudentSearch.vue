<template>
  <div class="flex items-center relative">
    <button
      type="button"
      @click="toggleSearch"
      class="bg-graytint text-text p-3 rounded-lg hover:bg-blue1 hover:text-white mr-1 border-text/20 border"
      title="Search Student"
    >
      <Search class="size-4" />
    </button>

    <!-- Student Dropdown (hidden when search is active) -->
    <div
      class="flex-1 relative transition-all duration-300"
      :class="{ 'opacity-0 w-0 overflow-hidden': isSearchActive }"
    >
      <slot name="dropdown"></slot>
    </div>

    <!-- Student Search Component -->
    <div
      class="flex-1 absolute left-10 transition-all duration-300 transform flex items-center"
      :class="
        isSearchActive
          ? 'translate-x-0 opacity-100'
          : '-translate-x-8 opacity-0 pointer-events-none'
      "
    >
      <input
        v-model="searchQuery"
        @input="searchStudents"
        placeholder="Search by name or ID"
        class="w-full px-4 py-2 rounded-lg bg-graytint ml-2"
      />
      <button
        type="button"
        @click="toggleSearch"
        class="text-gray-500 hover:text-gray-700 ml-2"
      >
        <X class="size-4" />
      </button>
    </div>

    <slot name="add-button"></slot>

    <!-- Search Results -->
    <div
      v-if="isSearchActive && searchResults.length > 0"
      class="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-md z-10"
    >
      <div
        v-for="student in searchResults"
        :key="student.id"
        @click="selectStudent(student)"
        class="p-3 hover:bg-blue1/10 cursor-pointer border-b last:border-b-0 flex items-center gap-3"
        style="z-index: 9999"
      >
        <div class="w-8 h-8 rounded-full bg-blue1/20 overflow-hidden">
          <img
            v-if="student.profileImage"
            :src="student.profileImage"
            class="w-full h-full object-cover"
            alt="Student Profile"
          />
        </div>
        <div>
          <p class="font-medium">
            {{ student.firstName }} {{ student.lastName }}
          </p>
          <p class="text-sm text-gray-600">{{ student.studentId }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { Search, X } from "lucide-vue-next";

export default {
  name: "StudentSearch",
  components: {
    Search,
    X,
  },
  props: {
    students: {
      type: Array,
      required: true,
    },
  },
  emits: ["select-student"],
  setup(props, { emit }) {
    const isSearchActive = ref(false);
    const searchQuery = ref("");
    const searchResults = ref([]);

    const toggleSearch = () => {
      isSearchActive.value = !isSearchActive.value;
      if (!isSearchActive.value) {
        searchQuery.value = "";
        searchResults.value = [];
      }
    };

    const searchStudents = () => {
      if (!searchQuery.value.trim()) {
        searchResults.value = [];
        return;
      }

      const query = searchQuery.value.toLowerCase();
      searchResults.value = props.students.filter(
        (student) =>
          student.studentId.toLowerCase().includes(query) ||
          student.firstName.toLowerCase().includes(query) ||
          student.lastName.toLowerCase().includes(query) ||
          `${student.firstName} ${student.lastName}`
            .toLowerCase()
            .includes(query)
      );
    };

    const selectStudent = (student) => {
      emit("select-student", student);
      toggleSearch();
    };

    // Clear results when students prop changes
    watch(
      () => props.students,
      () => {
        if (searchQuery.value) {
          searchStudents();
        }
      }
    );

    return {
      isSearchActive,
      searchQuery,
      searchResults,
      toggleSearch,
      searchStudents,
      selectStudent,
    };
  },
};
</script>

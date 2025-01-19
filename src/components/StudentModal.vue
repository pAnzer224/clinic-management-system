<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    @click="handleBackgroundClick"
  >
    <div
      class="bg-white rounded-2xl p-8 shadow-lg w-[800px] max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <h2 class="text-xl font-satoshi-bold mb-6">
        {{ isEditing ? "Edit" : "Add" }} Student
      </h2>
      <form @submit.prevent="submitForm">
        <div class="space-y-12">
          <div class="flex justify-center mb-4">
            <div class="relative">
              <div class="w-24 h-24 rounded-full bg-blue1/10 overflow-hidden">
                <img
                  v-if="imagePreview"
                  :src="imagePreview"
                  class="w-full h-full object-cover"
                  alt="Profile Preview"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                @change="handleImageChange"
                class="hidden"
                ref="fileInput"
              />
              <button
                type="button"
                @click="$refs.fileInput.click()"
                class="absolute bottom-0 right-0 bg-blue1 text-white p-2 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Form Sections -->
          <div
            v-for="section in FORM_SECTIONS"
            :key="section.title"
            class="space-y-4"
          >
            <h3 class="font-satoshi-bold text-md mb-3">{{ section.title }}</h3>
            <div :class="section.grid">
              <div
                v-for="field in section.fields"
                :key="field.name"
                :class="field.class || ''"
              >
                <label class="block mb-1">{{ field.label }}</label>
                <template v-if="field.type === 'select'">
                  <select
                    v-model="formData[field.name]"
                    class="w-full px-4 py-2 rounded-lg bg-graytint"
                    required
                  >
                    <option v-for="opt in field.options" :key="opt">
                      {{ opt }}
                    </option>
                  </select>
                </template>
                <template v-else-if="field.name === 'labTest'">
                  <div class="relative">
                    <input
                      :id="field.name"
                      @change="handleFileChange"
                      type="file"
                      :accept="field.accept"
                      class="hidden"
                      ref="labTestInput"
                    />
                    <label
                      :for="field.name"
                      class="flex items-center gap-2 w-full px-4 py-2 rounded-full bg-graytint cursor-pointer hover:bg-gray-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <span class="text-sm">{{
                        formData.labTest ? "Change file" : "Choose file"
                      }}</span>
                      <span
                        v-if="formData.labTest"
                        class="text-sm text-blue1 ml-2"
                      >
                        (File selected)
                      </span>
                    </label>
                  </div>
                </template>
                <template v-else>
                  <input
                    v-model="formData[field.name]"
                    :type="field.type"
                    class="w-full px-4 py-2 rounded-lg bg-graytint"
                    required
                  />
                </template>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-6">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue1 text-white rounded-full hover:bg-blue-700"
          >
            {{ isEditing ? "Update" : "Add" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { handleImageUpload } from "@/utils/image-utils";

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const COURSE_OPTIONS = ["BSCRIM", "BSED", "BSIT", "BSAB", "HM"];

const FORM_SECTIONS = [
  {
    title: "Personal Information",
    grid: "grid grid-cols-3 gap-4",
    fields: [
      { name: "studentId", label: "Student ID", type: "text" },
      { name: "lastName", label: "Last Name", type: "text" },
      { name: "firstName", label: "First Name", type: "text" },
      { name: "middleInitial", label: "Middle Initial", type: "text" },
      { name: "age", label: "Age", type: "text" },
      {
        name: "sex",
        label: "Sex",
        type: "select",
        options: ["Male", "Female"],
      },
      { name: "nationality", label: "Nationality", type: "text" },
      {
        name: "address",
        label: "Address",
        type: "text",
        class: "col-span-2",
      },
      { name: "religion", label: "Religion", type: "text" },
    ],
  },
  {
    title: "Academic Information",
    grid: "grid grid-cols-2 gap-4",
    fields: [
      {
        name: "course",
        label: "Course",
        type: "select",
        options: COURSE_OPTIONS,
      },
      {
        name: "yearLevel",
        label: "Year Level",
        type: "select",
        options: YEAR_OPTIONS,
      },
    ],
  },
  {
    title: "Emergency Contact",
    grid: "grid grid-cols-2 gap-4",
    fields: [
      { name: "guardianName", label: "Parent/Guardian Name", type: "text" },
      { name: "guardianOccupation", label: "Occupation", type: "text" },
      { name: "guardianAddress", label: "Address", type: "text" },
      { name: "guardianContact", label: "Contact Number", type: "tel" },
    ],
  },
  {
    title: "Documents",
    grid: "grid grid-cols-2 gap-4",
    fields: [
      {
        name: "labTest",
        label: "Lab Test Results",
        type: "file",
        accept: ".pdf,.doc,.docx",
      },
    ],
  },
];

export default {
  name: "StudentModal",
  props: {
    modelValue: Boolean,
    isEditing: Boolean,
    initialFormData: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue", "submit"],
  setup(props, { emit }) {
    const formData = ref({ ...props.initialFormData });
    const imagePreview = ref(props.initialFormData.profileImage || null);

    async function handleImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        const base64 = await handleImageUpload(file);
        imagePreview.value = base64;
        formData.value.profileImage = base64;
      }
    }

    async function handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          formData.value.labTest = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }

    function closeModal() {
      emit("update:modelValue", false);
    }

    function handleBackgroundClick(event) {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    }

    function submitForm() {
      emit("submit", formData.value);
      closeModal();
    }

    return {
      formData,
      imagePreview,
      FORM_SECTIONS,
      handleImageChange,
      handleFileChange,
      closeModal,
      handleBackgroundClick,
      submitForm,
    };
  },
};
</script>

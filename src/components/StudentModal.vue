<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 flex justify-center items-center z-[9999]"
  >
    <div class="fixed inset-0 bg-black/50" @click="handleBackgroundClick"></div>
    <div
      class="relative bg-white rounded-2xl p-8 shadow-lg w-[700px] h-[90vh] overflow-hidden z-[9999]"
      @click.stop
    >
      <div class="sticky top-0 bg-white z-20 mb-6">
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-xl font-satoshi-bold">
            {{ isEditing ? "Student Details" : "New Student" }}
          </h2>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
            <XIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="flex items-center text-sm text-gray-600 gap-2">
          <span
            :class="{ 'text-blue1 font-medium': currentStep === 1 }"
            @click="currentStep = 1"
            class="cursor-pointer hover:text-blue1/70 transition-colors"
            >Student Information</span
          >
          <ChevronRightIcon class="w-4 h-4" />
          <span
            v-if="isEditing"
            :class="{ 'text-blue1 font-medium': currentStep === 2 }"
            @click="currentStep = 2"
            class="cursor-pointer hover:text-blue1/70 transition-colors"
            >Documents</span
          >
          <ChevronRightIcon v-if="isEditing" class="w-4 h-4" />
          <span
            v-if="isEditing"
            :class="{ 'text-blue1 font-medium': currentStep === 3 }"
            @click="currentStep = 3"
            class="cursor-pointer hover:text-blue1/70 transition-colors"
            >Medical Records</span
          >
          <ChevronRightIcon v-if="!isEditing" class="w-4 h-4" />
          <span
            v-if="!isEditing"
            :class="{ 'text-blue1 font-medium': currentStep === 2 }"
            @click="currentStep = 2"
            class="cursor-pointer hover:text-blue1/70 transition-colors"
            >Health Information</span
          >
          <ChevronRightIcon v-if="!isEditing" class="w-4 h-4" />
          <span
            v-if="!isEditing"
            :class="{ 'text-blue1 font-medium': currentStep === 3 }"
            @click="currentStep = 3"
            class="cursor-pointer hover:text-blue1/70 transition-colors"
            >Physical Exam</span
          >
          <ChevronRightIcon v-if="!isEditing" class="w-4 h-4" />
          <span
            v-if="!isEditing"
            :class="{ 'text-blue1 font-medium': currentStep === 4 }"
            @click="currentStep = 4"
            class="cursor-pointer hover:text-blue1/70 transition-colors"
            >Required Documents</span
          >
        </div>
      </div>

      <div class="flex flex-col h-[calc(90vh-88px-64px)]">
        <div
          ref="formScrollContainer"
          class="flex-1 overflow-y-scroll no-scrollbar pr-4"
        >
          <form @submit.prevent="handleFormSubmit" class="space-y-6">
            <div v-if="currentStep === 1" class="pb-20">
              <div v-if="!isEditing" class="flex justify-center mb-4">
                <div class="relative">
                  <div
                    class="w-24 h-24 rounded-full bg-blue1/10 overflow-hidden"
                  >
                    <img
                      v-if="imagePreview || formData.profileImage"
                      :src="imagePreview || formData.profileImage"
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
                    <PencilIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div v-if="isEditing" class="flex justify-center mb-4">
                <div class="relative">
                  <div
                    class="w-24 h-24 rounded-full bg-blue1/10 overflow-hidden"
                  >
                    <img
                      v-if="imagePreview || formData.profileImage"
                      :src="imagePreview || formData.profileImage"
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
                    @click="isEditMode ? $refs.fileInput.click() : null"
                    :class="[
                      'absolute bottom-0 right-0 p-2 rounded-full',
                      isEditMode
                        ? 'bg-blue1 text-white'
                        : 'bg-gray-300 text-gray-500',
                    ]"
                    :disabled="!isEditMode"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <h3 class="font-satoshi-bold">Personal Information</h3>
                  <button
                    v-if="isEditing"
                    type="button"
                    @click="toggleEditMode"
                    class="text-sm text-blue1 hover:text-blue1/80 transition-colors"
                  >
                    {{ isEditMode ? "View Only Mode" : "Enable Editing" }}
                  </button>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <input
                    v-model="formData.personalInfo.studentId"
                    placeholder="Student ID"
                    class="px-4 py-2 rounded-lg bg-graytint transition-opacity"
                    :class="{ 'opacity-70': isEditing && !isEditMode }"
                    :disabled="isEditing && !isEditMode"
                    required
                  />
                  <input
                    v-model="formData.personalInfo.lastName"
                    placeholder="Last Name"
                    class="px-4 py-2 rounded-lg bg-graytint transition-opacity"
                    :class="{ 'opacity-70': isEditing && !isEditMode }"
                    :disabled="isEditing && !isEditMode"
                    required
                  />
                  <input
                    v-model="formData.personalInfo.firstName"
                    placeholder="First Name"
                    class="px-4 py-2 rounded-lg bg-graytint transition-opacity"
                    :class="{ 'opacity-70': isEditing && !isEditMode }"
                    :disabled="isEditing && !isEditMode"
                    required
                  />
                  <input
                    v-model="formData.personalInfo.middleInitial"
                    placeholder="Middle Initial"
                    class="px-4 py-2 rounded-lg bg-graytint transition-opacity"
                    :class="{ 'opacity-70': isEditing && !isEditMode }"
                    :disabled="isEditing && !isEditMode"
                  />
                  <input
                    v-model="formData.personalInfo.age"
                    placeholder="Age"
                    type="number"
                    class="px-4 py-2 rounded-lg bg-graytint transition-opacity"
                    :class="{ 'opacity-70': isEditing && !isEditMode }"
                    :disabled="isEditing && !isEditMode"
                    required
                  />
                  <Dropdown
                    v-model="formData.personalInfo.sex"
                    :options="sexOptions"
                    :disabled="isEditing && !isEditMode"
                    :class="{ 'opacity-70': isEditing && !isEditMode }"
                  />
                  <input
                    v-model="formData.personalInfo.nationality"
                    placeholder="Nationality"
                    class="px-4 py-2 rounded-lg bg-graytint transition-opacity"
                    :class="{ 'opacity-70': isEditing && !isEditMode }"
                    :disabled="isEditing && !isEditMode"
                    required
                  />
                  <input
                    v-model="formData.personalInfo.religion"
                    placeholder="Religion"
                    class="px-4 py-2 rounded-lg bg-graytint transition-opacity"
                    :class="{ 'opacity-70': isEditing && !isEditMode }"
                    :disabled="isEditing && !isEditMode"
                    required
                  />
                </div>
                <textarea
                  v-model="formData.personalInfo.address"
                  placeholder="Address"
                  class="w-full px-4 py-2 rounded-lg bg-graytint transition-opacity"
                  :class="{ 'opacity-70': isEditing && !isEditMode }"
                  :disabled="isEditing && !isEditMode"
                  required
                ></textarea>
              </div>

              <div class="space-y-4 mb-4">
                <h3 class="font-satoshi-bold">Academic Information</h3>
                <div class="grid grid-cols-2 gap-4">
                  <Dropdown
                    v-model="formData.academicInfo.course"
                    style="z-index: 999"
                    :options="courseOptions"
                    :disabled="isEditing && !isEditMode"
                    :class="{ 'opacity-70': isEditing && !isEditMode }"
                  />
                  <Dropdown
                    v-model="formData.academicInfo.yearLevel"
                    :options="yearLevelOptions"
                    :disabled="isEditing && !isEditMode"
                    :class="{ 'opacity-70': isEditing && !isEditMode }"
                  />
                  <Dropdown
                    v-model="formData.academicInfo.schoolYear"
                    :options="schoolYearOptions"
                    :disabled="isEditing && !isEditMode"
                    :class="{ 'opacity-70': isEditing && !isEditMode }"
                  />
                </div>
              </div>

              <div class="space-y-4">
                <h3 class="font-satoshi-bold">Emergency Contact</h3>
                <div class="grid grid-cols-2 gap-4">
                  <input
                    v-model="formData.emergencyContact.guardianName"
                    placeholder="Guardian Name"
                    class="px-4 py-2 rounded-lg bg-graytint transition-opacity"
                    :class="{ 'opacity-70': isEditing && !isEditMode }"
                    :disabled="isEditing && !isEditMode"
                    required
                  />
                  <input
                    v-model="formData.emergencyContact.guardianOccupation"
                    placeholder="Guardian Occupation"
                    class="px-4 py-2 rounded-lg bg-graytint transition-opacity"
                    :class="{ 'opacity-70': isEditing && !isEditMode }"
                    :disabled="isEditing && !isEditMode"
                    required
                  />
                  <input
                    v-model="formData.emergencyContact.guardianContact"
                    placeholder="Guardian Contact"
                    class="px-4 py-2 rounded-lg bg-graytint transition-opacity"
                    :class="{ 'opacity-70': isEditing && !isEditMode }"
                    :disabled="isEditing && !isEditMode"
                    required
                  />
                </div>
                <textarea
                  v-model="formData.emergencyContact.guardianAddress"
                  placeholder="Guardian Address"
                  class="w-full px-4 py-2 rounded-lg bg-graytint transition-opacity"
                  :class="{ 'opacity-70': isEditing && !isEditMode }"
                  :disabled="isEditing && !isEditMode"
                  required
                ></textarea>
              </div>
            </div>

            <div v-if="currentStep === 2 && !isEditing" class="pb-20">
              <div class="space-y-4">
                <h3 class="font-satoshi-bold">Health Information</h3>
                <HealthExamForm
                  ref="healthExamFormRef"
                  :formData="formData.healthExamData"
                  @update:formData="updateHealthExamData"
                />
              </div>
            </div>

            <div v-if="currentStep === 3 && !isEditing" class="pb-20">
              <div class="space-y-4">
                <h3 class="font-satoshi-bold">Physical Examination</h3>
                <PhysicalExamForm
                  ref="physicalExamFormRef"
                  :formData="formData.physicalExamData"
                  @update:formData="updatePhysicalExamData"
                />
              </div>
            </div>

            <!-- Medical Records section -->
            <div v-if="currentStep === 3 && isEditing" class="pb-20">
              <MedicalRecords :records="medicalRecords" />
            </div>

            <div
              v-if="
                (isEditing && currentStep === 2) ||
                (!isEditing && currentStep === 4)
              "
              class="pb-20"
            >
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <h3 class="font-satoshi-bold">
                    {{ isEditing ? "Documents" : "Required Documents" }}
                  </h3>
                  <button
                    v-if="isEditing"
                    type="button"
                    @click="toggleEditMode"
                    class="text-sm text-blue1 font-medium hover:text-blue1/80 transition-colors"
                  >
                    {{ isEditMode ? "View Only Mode" : "Enable Editing" }}
                  </button>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div
                    v-for="(label, key) in documentLabels"
                    :key="key"
                    class="space-y-2"
                  >
                    <label class="text-md text-text/80">{{ label }}</label>
                    <div class="flex items-center gap-2">
                      <input
                        type="file"
                        :accept="acceptedDocumentTypes"
                        class="hidden"
                        :ref="key"
                        @change="(e) => handleDocumentChange(e, key)"
                      />
                      <button
                        type="button"
                        @click="
                          isEditing && !isEditMode
                            ? null
                            : $refs[key][0].click()
                        "
                        class="px-4 py-2 bg-blue1/10 text-blue1 rounded-lg flex-grow text-left text-sm transition-opacity"
                        :class="{
                          'opacity-70 cursor-not-allowed':
                            isEditing && !isEditMode,
                        }"
                        :disabled="isEditing && !isEditMode"
                      >
                        {{
                          formData.documents[key]
                            ? "Change Document"
                            : "Upload Document"
                        }}
                      </button>
                      <button
                        v-if="formData.documents[key]"
                        type="button"
                        @click="viewDocument(formData.documents[key])"
                        class="p-2 text-blue1"
                      >
                        <EyeIcon class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div
        class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent"
        style="z-index: 9999; height: 150px"
      >
        <div
          class="absolute bottom-0 left-0 right-0 py-10 px-8 flex justify-end gap-4"
        >
          <button
            v-if="currentStep > 1"
            type="button"
            @click="handlePrevious"
            class="px-6 py-2 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors"
          >
            Previous
          </button>
          <button
            v-if="currentStep === 1"
            type="button"
            @click="closeModal"
            class="px-6 py-2 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            v-if="isEditing || (!isEditing && currentStep === 4)"
            type="button"
            @click="handleFormSubmit"
            class="px-6 py-2 bg-blue1 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            {{ isEditing ? "Update" : "Save" }} Student
          </button>
          <button
            v-if="
              (!isEditing && currentStep < 4) || (isEditing && currentStep < 3)
            "
            type="button"
            @click="handleNext"
            class="px-6 py-2 bg-blue1 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <DocumentViewerModal
      :show="showDocumentViewer"
      :documentUrl="selectedDocument"
      @close="showDocumentViewer = false"
    />
  </div>
</template>

<script>
import {
  X as XIcon,
  Pencil as PencilIcon,
  Eye as EyeIcon,
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  Inbox as InboxIcon,
} from "lucide-vue-next";
import HealthExamForm from "./HealthExamForm.vue";
import PhysicalExamForm from "./PhysicalExamForm.vue";
import Dropdown from "./Dropdown.vue";
import DocumentViewerModal from "./DocumentViewerModal.vue";
import {
  useStudentModal,
  courseOptions,
  yearLevelOptions,
  schoolYearOptions,
  sexOptions,
  documentLabels,
  acceptedDocumentTypes,
} from "@/composables/studentManagement";
import MedicalRecords from "./MedicalRecords.vue";
import { ref, onMounted, watch, computed } from "vue";

export default {
  name: "StudentModal",
  components: {
    XIcon,
    PencilIcon,
    EyeIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    InboxIcon,
    HealthExamForm,
    PhysicalExamForm,
    Dropdown,
    DocumentViewerModal,
    MedicalRecords,
  },
  props: {
    modelValue: Boolean,
    isEditing: Boolean,
    initialFormData: {
      type: Object,
      required: true,
    },
    appointments: {
      type: Array,
      default: () => [],
    },
    medicalRecords: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:modelValue", "submit"],
  setup(props, { emit }) {
    const modalFunctions = useStudentModal(props, emit);
    const isEditMode = ref(false);
    const formScrollContainer = ref(null);
    const imagePreview = ref(null);
    const documentFiles = ref({});

    // Lazy loading of component data
    const lazyLoadData = () => {
      // Only load medical records when we're on the medical records step
      if (modalFunctions.currentStep.value === 3 && props.isEditing) {
        // You can add a small timeout to ensure the modal appears before loading the data
        setTimeout(() => {}, 50);
      }
    };

    // Add this function to optimize document handling
    const optimizedHandleDocumentChange = (e, key) => {
      const file = e.target.files[0];
      if (!file) return;

      // Use createObjectURL instead of FileReader when possible
      // This is faster for UI display purposes
      modalFunctions.formData.value.documents[key] = URL.createObjectURL(file);

      // Only store the actual file if needed for upload
      documentFiles.value[key] = file;
    };

    const toggleEditMode = () => {
      isEditMode.value = !isEditMode.value;
    };

    const medicalRecords = computed(() => {
      return props.medicalRecords || [];
    });

    // Watch for step changes to lazy load data
    watch(modalFunctions.currentStep, (newStep) => {
      lazyLoadData();
    });

    onMounted(() => {
      // Delay heavy operations
      setTimeout(() => {
        // Initialize data for the current step only
        lazyLoadData();
      }, 50);
    });

    return {
      ...modalFunctions,
      courseOptions,
      yearLevelOptions,
      schoolYearOptions,
      sexOptions,
      documentLabels,
      acceptedDocumentTypes,
      isEditMode,
      toggleEditMode,
      medicalRecords,
      formScrollContainer,
      imagePreview,
      handleDocumentChange: optimizedHandleDocumentChange,
      documentFiles,
    };
  },
};
</script>

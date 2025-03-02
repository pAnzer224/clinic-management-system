<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 bg-text/50 flex justify-center items-center"
    @click="handleBackgroundClick"
  >
    <div
      class="bg-white rounded-2xl p-8 shadow-lg w-[700px] h-[90vh] overflow-hidden"
      @click.stop
    >
      <div v-if="!isEditing" class="sticky top-0 bg-white z-20 mb-6">
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-xl font-satoshi-bold">New Student</h2>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="flex items-center text-sm text-gray-600 gap-2">
          <span :class="{ 'text-blue1 font-medium': currentStep === 1 }"
            >Student Information</span
          >
          <ChevronRightIcon class="w-4 h-4" />
          <span :class="{ 'text-blue1 font-medium': currentStep === 2 }"
            >Health Information</span
          >
          <ChevronRightIcon class="w-4 h-4" />
          <span :class="{ 'text-blue1 font-medium': currentStep === 3 }"
            >Physical Exam</span
          >
          <ChevronRightIcon class="w-4 h-4" />
          <span :class="{ 'text-blue1 font-medium': currentStep === 4 }"
            >Required Documents</span
          >
        </div>
      </div>

      <div v-else class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-satoshi-bold">Edit Student</h2>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <div class="flex gap-6 h-[calc(90vh-88px)]">
        <div v-if="isEditing" class="w-60 flex-shrink-0 flex flex-col">
          <div class="bg-graytint/50 rounded-xl p-4 sticky top-0 z-10">
            <h3 class="font-satoshi-bold mb-4">Student Information</h3>
            <div class="space-y-3">
              <div class="bg-white p-3 rounded-lg shadow-sm">
                <div class="flex items-center gap-3 mb-3">
                  <div
                    class="w-12 h-12 rounded-full bg-blue1/10 overflow-hidden"
                  >
                    <img
                      v-if="formData.profileImage"
                      :src="formData.profileImage"
                      class="w-full h-full object-cover"
                      alt="Student Profile"
                    />
                  </div>
                  <div>
                    <p class="font-medium">
                      {{ formData.personalInfo.firstName }}
                      {{ formData.personalInfo.lastName }}
                    </p>
                    <p class="text-sm text-gray-600">
                      {{ formData.personalInfo.studentId }}
                    </p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p class="text-gray-500">Course</p>
                    <p class="font-medium">
                      {{ formData.academicInfo.course }}
                    </p>
                  </div>
                  <div>
                    <p class="text-gray-500">Year Level</p>
                    <p class="font-medium">
                      {{ formData.academicInfo.yearLevel }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 space-y-4 flex-grow overflow-y-scroll no-scrollbar">
            <StudentAccordion
              :documents="formData.documents"
              :documentLabels="documentLabels"
              :studentId="formData.personalInfo.studentId"
              :acceptedDocumentTypes="acceptedDocumentTypes"
              @document-updated="updateDocument"
            />
          </div>
        </div>

        <div
          ref="formScrollContainer"
          class="flex-1 overflow-y-scroll no-scrollbar pr-4"
        >
          <form @submit.prevent="handleFormSubmit" class="space-y-6">
            <div v-if="currentStep === 1">
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

              <div class="space-y-4">
                <h3 class="font-satoshi-bold">Personal Information</h3>
                <div class="grid grid-cols-2 gap-4">
                  <input
                    v-model="formData.personalInfo.studentId"
                    placeholder="Student ID"
                    class="px-4 py-2 rounded-lg bg-graytint"
                    required
                  />
                  <input
                    v-model="formData.personalInfo.lastName"
                    placeholder="Last Name"
                    class="px-4 py-2 rounded-lg bg-graytint"
                    required
                  />
                  <input
                    v-model="formData.personalInfo.firstName"
                    placeholder="First Name"
                    class="px-4 py-2 rounded-lg bg-graytint"
                    required
                  />
                  <input
                    v-model="formData.personalInfo.middleInitial"
                    placeholder="Middle Initial"
                    class="px-4 py-2 rounded-lg bg-graytint"
                  />
                  <input
                    v-model="formData.personalInfo.age"
                    placeholder="Age"
                    type="number"
                    class="px-4 py-2 rounded-lg bg-graytint"
                    required
                  />
                  <Dropdown
                    v-model="formData.personalInfo.sex"
                    :options="sexOptions"
                  />
                  <input
                    v-model="formData.personalInfo.nationality"
                    placeholder="Nationality"
                    class="px-4 py-2 rounded-lg bg-graytint"
                    required
                  />
                  <input
                    v-model="formData.personalInfo.religion"
                    placeholder="Religion"
                    class="px-4 py-2 rounded-lg bg-graytint"
                    required
                  />
                </div>
                <textarea
                  v-model="formData.personalInfo.address"
                  placeholder="Address"
                  class="w-full px-4 py-2 rounded-lg bg-graytint"
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
                  />
                  <Dropdown
                    v-model="formData.academicInfo.yearLevel"
                    :options="yearLevelOptions"
                  />
                  <Dropdown
                    v-model="formData.academicInfo.schoolYear"
                    :options="schoolYearOptions"
                  />
                </div>
              </div>

              <div class="space-y-4">
                <h3 class="font-satoshi-bold">Emergency Contact</h3>
                <div class="grid grid-cols-2 gap-4">
                  <input
                    v-model="formData.emergencyContact.guardianName"
                    placeholder="Guardian Name"
                    class="px-4 py-2 rounded-lg bg-graytint"
                    required
                  />
                  <input
                    v-model="formData.emergencyContact.guardianOccupation"
                    placeholder="Guardian Occupation"
                    class="px-4 py-2 rounded-lg bg-graytint"
                    required
                  />
                  <input
                    v-model="formData.emergencyContact.guardianContact"
                    placeholder="Guardian Contact"
                    class="px-4 py-2 rounded-lg bg-graytint"
                    required
                  />
                </div>
                <textarea
                  v-model="formData.emergencyContact.guardianAddress"
                  placeholder="Guardian Address"
                  class="w-full px-4 py-2 rounded-lg bg-graytint"
                  required
                ></textarea>
              </div>
            </div>

            <div v-if="currentStep === 2">
              <div class="space-y-4">
                <h3 class="font-satoshi-bold">Health Information</h3>
                <HealthExamForm
                  ref="healthExamFormRef"
                  :formData="formData.healthExamData"
                  @update:formData="updateHealthExamData"
                />
              </div>
            </div>

            <div v-if="currentStep === 3">
              <div class="space-y-4">
                <h3 class="font-satoshi-bold">Physical Examination</h3>
                <PhysicalExamForm
                  ref="physicalExamFormRef"
                  :formData="formData.physicalExamData"
                  @update:formData="updatePhysicalExamData"
                />
              </div>
            </div>

            <div v-if="currentStep === 4">
              <div class="space-y-4">
                <h3 class="font-satoshi-bold">Required Documents</h3>
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
                        @click="$refs[key][0].click()"
                        class="px-4 py-2 bg-blue1/10 text-blue1 rounded-lg flex-grow text-left text-sm"
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

            <div class="flex justify-end gap-4">
              <button
                v-if="currentStep > 1 && !isEditing"
                type="button"
                @click="handlePrevious"
                class="px-6 py-2 bg-gray-300 rounded-full hover:bg-gray-400 mb-8"
              >
                Previous
              </button>
              <button
                v-if="!isEditing && currentStep === 1"
                type="button"
                @click="closeModal"
                class="px-6 py-2 bg-gray-300 rounded-full hover:bg-gray-400 mb-8"
              >
                Cancel
              </button>
              <button
                v-if="isEditing || (!isEditing && currentStep === 4)"
                type="submit"
                class="mb-8 px-6 py-2 bg-blue1 text-white rounded-full hover:bg-blue-700"
              >
                {{ isEditing ? "Update" : "Save" }} Student
              </button>
              <button
                v-if="!isEditing && currentStep < 4"
                type="button"
                @click="handleNext"
                class="px-6 py-2 bg-blue1 text-white rounded-full hover:bg-blue-700 mb-8"
              >
                Next
              </button>
            </div>
          </form>
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
  XMarkIcon,
  PencilIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/solid";
import HealthExamForm from "./HealthExamForm.vue";
import PhysicalExamForm from "./PhysicalExamForm.vue";
import Dropdown from "./Dropdown.vue";
import StudentAccordion from "./StudentAccordion.vue";
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

export default {
  name: "StudentModal",
  components: {
    XMarkIcon,
    PencilIcon,
    EyeIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    HealthExamForm,
    PhysicalExamForm,
    Dropdown,
    StudentAccordion,
    DocumentViewerModal,
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
  },
  emits: ["update:modelValue", "submit"],
  setup(props, { emit }) {
    const modalFunctions = useStudentModal(props, emit);

    return {
      ...modalFunctions,
      courseOptions,
      yearLevelOptions,
      schoolYearOptions,
      sexOptions,
      documentLabels,
      acceptedDocumentTypes,
    };
  },
};
</script>

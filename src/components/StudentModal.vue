<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
    @click="handleBackgroundClick"
  >
    <div
      class="bg-white rounded-2xl p-8 shadow-lg w-[700px] h-[90vh]"
      @click.stop
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-satoshi-bold">
          {{ isEditing ? "Edit" : "New" }} Student
        </h2>
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

          <div
            class="mt-4 bg-graytint/50 rounded-xl p-4 overflow-y-scroll no-scrollbar flex-grow"
          >
            <h3 class="font-satoshi-bold mb-4 sticky top-0 bg-graytint/50 z-10">
              Documents
            </h3>
            <div class="space-y-2">
              <div
                v-for="(label, key) in documentLabels"
                :key="key"
                class="flex justify-between items-center p-3 bg-white rounded-lg hover:bg-gray-50"
              >
                <span class="text-sm">{{ label }}</span>
                <button
                  v-if="formData.documents[key]"
                  @click="viewDocument(formData.documents[key])"
                  class="text-blue1"
                >
                  <EyeIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-scroll no-scrollbar pr-4">
          <form @submit.prevent="submitForm" class="space-y-6">
            <div v-if="!isEditing" class="flex justify-center mb-4">
              <div class="relative">
                <div class="w-24 h-24 rounded-full bg-blue1/10 overflow-hidden">
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

            <div class="space-y-4">
              <h3 class="font-satoshi-bold">Academic Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <Dropdown
                  v-model="formData.academicInfo.course"
                  :options="courseOptions"
                />
                <Dropdown
                  v-model="formData.academicInfo.yearLevel"
                  :options="yearLevelOptions"
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

            <div v-if="!isEditing" class="space-y-4">
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
                      v-if="key !== 'healthExam'"
                      type="file"
                      :accept="acceptedDocumentTypes"
                      class="hidden"
                      :ref="key"
                      @change="(e) => handleDocumentChange(e, key)"
                    />
                    <button
                      v-if="key !== 'healthExam'"
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
                      v-if="key === 'healthExam'"
                      type="button"
                      @click="showHealthExamModal = true"
                      class="px-4 py-2 bg-blue1 text-white rounded-lg"
                    >
                      Fill Health Form
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

            <div class="flex justify-end gap-4">
              <button
                type="button"
                @click="closeModal"
                class="px-6 py-2 bg-gray-300 rounded-full hover:bg-gray-400 mb-8"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="mb-8 px-6 py-2 bg-blue1 text-white rounded-full hover:bg-blue-700"
              >
                {{ isEditing ? "Update" : "Save" }} Student
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="showHealthExamModal"
    class="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
  >
    <div class="bg-white rounded-2xl p-8 w-[50vw] h-[90vh] overflow-hidden">
      <HealthExamForm :onSubmit="handleHealthExamSubmit" />
      <button
        @click="showHealthExamModal = false"
        class="absolute top-4 right-4 text-gray-500"
      >
        <XMarkIcon class="w-6 h-6" />
      </button>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { serverTimestamp } from "firebase/firestore";
import { XMarkIcon, PencilIcon, EyeIcon } from "@heroicons/vue/24/solid";
import { handleImageUpload } from "@/utils/image-utils";
import { handleDocumentUpload } from "@/utils/document-upload-utils";
import { useCRUD } from "@/utils/firebaseCRUD";
import HealthExamForm from "./HealthExamForm.vue";
import Dropdown from "./Dropdown.vue";

const courseOptions = [
  { value: "", label: "Choose a Course" },
  { value: "BSCRIM", label: "BSCRIM" },
  { value: "BEED", label: "BEED" },
  { value: "BSED", label: "BSED" },
  { value: "BSIT", label: "BSIT" },
  { value: "BSAB", label: "BSAB" },
  { value: "HM", label: "HM" },
];

const yearLevelOptions = [
  { value: "1st Year", label: "1st Year" },
  { value: "2nd Year", label: "2nd Year" },
  { value: "3rd Year", label: "3rd Year" },
  { value: "4th Year", label: "4th Year" },
];

const sexOptions = [
  { value: "", label: "Select Sex" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const documentLabels = {
  medicalCertificate: "Medical Certificate",
  urinalysisReport: "Urinalysis Report",
  radiologicReport: "Radiologic Report",
  hematologyReport: "Hematology Report",
  drugTestReport: "Drug Test Report",
  dentalHealthChart: "Dental Health Chart",
  healthExam: "Health Examination Form",
};

const acceptedDocumentTypes =
  ".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export default {
  name: "StudentModal",
  components: {
    XMarkIcon,
    PencilIcon,
    EyeIcon,
    HealthExamForm,
    Dropdown,
  },
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
    const { addItem, updateItem } = useCRUD("students");
    const fileInput = ref(null);
    const imagePreview = ref(null);
    const showHealthExamModal = ref(false);
    const formData = ref({
      profileImage: "",
      personalInfo: {
        studentId: "",
        lastName: "",
        firstName: "",
        middleInitial: "",
        age: "",
        sex: "",
        nationality: "",
        address: "",
        religion: "",
      },
      academicInfo: {
        course: "",
        yearLevel: "",
      },
      emergencyContact: {
        guardianName: "",
        guardianOccupation: "",
        guardianAddress: "",
        guardianContact: "",
      },
      documents: {
        medicalCertificate: "",
        urinalysisReport: "",
        radiologicReport: "",
        hematologyReport: "",
        drugTestReport: "",
        dentalHealthChart: "",
        healthExam: "",
      },
    });

    watch(
      () => props.initialFormData,
      (newVal) => {
        formData.value = {
          profileImage: newVal.profileImage || "",
          personalInfo: {
            studentId: newVal.studentId || "",
            lastName: newVal.lastName || "",
            firstName: newVal.firstName || "",
            middleInitial: newVal.middleInitial || "",
            age: newVal.age || "",
            sex: newVal.sex || "",
            nationality: newVal.nationality || "",
            address: newVal.address || "",
            religion: newVal.religion || "",
          },
          academicInfo: {
            course: newVal.course || "",
            yearLevel: newVal.yearLevel || "",
          },
          emergencyContact: {
            guardianName: newVal.guardianName || "",
            guardianOccupation: newVal.guardianOccupation || "",
            guardianAddress: newVal.guardianAddress || "",
            guardianContact: newVal.guardianContact || "",
          },
          documents: {
            medicalCertificate: newVal.documents?.medicalCertificate || "",
            urinalysisReport: newVal.documents?.urinalysisReport || "",
            radiologicReport: newVal.documents?.radiologicReport || "",
            hematologyReport: newVal.documents?.hematologyReport || "",
            drugTestReport: newVal.documents?.drugTestReport || "",
            dentalHealthChart: newVal.documents?.dentalHealthChart || "",
            healthExam: newVal.documents?.healthExam || "",
          },
        };
        imagePreview.value = newVal.profileImage || null;
      },
      { immediate: true, deep: true }
    );

    async function handleImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        const base64 = await handleImageUpload(file);
        imagePreview.value = base64;
        formData.value.profileImage = base64;
      }
    }

    async function handleDocumentChange(event, documentKey) {
      const file = event.target.files[0];
      if (file) {
        try {
          const fileData = await handleDocumentUpload(file);
          formData.value.documents[documentKey] = fileData.data;
        } catch (error) {
          console.error("Error uploading document:", error);
        }
      }
    }

    async function handleHealthExamSubmit(pdfData) {
      formData.value.documents.healthExam = pdfData;
      showHealthExamModal.value = false;
    }

    function viewDocument(documentData) {
      const newWindow = window.open();
      newWindow.document.write(`
        <iframe src="${documentData}" style="width:100%;height:100vh;border:none;"></iframe>
      `);
    }

    function closeModal() {
      emit("update:modelValue", false);
    }

    function handleBackgroundClick(event) {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    }

    async function submitForm() {
      const submissionData = {
        ...formData.value.personalInfo,
        ...formData.value.academicInfo,
        ...formData.value.emergencyContact,
        profileImage: formData.value.profileImage,
        documents: formData.value.documents,
        id: formData.value.personalInfo.studentId,
        updatedAt: serverTimestamp(),
      };

      if (!props.isEditing) {
        submissionData.createdAt = serverTimestamp();
        await addItem(submissionData);
      } else {
        await updateItem(submissionData);
      }

      closeModal();
    }

    return {
      fileInput,
      formData,
      imagePreview,
      documentLabels,
      acceptedDocumentTypes,
      showHealthExamModal,
      handleImageChange,
      handleDocumentChange,
      viewDocument,
      closeModal,
      handleBackgroundClick,
      submitForm,
      handleHealthExamSubmit,
      courseOptions,
      yearLevelOptions,
      sexOptions,
    };
  },
};
</script>

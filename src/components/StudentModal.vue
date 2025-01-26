<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 flex justify-center items-center bg-black/50"
    @click="handleBackgroundClick"
  >
    <div
      class="bg-white rounded-2xl p-8 shadow-lg w-[60vw] max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-satoshi-bold">
          {{ isEditing ? "Edit" : "Add" }} Student
        </h2>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
          <svg
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitForm">
        <!-- Profile Image Upload -->
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
              <PencilIcon class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="space-y-6">
          <!-- Personal Information -->
          <div>
            <h3 class="font-satoshi-bold mb-4">Personal Information</h3>
            <div class="grid grid-cols-3 gap-4">
              <input
                v-model="formData.studentId"
                placeholder="Student ID"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />
              <input
                v-model="formData.lastName"
                placeholder="Last Name"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />
              <input
                v-model="formData.firstName"
                placeholder="First Name"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />
              <input
                v-model="formData.middleInitial"
                placeholder="Middle Initial"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
              />
              <input
                v-model="formData.age"
                type="number"
                placeholder="Age"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />
              <select
                v-model="formData.sex"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              >
                <option value="" disabled>Select Sex</option>
                <option>Male</option>
                <option>Female</option>
              </select>
              <input
                v-model="formData.nationality"
                placeholder="Nationality"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />
              <input
                v-model="formData.address"
                placeholder="Address"
                class="w-full px-4 py-2 rounded-lg bg-graytint col-span-2"
                required
              />
              <input
                v-model="formData.religion"
                placeholder="Religion"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />
            </div>
          </div>

          <!-- Academic Information -->
          <div>
            <h3 class="font-satoshi-bold mb-4">Academic Information</h3>
            <div class="grid grid-cols-2 gap-4">
              <select
                v-model="formData.course"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              >
                <option value="" disabled>Select Course</option>
                <option>BSCRIM</option>
                <option>BSED</option>
                <option>BSIT</option>
                <option>BSAB</option>
                <option>HM</option>
              </select>
              <select
                v-model="formData.yearLevel"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              >
                <option value="" disabled>Select Year Level</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>
          </div>

          <!-- Emergency Contact -->
          <div>
            <h3 class="font-satoshi-bold mb-4">Emergency Contact</h3>
            <div class="grid grid-cols-2 gap-4">
              <input
                v-model="formData.guardianName"
                placeholder="Parent/Guardian Name"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />
              <input
                v-model="formData.guardianOccupation"
                placeholder="Occupation"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />
              <input
                v-model="formData.guardianAddress"
                placeholder="Address"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />
              <input
                v-model="formData.guardianContact"
                placeholder="Contact Number"
                type="tel"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />
            </div>
          </div>

          <!-- Documents -->
          <div>
            <h3 class="font-satoshi-bold mb-4">Documents</h3>
            <div class="space-y-4">
              <!-- Medical Certificate -->
              <div class="relative">
                <input
                  type="file"
                  @change="handleFileChange('medicalCertificate', $event)"
                  accept=".pdf,.doc,.docx"
                  class="hidden"
                  ref="medicalCertificateInput"
                />
                <div class="flex gap-2">
                  <label
                    @click="$refs.medicalCertificateInput.click()"
                    class="flex items-center gap-2 flex-1 px-4 py-2 rounded-md bg-graytint cursor-pointer hover:bg-gray-100"
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
                    <span class="text-sm">
                      {{
                        formData.medicalCertificate
                          ? "Change file"
                          : "Upload Medical Certificate"
                      }}
                    </span>
                  </label>
                  <button
                    v-if="formData.medicalCertificate"
                    type="button"
                    @click="viewFile('medicalCertificate')"
                    class="px-4 py-2 bg-blue1 text-white rounded-full text-sm"
                  >
                    View File
                  </button>
                  <span
                    v-if="formData.medicalCertificate"
                    class="text-green-500"
                    >Uploaded</span
                  >
                </div>
              </div>

              <!-- Urinalysis Report -->
              <div class="relative">
                <input
                  type="file"
                  @change="handleFileChange('urinalysisReport', $event)"
                  accept=".pdf,.doc,.docx"
                  class="hidden"
                  ref="urinalysisReportInput"
                />
                <div class="flex gap-2">
                  <label
                    @click="$refs.urinalysisReportInput.click()"
                    class="flex items-center gap-2 flex-1 px-4 py-2 rounded-md bg-graytint cursor-pointer hover:bg-gray-100"
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
                    <span class="text-sm">
                      {{
                        formData.urinalysisReport
                          ? "Change file"
                          : "Upload Urinalysis Report"
                      }}
                    </span>
                  </label>
                  <button
                    v-if="formData.urinalysisReport"
                    type="button"
                    @click="viewFile('urinalysisReport')"
                    class="px-4 py-2 bg-blue1 text-white rounded-full text-sm"
                  >
                    View File
                  </button>
                  <span v-if="formData.urinalysisReport" class="text-green-500"
                    >Uploaded</span
                  >
                </div>
              </div>

              <!-- Radiologic Report -->
              <div class="relative">
                <input
                  type="file"
                  @change="handleFileChange('radiologicReport', $event)"
                  accept=".pdf,.doc,.docx"
                  class="hidden"
                  ref="radiologicReportInput"
                />
                <div class="flex gap-2">
                  <label
                    @click="$refs.radiologicReportInput.click()"
                    class="flex items-center gap-2 flex-1 px-4 py-2 rounded-md bg-graytint cursor-pointer hover:bg-gray-100"
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
                    <span class="text-sm">
                      {{
                        formData.radiologicReport
                          ? "Change file"
                          : "Upload Radiologic Report"
                      }}
                    </span>
                  </label>
                  <button
                    v-if="formData.radiologicReport"
                    type="button"
                    @click="viewFile('radiologicReport')"
                    class="px-4 py-2 bg-blue1 text-white rounded-full text-sm"
                  >
                    View File
                  </button>
                  <span v-if="formData.radiologicReport" class="text-green-500"
                    >Uploaded</span
                  >
                </div>
              </div>

              <!-- Hematology Report -->
              <div class="relative">
                <input
                  type="file"
                  @change="handleFileChange('hematologyReport', $event)"
                  accept=".pdf,.doc,.docx"
                  class="hidden"
                  ref="hematologyReportInput"
                />
                <div class="flex gap-2">
                  <label
                    @click="$refs.hematologyReportInput.click()"
                    class="flex items-center gap-2 flex-1 px-4 py-2 rounded-md bg-graytint cursor-pointer hover:bg-gray-100"
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
                    <span class="text-sm">
                      {{
                        formData.hematologyReport
                          ? "Change file"
                          : "Upload Hematology Report"
                      }}
                    </span>
                  </label>
                  <button
                    v-if="formData.hematologyReport"
                    type="button"
                    @click="viewFile('hematologyReport')"
                    class="px-4 py-2 bg-blue1 text-white rounded-full text-sm"
                  >
                    View File
                  </button>
                  <span v-if="formData.hematologyReport" class="text-green-500"
                    >Uploaded</span
                  >
                </div>
              </div>

              <!-- Drug Test Report -->
              <div class="relative">
                <input
                  type="file"
                  @change="handleFileChange('drugTestReport', $event)"
                  accept=".pdf,.doc,.docx"
                  class="hidden"
                  ref="drugTestReportInput"
                />
                <div class="flex gap-2">
                  <label
                    @click="$refs.drugTestReportInput.click()"
                    class="flex items-center gap-2 flex-1 px-4 py-2 rounded-md bg-graytint cursor-pointer hover:bg-gray-100"
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
                    <span class="text-sm">
                      {{
                        formData.drugTestReport
                          ? "Change file"
                          : "Upload Drug Test Report"
                      }}
                    </span>
                  </label>
                  <button
                    v-if="formData.drugTestReport"
                    type="button"
                    @click="viewFile('drugTestReport')"
                    class="px-4 py-2 bg-blue1 text-white rounded-full text-sm"
                  >
                    View File
                  </button>
                  <span v-if="formData.drugTestReport" class="text-green-500"
                    >Uploaded</span
                  >
                </div>
              </div>

              <!-- Dental Health Chart -->
              <div class="relative">
                <input
                  type="file"
                  @change="handleFileChange('dentalHealthChart', $event)"
                  accept=".pdf,.doc,.docx"
                  class="hidden"
                  ref="dentalHealthChartInput"
                />
                <div class="flex gap-2">
                  <label
                    @click="$refs.dentalHealthChartInput.click()"
                    class="flex items-center gap-2 flex-1 px-4 py-2 rounded-md bg-graytint cursor-pointer hover:bg-gray-100"
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
                    <span class="text-sm">
                      {{
                        formData.dentalHealthChart
                          ? "Change file"
                          : "Upload Dental Health Chart"
                      }}
                    </span>
                  </label>
                  <button
                    v-if="formData.dentalHealthChart"
                    type="button"
                    @click="viewFile('dentalHealthChart')"
                    class="px-4 py-2 bg-blue1 text-white rounded-full text-sm"
                  >
                    View File
                  </button>
                  <span v-if="formData.dentalHealthChart" class="text-green-500"
                    >Uploaded</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end mt-6">
            <button
              type="submit"
              class="bg-blue1 text-white px-6 py-2 rounded-full"
            >
              {{ isEditing ? "Update" : "Add" }} Student
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { serverTimestamp } from "firebase/firestore";
import { PencilIcon } from "@heroicons/vue/24/solid";
import { useCRUD } from "@/utils/firebaseCRUD";
import { handleImageUpload } from "@/utils/image-utils";
import { handleDocumentUpload } from "@/utils/document-upload-utils";

export default {
  name: "StudentModal",
  components: {
    PencilIcon,
  },
  props: {
    modelValue: Boolean,
    isEditing: Boolean,
    initialData: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:modelValue", "submit"],
  setup(props, { emit }) {
    const { addItem, updateItem } = useCRUD("students");

    const formData = ref({
      studentId: "",
      lastName: "",
      firstName: "",
      middleInitial: "",
      age: "",
      sex: "",
      nationality: "",
      address: "",
      religion: "",
      course: "",
      yearLevel: "",
      guardianName: "",
      guardianOccupation: "",
      guardianAddress: "",
      guardianContact: "",
      profileImage: "",
      medicalCertificate: "",
      urinalysisReport: "",
      radiologicReport: "",
      hematologyReport: "",
      drugTestReport: "",
      dentalHealthChart: "",
    });

    const imagePreview = ref(null);

    watch(
      () => props.initialData,
      (newData) => {
        formData.value = { ...newData };
        imagePreview.value = newData.profileImage || null;
      },
      { immediate: true }
    );

    async function handleImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        const base64 = await handleImageUpload(file);
        imagePreview.value = base64;
        formData.value.profileImage = base64;
      }
    }

    async function handleFileChange(field, event) {
      const file = event.target.files[0];
      if (file) {
        const fileData = await handleDocumentUpload(file);
        formData.value[field] = fileData.data;
      }
    }

    function viewFile(field) {
      if (formData.value[field]) {
        const newWindow = window.open();
        newWindow.document.write(`
          <iframe
            src="${formData.value[field]}"
            style="width:100%;height:100vh;border:none;"
          ></iframe>
        `);
      }
    }

    async function submitForm() {
      const studentData = {
        ...formData.value,
        id: formData.value.studentId,
        updatedAt: serverTimestamp(),
      };

      if (!props.isEditing) {
        studentData.createdAt = serverTimestamp();
      }

      if (props.isEditing) {
        await updateItem(studentData);
      } else {
        await addItem(studentData);
      }

      emit("update:modelValue", false);
    }

    function closeModal() {
      emit("update:modelValue", false);
    }

    function handleBackgroundClick(event) {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    }

    return {
      formData,
      imagePreview,
      handleImageChange,
      handleFileChange,
      viewFile,
      submitForm,
      closeModal,
      handleBackgroundClick,
    };
  },
};
</script>

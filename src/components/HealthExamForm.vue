<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div
      ref="formContent"
      class="max-w-5xl mx-auto bg-white p-8 overflow-y-auto"
    >
      <div class="text-center mb-8">
        <h1 class="text-xl font-bold">CENTRAL PHILIPPINES STATE UNIVERSITY</h1>
        <h2 class="text-base">San Carlos, Negros Occidental</h2>
        <h3 class="text-xl font-bold mt-4">
          PRE-ENTRANCE HEALTH EXAMINATION REPORT
        </h3>
      </div>

      <div class="mb-8">
        <h4 class="font-bold pb-1 mb-4">PERSONAL INFORMATION</h4>
        <div class="grid gap-4">
          <div class="flex gap-4">
            <div class="flex-1">
              <input
                v-model="localFormData.lastName"
                class="w-full border-b border-black focus:outline-none bg-transparent"
                placeholder="Last"
                @input="validateAndEmit"
                required
              />
              <span class="text-xs">(Last)</span>
            </div>
            <div class="flex-1">
              <input
                v-model="localFormData.firstName"
                class="w-full border-b border-black focus:outline-none bg-transparent"
                placeholder="First"
                @input="validateAndEmit"
                required
              />
              <span class="text-xs">(First)</span>
            </div>
            <div class="flex-1">
              <input
                v-model="localFormData.middleName"
                class="w-full border-b border-black focus:outline-none bg-transparent"
                placeholder="Middle"
                @input="validateAndEmit"
                required
              />
              <span class="text-xs">(Middle)</span>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <input
              v-model="localFormData.dateOfBirth"
              class="border-b border-black focus:outline-none bg-transparent"
              placeholder="Date of Birth"
              @input="validateAndEmit"
              required
            />
            <input
              v-model="localFormData.age"
              class="border-b border-black focus:outline-none bg-transparent"
              placeholder="Age"
              @input="validateAndEmit"
              required
            />
            <input
              v-model="localFormData.sex"
              class="border-b border-black focus:outline-none bg-transparent"
              placeholder="Sex"
              @input="validateAndEmit"
              required
            />
            <input
              v-model="localFormData.nationality"
              class="border-b border-black focus:outline-none bg-transparent"
              placeholder="Nationality"
              @input="validateAndEmit"
              required
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h4 class="font-bold border-b border-black pb-1 mb-4">
            ANTHROPOMETRICS
          </h4>
          <div class="grid gap-2">
            <div class="flex justify-between">
              <span>Height:</span>
              <input
                v-model="localFormData.height"
                class="w-20 border-b border-black focus:outline-none bg-transparent text-right"
                @input="validateAndEmit"
                required
              />
              <span class="ml-1">ft/in</span>
            </div>
            <div class="flex justify-between">
              <span>Weight:</span>
              <input
                v-model="localFormData.weight"
                class="w-20 border-b border-black focus:outline-none bg-transparent text-right"
                @input="validateAndEmit"
                required
              />
              <span class="ml-1">kg</span>
            </div>
            <div class="flex justify-between">
              <span>BMI:</span>
              <input
                v-model="localFormData.bmi"
                class="w-20 border-b border-black focus:outline-none bg-transparent text-right"
                @input="validateAndEmit"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-bold border-b border-black pb-1 mb-4">VITAL SIGNS</h4>
          <div class="grid gap-2">
            <div class="flex justify-between">
              <span>Temperature:</span>
              <input
                v-model="localFormData.temperature"
                class="w-20 border-b border-black focus:outline-none bg-transparent text-right"
                @input="validateAndEmit"
                required
              />
              <span class="ml-1">°C</span>
            </div>
            <div class="flex justify-between">
              <span>Blood Pressure:</span>
              <input
                v-model="localFormData.bloodPressure"
                class="w-20 border-b border-black focus:outline-none bg-transparent text-right"
                @input="validateAndEmit"
                required
              />
              <span class="ml-1">mmHg</span>
            </div>
            <div class="flex justify-between">
              <span>Pulse Rate:</span>
              <input
                v-model="localFormData.pulseRate"
                class="w-20 border-b border-black focus:outline-none bg-transparent text-right"
                @input="validateAndEmit"
                required
              />
              <span class="ml-1">/min</span>
            </div>
            <div class="flex justify-between">
              <span>Respiratory Rate:</span>
              <input
                v-model="localFormData.respiratoryRate"
                class="w-20 border-b border-black focus:outline-none bg-transparent text-right"
                @input="validateAndEmit"
                required
              />
              <span class="ml-1">/min</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-8">
        <h4 class="font-bold border-b border-black pb-1 mb-4">
          MEDICAL HISTORY
        </h4>
        <table class="w-full">
          <thead>
            <tr>
              <th class="border border-black p-2 text-left">DISEASE</th>
              <th class="border border-black p-2">Hospital Confinement</th>
              <th class="border border-black p-2">Date/s of Hospitalization</th>
              <th class="border border-black p-2">Specific Disease/Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(disease, index) in localDiseases" :key="disease">
              <td class="border border-black p-2">{{ disease }}</td>
              <td class="border border-black p-2 text-center">
                <label class="mr-4">
                  <input
                    type="radio"
                    v-model="localFormData.diseases[index].confined"
                    :value="true"
                    class="mr-1"
                    @change="validateAndEmit"
                    required
                  />Yes
                </label>
                <label>
                  <input
                    type="radio"
                    v-model="localFormData.diseases[index].confined"
                    :value="false"
                    class="mr-1"
                    @change="validateAndEmit"
                    required
                  />No
                </label>
              </td>
              <td class="border border-black p-2">
                <input
                  v-model="localFormData.diseases[index].date"
                  class="w-full focus:outline-none bg-transparent"
                  @input="validateAndEmit"
                />
              </td>
              <td class="border border-black p-2">
                <input
                  v-model="localFormData.diseases[index].remarks"
                  class="w-full focus:outline-none bg-transparent"
                  @input="validateAndEmit"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mb-8">
        <h4 class="font-bold border-b border-black pb-1 mb-4">IMMUNIZATIONS</h4>
        <div class="grid grid-cols-4 gap-4">
          <label
            v-for="(vaccine, index) in localVaccines.flat()"
            :key="vaccine"
            class="flex items-center"
          >
            <input
              type="checkbox"
              v-model="localFormData.vaccines[index]"
              class="mr-2"
              @change="validateAndEmit"
            />
            {{ vaccine }}
          </label>
        </div>
      </div>

      <div class="mt-8 mb-16">
        <p class="text-sm mb-4">
          I hereby certify that the above history is true to the best of my
          knowledge.
        </p>
        <div class="grid grid-cols-2 gap-8">
          <div class="border-t border-black pt-1 text-center text-sm">
            Student's Signature
          </div>
          <div class="border-t border-black pt-1 text-center text-sm">
            {{ new Date().toLocaleDateString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import html2canvas from "html2canvas";
import { uploadDocumentToSupabase } from "@/utils/supabase-storage";

const formContent = ref(null);

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:formData"]);

const localDiseases = [
  "Nosebleed",
  "Dengue Fever",
  "Rheumatic Fever",
  "Typhoid Fever",
  "Arthritis",
  "Urinary Tract Infection, STD",
  "Amoebasis",
  "Hyperacidity",
  "Asthma",
  "Heart Disease",
  "Mumps",
  "Tuberculosis, Pneumonia",
  "Chicken Pox",
  "Measles",
  "Fainting Spells, Seizure",
  "Hernia",
  "Thyroid Disease (Goiter)",
];

const localVaccines = [
  ["Chicken Pox", "Hepatitis A", "Influenza", "Tetanus Toxoid"],
  ["HPV Vaccine", "Hepatitis B", "Pneumonia", "Rabies"],
];

// Initialize local form data
const localFormData = ref({
  lastName: "",
  firstName: "",
  middleName: "",
  dateOfBirth: "",
  age: "",
  sex: "",
  nationality: "",
  height: "",
  weight: "",
  bmi: "",
  temperature: "",
  bloodPressure: "",
  pulseRate: "",
  respiratoryRate: "",
  diseases: localDiseases.map(() => ({
    confined: null,
    date: "",
    remarks: "",
  })),
  vaccines: new Array(localVaccines.flat().length).fill(false),
  ...props.formData,
});

// Watch for changes in props
watch(
  () => props.formData,
  (newVal) => {
    localFormData.value = { ...localFormData.value, ...newVal };
  },
  { deep: true }
);

// Validate and emit form data
const validateAndEmit = () => {
  emit("update:formData", localFormData.value);
};

// Generate image
const generateAndSaveForm = async () => {
  if (!formContent.value) return null;

  try {
    const element = formContent.value;
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    // Convert canvas to blob
    const blob = await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });

    // Create a file from the blob
    const file = new File([blob], `health-exam-${Date.now()}.png`, {
      type: "image/png",
    });

    // Upload directly to Supabase
    const fileUrl = await uploadDocumentToSupabase(
      file,
      "documents",
      "image-uploads"
    );
    return fileUrl;
  } catch (error) {
    console.error("Error generating and saving image:", error);
    throw new Error("Failed to generate and save image");
  }
};

// Save form data
const saveFormData = () => {
  return { ...localFormData.value };
};

// Expose methods
defineExpose({
  generateAndSaveForm,
  saveFormData,
  validateAndEmit,
});
</script>

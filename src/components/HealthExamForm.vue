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
        <p class="text-sm italic">
          (Please write legibly and use black pen only)
        </p>
      </div>

      <div class="mb-8">
        <h4 class="font-bold pb-1 mb-4">PERSONAL INFORMATION</h4>
        <div class="grid gap-4">
          <div class="flex gap-4">
            <div class="flex-1">
              <input
                v-model="formData.lastName"
                class="w-full border-b border-black focus:outline-none bg-transparent"
                placeholder="Last"
              />
              <span class="text-xs">(Last)</span>
            </div>
            <div class="flex-1">
              <input
                v-model="formData.firstName"
                class="w-full border-b border-black focus:outline-none bg-transparent"
                placeholder="First"
              />
              <span class="text-xs">(First)</span>
            </div>
            <div class="flex-1">
              <input
                v-model="formData.middleName"
                class="w-full border-b border-black focus:outline-none bg-transparent"
                placeholder="Middle"
              />
              <span class="text-xs">(Middle)</span>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <input
              v-model="formData.dateOfBirth"
              class="border-b border-black focus:outline-none bg-transparent"
              placeholder="Date of Birth"
            />
            <input
              v-model="formData.age"
              class="border-b border-black focus:outline-none bg-transparent"
              placeholder="Age"
            />
            <input
              v-model="formData.sex"
              class="border-b border-black focus:outline-none bg-transparent"
              placeholder="Sex"
            />
            <input
              v-model="formData.nationality"
              class="border-b border-black focus:outline-none bg-transparent"
              placeholder="Nationality"
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
                v-model="formData.height"
                class="w-20 border-b border-black focus:outline-none bg-transparent text-right"
              />
              <span class="ml-1">ft/in</span>
            </div>
            <div class="flex justify-between">
              <span>Weight:</span>
              <input
                v-model="formData.weight"
                class="w-20 border-b border-black focus:outline-none bg-transparent text-right"
              />
              <span class="ml-1">kg</span>
            </div>
            <div class="flex justify-between">
              <span>BMI:</span>
              <input
                v-model="formData.bmi"
                class="w-20 border-b border-black focus:outline-none bg-transparent text-right"
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
                v-model="formData.temperature"
                class="w-20 border-b border-black focus:outline-none bg-transparent text-right"
              />
              <span class="ml-1">°C</span>
            </div>
            <div class="flex justify-between">
              <span>Blood Pressure:</span>
              <input
                v-model="formData.bloodPressure"
                class="w-20 border-b border-black focus:outline-none bg-transparent text-right"
              />
              <span class="ml-1">mmHg</span>
            </div>
            <div class="flex justify-between">
              <span>Pulse Rate:</span>
              <input
                v-model="formData.pulseRate"
                class="w-20 border-b border-black focus:outline-none bg-transparent text-right"
              />
              <span class="ml-1">/min</span>
            </div>
            <div class="flex justify-between">
              <span>Respiratory Rate:</span>
              <input
                v-model="formData.respiratoryRate"
                class="w-20 border-b border-black focus:outline-none bg-transparent text-right"
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
            <tr v-for="disease in diseases" :key="disease">
              <td class="border border-black p-2">{{ disease }}</td>
              <td class="border border-black p-2 text-center">
                <label class="mr-4">
                  <input
                    type="radio"
                    :name="`hosp-${disease}`"
                    class="mr-1"
                  />Yes
                </label>
                <label>
                  <input
                    type="radio"
                    :name="`hosp-${disease}`"
                    class="mr-1"
                  />No
                </label>
              </td>
              <td class="border border-black p-2">
                <input class="w-full focus:outline-none bg-transparent" />
              </td>
              <td class="border border-black p-2">
                <input class="w-full focus:outline-none bg-transparent" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mb-8">
        <h4 class="font-bold border-b border-black pb-1 mb-4">IMMUNIZATIONS</h4>
        <div class="grid grid-cols-4 gap-4">
          <label
            v-for="vaccine in vaccines.flat()"
            :key="vaccine"
            class="flex items-center"
          >
            <input type="checkbox" class="mr-2" />
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

    <div class="sticky bottom-4 right-4 flex justify-end px-8">
      <button
        @click="saveForm"
        class="bg-blue1 text-white px-6 py-2 rounded-lg"
      >
        Save Form
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import html2pdf from "html2pdf.js";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const formContent = ref(null);
const formData = ref({});

const diseases = [
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

const vaccines = [
  ["Chicken Pox", "Hepatitis A", "Influenza", "Tetanus Toxoid"],
  ["HPV Vaccine", "Hepatitis B", "Pneumonia", "Rabies"],
];

const emit = defineEmits(["submit"]);

const saveForm = async () => {
  if (!formContent.value) return;

  try {
    const element = formContent.value;
    const opt = {
      margin: 0.5,
      filename: "health-exam.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    // Generate PDF and get as base64
    const pdfData = await html2pdf()
      .from(element)
      .set(opt)
      .outputPdf("datauristring");

    // Emit the PDF data to parent
    emit("submit", pdfData);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF. Please try again.");
  }
};
</script>

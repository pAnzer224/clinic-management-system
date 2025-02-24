<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div
      ref="formContent"
      class="max-w-5xl mx-auto bg-white p-8 overflow-y-auto"
    >
      <div class="grid grid-cols-4 gap-4 mb-4">
        <div class="border-b border-black">
          <input
            v-model="localFormData.lastName"
            class="w-full focus:outline-none bg-transparent"
            placeholder="LAST NAME"
            @input="validateAndEmit"
          />
          <div class="text-xs">LAST NAME</div>
        </div>
        <div class="border-b border-black">
          <input
            v-model="localFormData.firstName"
            class="w-full focus:outline-none bg-transparent"
            placeholder="FIRST NAME"
            @input="validateAndEmit"
          />
          <div class="text-xs">FIRST NAME</div>
        </div>
        <div class="border-b border-black">
          <input
            v-model="localFormData.middleName"
            class="w-full focus:outline-none bg-transparent"
            placeholder="MIDDLE NAME"
            @input="validateAndEmit"
          />
          <div class="text-xs">MIDDLE NAME</div>
        </div>
        <div class="border-b border-black">
          <input
            v-model="localFormData.age"
            class="w-full focus:outline-none bg-transparent"
            placeholder="AGE"
            @input="validateAndEmit"
          />
          <div class="text-xs">AGE</div>
        </div>
      </div>

      <div class="text-center font-bold text-lg mb-4">PHYSICAL EXAMINATION</div>

      <table class="w-full border border-black">
        <thead>
          <tr>
            <th class="border border-black p-2 w-1/6">FINDING</th>
            <th class="border border-black p-2 w-[60px]">E/N</th>
            <th class="border border-black p-2">FINDING/S</th>
            <th class="border border-black p-2">
              DESCRIPTION AND OTHER FINDINGS
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(section, key) in examSections" :key="key">
            <tr>
              <td
                :rowspan="section.findings.length"
                class="border border-black p-2"
              >
                {{ section.label }}
              </td>
              <td
                :rowspan="section.findings.length"
                class="border border-black p-2 text-center"
              >
                <input
                  type="checkbox"
                  v-model="localFormData[key].checkbox"
                  class="w-4 h-4"
                  @change="validateAndEmit"
                />
              </td>
              <td class="border border-black p-2">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="localFormData[key][section.findings[0].key]"
                    class="mr-2"
                    @change="validateAndEmit"
                  />
                  {{ section.findings[0].label }}
                  <template v-if="section.findings[0].type === 'hearing'">
                    <label class="ml-2">
                      R
                      <input
                        type="checkbox"
                        v-model="localFormData[key].hearingRight"
                        @change="validateAndEmit"
                      />
                    </label>
                    <label class="ml-2">
                      L
                      <input
                        type="checkbox"
                        v-model="localFormData[key].hearingLeft"
                        @change="validateAndEmit"
                      />
                    </label>
                  </template>
                </div>
              </td>
              <td
                :rowspan="section.findings.length"
                class="border border-black p-2"
              >
                <input
                  v-model="localFormData[key].description"
                  class="w-full focus:outline-none bg-transparent"
                  placeholder="Description..."
                  @input="validateAndEmit"
                />
              </td>
            </tr>
            <tr v-for="finding in section.findings.slice(1)" :key="finding.key">
              <td class="border border-black p-2">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="localFormData[key][finding.key]"
                    class="mr-2"
                    @change="validateAndEmit"
                  />
                  {{ finding.label }}
                </div>
              </td>
            </tr>
          </template>

          <tr>
            <td class="border border-black p-2">OTHER SIGNIFICANT FINDINGS</td>
            <td class="border border-black p-2 text-center">
              <input
                type="checkbox"
                v-model="localFormData.otherFindings.checkbox"
                class="w-4 h-4"
                @change="validateAndEmit"
              />
            </td>
            <td colspan="2" class="border border-black p-2">
              <textarea
                v-model="localFormData.otherFindings.description"
                class="w-full focus:outline-none bg-transparent"
                rows="2"
                placeholder="Description..."
                @input="validateAndEmit"
              ></textarea>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mt-6 flex gap-8">
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            v-model="localFormData.fit"
            class="w-4 h-4"
            @change="handleAssessmentChange('fit')"
          />
          Fit for enrolment
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            v-model="localFormData.unfit"
            class="w-4 h-4"
            @change="handleAssessmentChange('unfit')"
          />
          Not fit for enrolment
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            v-model="localFormData.pending"
            class="w-4 h-4"
            @change="handleAssessmentChange('pending')"
          />
          Pending: reasons:
          <input
            v-if="localFormData.pending"
            v-model="localFormData.pendingReasons"
            class="border-b border-black focus:outline-none bg-transparent"
            @input="validateAndEmit"
          />
        </label>
      </div>

      <div class="mt-8 text-center">
        <div class="border-t border-black pt-2 inline-block">
          Name and Signature of Examining Registered Nurse/ Physician
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import html2canvas from "html2canvas";

const formContent = ref(null);

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:formData"]);

// Define examination sections
const examSections = {
  skin: {
    label: "SKIN",
    findings: [
      { key: "discoloration", label: "Discoloration" },
      { key: "lesion", label: "Lesion" },
    ],
  },
  head: {
    label: "HEAD",
    findings: [
      { key: "deformity", label: "Deformity" },
      { key: "massNodules", label: "Mass/Nodules" },
    ],
  },
  ears: {
    label: "EARS",
    findings: [
      { key: "hearing", label: "Hearing Acuity", type: "hearing" },
      { key: "discharge", label: "Discharge" },
    ],
  },
  nose: {
    label: "NOSE",
    findings: [
      { key: "deformity", label: "Deformity" },
      { key: "bleeding", label: "Bleeding" },
    ],
  },
  mouthAndTongue: {
    label: "MOUTH AND TONGUE",
    findings: [
      { key: "inflammation", label: "Inflammation" },
      { key: "tongueDeviation", label: "Tongue Deviation" },
    ],
  },
  neckAndLymph: {
    label: "NECK & LYMPH NODES",
    findings: [
      { key: "rigidity", label: "Rigidity" },
      { key: "massSwelling", label: "Mass/Swelling" },
    ],
  },
  heart: {
    label: "HEART",
    findings: [
      { key: "tachycardia", label: "Tachycardia" },
      { key: "bradycardia", label: "Bradycardia" },
    ],
  },
  chest: {
    label: "CHEST",
    findings: [
      { key: "tenderness", label: "Tenderness" },
      { key: "bulge", label: "Bulge" },
    ],
  },
  lungs: {
    label: "LUNGS",
    findings: [
      { key: "wheezing", label: "Wheezing" },
      { key: "rales", label: "Rales" },
    ],
  },
  breastAxilla: {
    label: "BREAST & AXILLA",
    findings: [
      { key: "dimpling", label: "Dimpling" },
      { key: "enlargedLymph", label: "Enlarged Lymph" },
    ],
  },
  abdomen: {
    label: "ABDOMEN",
    findings: [
      { key: "striae", label: "Striae" },
      { key: "tenderness", label: "Tenderness" },
    ],
  },
  backShoulders: {
    label: "BACK & SHOULDERS",
    findings: [
      { key: "lordosis", label: "Lordosis" },
      { key: "kyphosis", label: "Kyphosis" },
    ],
  },
  extremities: {
    label: "EXTREMITIES",
    findings: [
      { key: "deformity", label: "Deformity" },
      { key: "clubbing", label: "Clubbing of Nails" },
    ],
  },
};

// Initialize local form data
const localFormData = ref({
  lastName: "",
  firstName: "",
  middleName: "",
  age: "",
  fit: false,
  unfit: false,
  pending: false,
  pendingReasons: "",
  otherFindings: {
    checkbox: false,
    description: "",
  },
});

// Initialize section data
Object.keys(examSections).forEach((key) => {
  localFormData.value[key] = {
    checkbox: false,
    description: "",
  };
  examSections[key].findings.forEach((finding) => {
    localFormData.value[key][finding.key] = false;
  });
  if (key === "ears") {
    localFormData.value[key].hearingRight = false;
    localFormData.value[key].hearingLeft = false;
  }
});

// Watch for changes in props
watch(
  () => props.formData,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      localFormData.value = { ...localFormData.value, ...newVal };
    }
  },
  { deep: true }
);

// Handle assessment changes
const handleAssessmentChange = (type) => {
  if (type === "fit" && localFormData.value.fit) {
    localFormData.value.unfit = false;
    localFormData.value.pending = false;
    localFormData.value.pendingReasons = "";
  } else if (type === "unfit" && localFormData.value.unfit) {
    localFormData.value.fit = false;
    localFormData.value.pending = false;
    localFormData.value.pendingReasons = "";
  } else if (type === "pending" && localFormData.value.pending) {
    localFormData.value.fit = false;
    localFormData.value.unfit = false;
  }
  validateAndEmit();
};

// Validate and emit form data
const validateAndEmit = () => {
  emit("update:formData", { ...localFormData.value });
};

// Generate PDF
const generatePdf = async () => {
  if (!formContent.value) return null;

  try {
    const element = formContent.value;
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image");
  }
};

// Save form data
const saveFormData = () => {
  return { ...localFormData.value };
};

// Expose methods
defineExpose({
  generatePdf,
  saveFormData,
  validateAndEmit,
});
</script>

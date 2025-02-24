<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
    @click="handleBackgroundClick"
  >
    <div
      :class="[
        'bg-white rounded-2xl p-8 shadow-lg h-[90vh]',
        isEditing ? 'w-[800px]' : 'w-[650px]',
      ]"
      @click.stop
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-satoshi-bold">
          {{ isEditing ? "Edit" : "New" }} Medical Record
        </h2>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <div class="flex gap-6 h-[calc(90vh-88px)]">
        <!-- Left side: Student Information -->
        <div v-if="isEditing" class="w-60 flex-shrink-0 flex flex-col">
          <div class="bg-graytint/50 rounded-xl p-4 sticky top-0 z-10">
            <h3 class="font-satoshi-bold mb-4">Student Information</h3>
            <div class="space-y-3">
              <div class="bg-white p-3 rounded-lg shadow-sm">
                <div class="flex items-center gap-3 mb-3">
                  <div
                    class="w-12 h-12 rounded-full bg-blue1/10 overflow-hidden"
                    v-if="studentDetails.profileImage"
                  >
                    <img
                      :src="studentDetails.profileImage"
                      class="w-full h-full object-cover"
                      alt="Student Profile"
                    />
                  </div>
                  <div>
                    <p class="font-medium">
                      {{ studentDetails.firstName }}
                      {{ studentDetails.lastName }}
                    </p>
                    <p class="text-sm text-gray-600">
                      {{ studentDetails.studentId }}
                    </p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p class="text-gray-500">Course</p>
                    <p class="font-medium">{{ studentDetails.course }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Year Level</p>
                    <p class="font-medium">{{ studentDetails.yearLevel }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- StudentAccordion component -->
          <div class="mt-4 flex-grow overflow-y-scroll no-scrollbar">
            <StudentAccordion
              :documents="studentDetails.documents || {}"
              :documentLabels="documentLabels"
              :studentId="studentDetails.studentId"
            />
          </div>
        </div>

        <!-- Right side: Record Form -->
        <div class="flex-1 overflow-y-scroll no-scrollbar pr-4">
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Student Selection (only show when adding new record) -->
            <div v-if="!isEditing" class="space-y-4">
              <h3 class="font-satoshi-bold">Student Information</h3>
              <div class="flex items-center gap-2">
                <Dropdown
                  v-model="formData.student"
                  :options="studentOptions"
                  placeholder="Select Student"
                />
                <button
                  type="button"
                  @click="showStudentModal = true"
                  class="bg-blue2 text-white p-2 rounded-full hover:bg-blue1"
                >
                  <PlusIcon class="size-3" />
                </button>
              </div>
            </div>

            <!-- Vital Signs -->
            <div class="space-y-4">
              <h3 class="font-satoshi-bold">Vital Signs</h3>
              <div class="grid grid-cols-2 gap-4">
                <input
                  v-model="formData.temperature"
                  placeholder="Temperature (°C)"
                  class="w-full px-4 py-2 rounded-lg bg-graytint"
                  required
                />
                <input
                  v-model="formData.bloodPressure"
                  placeholder="Blood Pressure"
                  class="w-full px-4 py-2 rounded-lg bg-graytint"
                  required
                />
              </div>
            </div>

            <!-- Medical Information -->
            <div class="space-y-4">
              <h3 class="font-satoshi-bold">Medical Information</h3>
              <input
                v-model="formData.chiefComplaint"
                placeholder="Chief Complaint"
                class="w-full px-4 py-2 rounded-lg bg-graytint"
                required
              />

              <!-- Symptoms -->
              <div class="space-y-2">
                <div class="flex gap-2">
                  <input
                    v-model="newSymptom"
                    @keyup.enter="addSymptom"
                    placeholder="Type symptoms and press enter"
                    class="flex-1 px-4 py-2 rounded-lg bg-graytint"
                  />
                </div>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="(symptom, index) in formData.symptoms"
                    :key="index"
                    class="bg-blue1/10 px-3 py-1 rounded-lg flex items-center gap-2"
                  >
                    <span>{{ symptom }}</span>
                    <button
                      type="button"
                      @click="removeSymptom(index)"
                      class="text-red-500"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <textarea
                v-model="formData.diagnosis"
                placeholder="Diagnosis"
                class="w-full px-4 py-2 rounded-lg bg-graytint min-h-[100px]"
                required
              ></textarea>

              <textarea
                v-model="formData.treatment"
                placeholder="Treatment Plan"
                class="w-full px-4 py-2 rounded-lg bg-graytint min-h-[100px]"
                required
              ></textarea>

              <!-- Medications -->
              <div class="space-y-2">
                <div class="flex gap-2">
                  <div class="flex items-center gap-2 flex-1">
                    <Dropdown
                      v-model="newMedication.name"
                      :options="medicationOptions"
                      placeholder="Select Medicine"
                    />
                    <button
                      type="button"
                      @click="showMedicationsModal = true"
                      class="bg-blue2 text-white p-2 rounded-full hover:bg-blue1"
                    >
                      <PlusIcon class="size-3" />
                    </button>
                  </div>
                  <input
                    v-model="newMedication.dosage"
                    placeholder="Dosage"
                    class="w-32 px-4 py-2 rounded-lg bg-graytint"
                  />
                  <button
                    type="button"
                    @click="addMedication"
                    class="px-4 py-2 bg-blue1 text-white rounded-full"
                  >
                    Add
                  </button>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="(med, index) in formData.medications"
                    :key="index"
                    class="flex items-center justify-between bg-blue1/10 px-4 py-2 rounded-lg"
                  >
                    <span>{{ med.name }} - {{ med.dosage }}</span>
                    <button
                      type="button"
                      @click="removeMedication(index)"
                      class="text-red-500"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <textarea
                v-model="formData.notes"
                placeholder="Additional Notes"
                class="w-full px-4 py-2 rounded-lg bg-graytint min-h-[100px]"
              ></textarea>
            </div>

            <!-- Follow-up Information -->
            <div class="space-y-4">
              <h3 class="font-satoshi-bold">Follow-up Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <input
                  v-model="formData.followUpDate"
                  type="date"
                  class="w-full px-4 py-2 rounded-lg bg-graytint"
                />
                <Dropdown
                  v-model="formData.status"
                  :options="statusOptions"
                  placeholder="Select Status"
                />
              </div>
            </div>

            <!-- Form Actions -->
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
                class="px-6 py-2 bg-blue1 text-white rounded-full hover:bg-blue-700 mb-8"
              >
                {{ isEditing ? "Update" : "Save" }} Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Medications Modal -->
  <MedicationsModal
    v-model="showMedicationsModal"
    :initial-form-data="medicationFormData"
    @submit="handleMedicationSubmit"
  />

  <!-- Student Modal -->
  <StudentModal
    v-model="showStudentModal"
    :is-editing="false"
    :initial-form-data="studentFormData"
    @submit="handleStudentSubmit"
  />
</template>

<script>
import { ref, watch, onMounted, computed } from "vue";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import { useCRUD } from "@/utils/firebaseCRUD";
import { XMarkIcon, PlusIcon } from "@heroicons/vue/24/solid";
import MedicationsModal from "./MedicationsModal.vue";
import StudentModal from "./StudentModal.vue";
import StudentAccordion from "./StudentAccordion.vue";
import { logActivity } from "@/utils/activity-logger";
import Dropdown from "./Dropdown.vue";

const documentLabels = {
  medicalCertificate: "Medical Certificate",
  urinalysisReport: "Urinalysis Report",
  radiologicReport: "Radiologic Report",
  hematologyReport: "Hematology Report",
  drugTestReport: "Drug Test Report",
  dentalHealthChart: "Dental Health Chart",
  healthExam: "Health Examination Form",
};

export default {
  name: "RecordModal",
  components: {
    XMarkIcon,
    PlusIcon,
    MedicationsModal,
    StudentModal,
    StudentAccordion,
    Dropdown,
  },
  props: {
    modelValue: Boolean,
    isEditing: Boolean,
    initialFormData: {
      type: Object,
      required: true,
    },
    students: {
      type: Array,
      required: true,
    },
  },
  emits: ["update:modelValue", "submit"],
  setup(props, { emit }) {
    const { addItem, updateItem } = useCRUD("medicalRecords");
    const formData = ref({});
    const newSymptom = ref("");
    const newMedication = ref({ name: "", dosage: "" });
    const studentDetails = ref({});
    const medications = ref([]);
    const showMedicationsModal = ref(false);
    const showStudentModal = ref(false);
    const medicationFormData = ref({
      name: "",
      category: "",
      dosageForm: "",
      strength: "",
      currentStock: 0,
      minimumStock: 5,
      manufacturer: "",
      expirationDate: "",
      location: "",
      notes: "",
    });
    const studentFormData = ref({
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
      yearLevel: "1st Year",
      guardianName: "",
      guardianOccupation: "",
      guardianAddress: "",
      guardianContact: "",
      profileImage: "",
      labTest: "",
    });
    const currentUser = ref(
      JSON.parse(localStorage.getItem("currentUser")) || {}
    );

    // Convert medications to dropdown options
    const medicationOptions = computed(() => {
      return medications.value.map((med) => ({
        value: med.name,
        label: `${med.name} (${med.strength}) - Stock: ${med.currentStock}`,
        data: med,
      }));
    });

    // Convert students to dropdown options
    const studentOptions = computed(() => {
      return props.students.map((student) => ({
        value: student,
        label: `${student.firstName} ${student.lastName} (${student.studentId})`,
      }));
    });

    // Status options for dropdown
    const statusOptions = ref([
      { value: "Active", label: "Active" },
      { value: "Completed", label: "Completed" },
      { value: "Follow-up Required", label: "Follow-up Required" },
    ]);

    onMounted(async () => {
      await fetchMedications();
    });

    watch(
      () => props.initialFormData,
      (newVal) => {
        formData.value = {
          ...newVal,
          symptoms: newVal.symptoms || [],
          medications: newVal.medications || [],
        };
        if (props.isEditing && newVal.studentId) {
          fetchStudentData(newVal.studentId);
        }
      },
      { immediate: true, deep: true }
    );

    async function fetchMedications() {
      try {
        const { getItems } = useCRUD("medications");
        const items = await getItems();
        medications.value = items;
      } catch (error) {
        console.error("Error fetching medications:", error);
      }
    }

    async function fetchStudentData(studentId) {
      try {
        const studentsRef = collection(db, "students");
        const studentQuery = query(
          studentsRef,
          where("studentId", "==", studentId)
        );
        const studentSnapshot = await getDocs(studentQuery);
        if (!studentSnapshot.empty) {
          studentDetails.value = studentSnapshot.docs[0].data();
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    }

    watch(
      () => formData.value.student,
      (student) => {
        if (student) {
          formData.value.studentId = student.studentId;
          formData.value.studentName = `${student.firstName} ${student.lastName}`;
          fetchStudentData(student.studentId);
        }
      }
    );

    function addSymptom() {
      if (newSymptom.value.trim()) {
        if (!formData.value.symptoms) formData.value.symptoms = [];
        formData.value.symptoms.push(newSymptom.value.trim());
        newSymptom.value = "";
      }
    }

    function removeSymptom(index) {
      formData.value.symptoms.splice(index, 1);
    }

    function addMedication() {
      if (newMedication.value.name && newMedication.value.dosage) {
        if (!formData.value.medications) formData.value.medications = [];

        // Find the selected medication from the medications array
        const selectedMed = medications.value.find(
          (m) => m.name === newMedication.value.name
        );

        formData.value.medications.push({
          name: newMedication.value.name,
          dosage: newMedication.value.dosage,
          strength: selectedMed?.strength || "",
          category: selectedMed?.category || "",
          medicationId: selectedMed?.id || "",
        });

        newMedication.value = { name: "", dosage: "" };
      }
    }

    function removeMedication(index) {
      formData.value.medications.splice(index, 1);
    }

    async function handleMedicationSubmit(medicationData) {
      try {
        const { addItem: addMedicationItem } = useCRUD("medications");
        await addMedicationItem(medicationData);

        await logActivity({
          type: "medication",
          action: "create",
          title: "New Medication Added",
          description: `Added new medication: ${medicationData.name} (${medicationData.strength})`,
          timestamp: serverTimestamp(),
          performedBy: currentUser.value,
        });

        await fetchMedications();
        showMedicationsModal.value = false;
      } catch (error) {
        console.error("Error adding new medication:", error);
      }
    }

    async function handleStudentSubmit(data) {
      try {
        const studentData = {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, "students", data.studentId), studentData);

        await logActivity({
          type: "student",
          action: "create",
          title: "New Student Added",
          description: `Added new student ${data.firstName} ${data.lastName}`,
          timestamp: serverTimestamp(),
          performedBy: currentUser.value,
        });

        // Update students list
        const studentsRef = collection(db, "students");
        const studentSnapshot = await getDocs(studentsRef);
        const students = studentSnapshot.docs.map((doc) => doc.data());
        props.students.splice(0, props.students.length, ...students);

        // Select the newly added student
        formData.value.student = studentData;

        showStudentModal.value = false;
      } catch (error) {
        console.error("Error saving student:", error);
      }
    }

    function closeModal() {
      formData.value = {};
      studentDetails.value = {};
      emit("update:modelValue", false);
    }

    function handleBackgroundClick(event) {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    }

    function determineStatus(currentStock, minimumStock) {
      if (currentStock <= 0) return "Out of Stock";
      if (currentStock <= minimumStock) return "Low Stock";
      return "In Stock";
    }

    async function submitForm() {
      if (!formData.value.date) {
        formData.value.date = new Date().toISOString().split("T")[0];
      }

      if (!formData.value.id) {
        formData.value.id = `record_${Date.now()}`;
      }

      try {
        // Update medication inventory if needed
        if (
          formData.value.medications &&
          formData.value.medications.length > 0
        ) {
          const { getItem, updateItem: updateMedicationItem } =
            useCRUD("medications");

          for (const med of formData.value.medications) {
            if (med.medicationId) {
              const medication = await getItem(med.medicationId);
              if (medication && medication.currentStock > 0) {
                // Decrease stock by 1 (or could be based on dosage if needed)
                await updateMedicationItem({
                  ...medication,
                  currentStock: Math.max(0, medication.currentStock - 1),
                  status: determineStatus(
                    Math.max(0, medication.currentStock - 1),
                    medication.minimumStock
                  ),
                });
              }
            }
          }
        }

        if (props.isEditing) {
          await updateItem(formData.value);

          await logActivity({
            type: "medicalRecord",
            action: "update",
            title: "Medical Record Updated",
            description: `Updated medical record for ${formData.value.studentName}`,
            timestamp: serverTimestamp(),
            performedBy: currentUser.value,
          });
        } else {
          await addItem(formData.value);

          await logActivity({
            type: "medicalRecord",
            action: "create",
            title: "New Medical Record Created",
            description: `Created new medical record for ${formData.value.studentName}`,
            timestamp: serverTimestamp(),
            performedBy: currentUser.value,
          });
        }
        emit("submit", formData.value);
        closeModal();
      } catch (error) {
        console.error("Error submitting record:", error);
      }
    }

    return {
      formData,
      studentDetails,
      newSymptom,
      newMedication,
      medications,
      showMedicationsModal,
      showStudentModal,
      medicationFormData,
      studentFormData,
      documentLabels,
      medicationOptions,
      studentOptions,
      statusOptions,
      addSymptom,
      removeSymptom,
      addMedication,
      removeMedication,
      closeModal,
      handleBackgroundClick,
      submitForm,
      handleMedicationSubmit,
      handleStudentSubmit,
    };
  },
};
</script>

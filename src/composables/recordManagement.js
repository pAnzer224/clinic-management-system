import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import { useCRUD } from "@/utils/firebaseCRUD";
import { logActivity } from "@/utils/activity-logger";

const TABLE_HEADERS = [
  "Date",
  "Student Name",
  "Student ID",
  "Chief Complaint",
  "Treatment",
  "Status",
  "Actions",
];

const INITIAL_FORM = {
  id: "",
  date: new Date().toISOString().split("T")[0],
  studentId: "",
  studentName: "",
  chiefComplaint: "",
  symptoms: [],
  treatment: "",
  remarks: "",
  medications: [],
  notes: "",
  followUpDate: "",
  status: "Active",
  vitals: {
    temperature: "",
    bloodPressure: "",
    pulseRate: "",
    respiratoryRate: "",
  },
};

const DATE_FILTER_OPTIONS = [
  { value: "", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "Last 30 Days" },
];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Completed", label: "Completed" },
  { value: "Follow-up Required", label: "Follow-up Required" },
];

const DOCUMENT_LABELS = {
  medicalCertificate: "Medical Certificate",
  urinalysisReport: "Urinalysis Report",
  radiologicReport: "Radiologic Report",
  hematologyReport: "Hematology Report",
  drugTestReport: "Drug Test Report",
  dentalHealthChart: "Dental Health Chart",
  healthExam: "Health Examination Form",
};

export function useRecordsList() {
  const records = ref([]);
  const students = ref([]);
  const searchQuery = ref("");
  const filterDate = ref("");
  const showModal = ref(false);
  const showHealthAlert = ref(false);
  const isEditing = ref(false);
  const formData = ref({ ...INITIAL_FORM });
  const healthAlerts = ref([]);
  // Removed loading state for faster perceived performance
  const appointments = ref([]);
  const isSubmitting = ref(false);

  let recordsUnsubscribe = null;
  let healthAlertsUnsubscribe = null;

  // Simplified data fetching - removed loading state management
  async function fetchData() {
    try {
      await fetchStudents();
      setupSnapshotListeners();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  function setupSnapshotListeners() {
    // Clean up existing listeners if any
    if (recordsUnsubscribe) recordsUnsubscribe();
    if (healthAlertsUnsubscribe) healthAlertsUnsubscribe();

    const recordsQuery = query(
      collection(db, "medicalRecords"),
      orderBy("date", "desc")
    );

    recordsUnsubscribe = onSnapshot(recordsQuery, (snapshot) => {
      records.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    });

    const today = new Date();
    const alertsQuery = query(
      collection(db, "healthAlerts"),
      where("date", ">=", today.toISOString()),
      orderBy("date")
    );

    healthAlertsUnsubscribe = onSnapshot(alertsQuery, (snapshot) => {
      healthAlerts.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    });
  }

  async function fetchStudents() {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      students.value = querySnapshot.docs.map((doc) => ({ ...doc.data() }));
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }

  const filteredRecords = computed(() => {
    return records.value.filter((record) => {
      const matchesSearch =
        !searchQuery.value ||
        record.studentName
          ?.toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        record.studentId?.includes(searchQuery.value);

      const matchesDate =
        !filterDate.value || filterDateRange(record.date, filterDate.value);

      return matchesSearch && matchesDate;
    });
  });

  function filterDateRange(dateStr, range) {
    if (!dateStr) return false;

    const recordDate = new Date(dateStr);
    const today = new Date();

    switch (range) {
      case "today":
        return recordDate.toDateString() === today.toDateString();
      case "week": {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return recordDate >= weekAgo;
      }
      case "month": {
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        return recordDate >= monthAgo;
      }
      default:
        return true;
    }
  }

  function formatDateShort(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
  }

  function formatTimeOnly(dateString) {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function showAddRecord() {
    isEditing.value = false;
    formData.value = {
      ...INITIAL_FORM,
      date: new Date().toISOString().split("T")[0],
      symptoms: [],
    };
    showModal.value = true;
  }

  function editRecord(record) {
    isEditing.value = true;
    // Make sure we have a proper symptoms array
    formData.value = {
      ...record,
      symptoms: Array.isArray(record.symptoms) ? [...record.symptoms] : [],
    };
    showModal.value = true;
  }

  async function deleteRecord(record) {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteDoc(doc(db, "medicalRecords", record.id));
      } catch (error) {
        console.error("Error deleting record:", error);
      }
    }
  }

  async function submitForm(data) {
    if (isSubmitting.value) return;

    isSubmitting.value = true;
    try {
      const docId = data.id || `record_${Date.now()}`;

      await setDoc(doc(db, "medicalRecords", docId), {
        ...data,
        id: docId,
        updatedAt: new Date().toISOString(),
      });

      showModal.value = false;
    } catch (error) {
      console.error("Error saving record:", error);
    } finally {
      isSubmitting.value = false;
    }
  }

  onMounted(() => {
    fetchData();
  });

  onUnmounted(() => {
    if (recordsUnsubscribe) recordsUnsubscribe();
    if (healthAlertsUnsubscribe) healthAlertsUnsubscribe();
  });

  return {
    records,
    students,
    searchQuery,
    filterDate,
    showModal,
    showHealthAlert,
    isEditing,
    formData,
    healthAlerts,
    filteredRecords,
    TABLE_HEADERS,
    formatDateShort,
    formatTimeOnly,
    showAddRecord,
    editRecord,
    deleteRecord,
    submitForm,
    // Removed loading state from return values
    dateFilterOptions: DATE_FILTER_OPTIONS,
    appointments,
    isSubmitting,
  };
}

export function useRecordModal(props, { emit }) {
  const { addItem, updateItem, getItem } = useCRUD("medicalRecords");
  const formData = ref({});
  const newSymptom = ref("");
  const newMedication = ref({
    medicationId: "",
    name: "",
    dosage: "",
    strength: "",
    category: "",
    quantity: 1,
  });
  const studentDetails = ref({});
  const medications = ref([]);
  const showMedicationsModal = ref(false);
  const showStudentModal = ref(false);
  const noMedicationWarning = ref(false);
  const isSubmitting = ref(false);
  // Simple text loading state instead of spinner
  const studentsLoading = ref(false);

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
      value: med.id,
      label: `${med.name} (${med.strength}) - Stock: ${med.currentStock}`,
      disabled: med.currentStock <= 0,
    }));
  });

  // Convert students to dropdown options
  const studentOptions = computed(() => {
    return props.students.map((student) => ({
      value: student,
      label: `${student.firstName} ${student.lastName} (${student.studentId})`,
    }));
  });

  onMounted(async () => {
    await fetchMedications();
  });

  watch(
    () => props.initialFormData,
    (newVal) => {
      formData.value = {
        ...newVal,
        symptoms: Array.isArray(newVal.symptoms) ? [...newVal.symptoms] : [],
        medications: Array.isArray(newVal.medications)
          ? [...newVal.medications]
          : [],
      };
      if (props.isEditing && newVal.studentId) {
        fetchStudentData(newVal.studentId);
      }
    },
    { immediate: true, deep: true }
  );

  async function fetchMedications() {
    try {
      const q = query(collection(db, "medications"), orderBy("name"));
      const snapshot = await getDocs(q);
      medications.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching medications:", error);
    }
  }

  async function fetchStudentData(studentId) {
    try {
      studentsLoading.value = true;
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
    } finally {
      studentsLoading.value = false;
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
      if (!Array.isArray(formData.value.symptoms)) {
        formData.value.symptoms = [];
      }
      formData.value.symptoms.push(newSymptom.value.trim());
      newSymptom.value = "";
    }
  }

  function removeSymptom(index) {
    formData.value.symptoms.splice(index, 1);
  }

  function handleMedicationSelect() {
    const selectedMed = medications.value.find(
      (med) => med.id === newMedication.value.medicationId
    );

    if (selectedMed) {
      newMedication.value.name = selectedMed.name;
      newMedication.value.strength = selectedMed.strength;
      newMedication.value.category = selectedMed.category;
    } else {
      newMedication.value.name = "";
      newMedication.value.strength = "";
      newMedication.value.category = "";
    }
  }

  function addMedication() {
    if (newMedication.value.medicationId && newMedication.value.dosage) {
      if (!Array.isArray(formData.value.medications)) {
        formData.value.medications = [];
      }

      const selectedMed = medications.value.find(
        (m) => m.id === newMedication.value.medicationId
      );

      // Get quantity (default to 1 if not specified)
      const quantity = parseInt(newMedication.value.quantity) || 1;

      if (selectedMed && selectedMed.currentStock >= quantity) {
        formData.value.medications.push({
          medicationId: newMedication.value.medicationId,
          name: selectedMed.name,
          dosage: newMedication.value.dosage,
          strength: selectedMed.strength,
          category: selectedMed.category,
          quantity: quantity,
        });

        newMedication.value = {
          medicationId: "",
          name: "",
          dosage: "",
          strength: "",
          category: "",
          quantity: 1,
        };
        noMedicationWarning.value = false;
      }
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

      // Refresh medications list
      await fetchMedications();

      // Update the dropdown options
      newMedication.value = {
        medicationId: "",
        name: "",
        dosage: "",
        strength: "",
        category: "",
        quantity: 1,
      };

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
      formData.value.studentId = studentData.studentId;
      formData.value.studentName = `${studentData.firstName} ${studentData.lastName}`;
      fetchStudentData(studentData.studentId);

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

  function determineStatus(currentStock, minimumStock) {
    if (currentStock <= 0) return "Out of Stock";
    if (currentStock <= minimumStock) return "Low Stock";
    return "In Stock";
  }

  async function submitForm() {
    if (isSubmitting.value) return;

    isSubmitting.value = true;

    try {
      // Validate at least one medication is added
      if (
        !Array.isArray(formData.value.medications) ||
        formData.value.medications.length === 0
      ) {
        noMedicationWarning.value = true;
        isSubmitting.value = false;
        return;
      }

      if (!formData.value.date) {
        formData.value.date = new Date().toISOString().split("T")[0];
      }

      if (!formData.value.id) {
        formData.value.id = `record_${Date.now()}`;
      }

      // Make sure symptoms is an array
      if (!Array.isArray(formData.value.symptoms)) {
        formData.value.symptoms = [];
      }

      // Update medication inventory
      if (formData.value.medications && formData.value.medications.length > 0) {
        for (const med of formData.value.medications) {
          if (med.medicationId) {
            try {
              // Get the current medication data
              const medicationRef = doc(db, "medications", med.medicationId);
              const medicationSnapshot = await getDoc(medicationRef);

              if (medicationSnapshot.exists()) {
                const medicationData = medicationSnapshot.data();

                // Get the quantity to deduct (default to 1 if not specified)
                const quantityToDeduct = parseInt(med.quantity) || 1;

                // Ensure we don't go below zero
                const newStock = Math.max(
                  0,
                  medicationData.currentStock - quantityToDeduct
                );

                // Update the medication stock directly
                await updateDoc(medicationRef, {
                  currentStock: newStock,
                  status: determineStatus(
                    newStock,
                    medicationData.minimumStock
                  ),
                  updatedAt: serverTimestamp(),
                });
              }
            } catch (error) {
              console.error(
                `Error updating medication ${med.medicationId}:`,
                error
              );
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
    } finally {
      isSubmitting.value = false;
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
    documentLabels: DOCUMENT_LABELS,
    medicationOptions,
    studentOptions,
    statusOptions: STATUS_OPTIONS,
    noMedicationWarning,
    isSubmitting,
    studentsLoading,
    addSymptom,
    removeSymptom,
    handleMedicationSelect,
    addMedication,
    removeMedication,
    closeModal,
    submitForm,
    handleMedicationSubmit,
    handleStudentSubmit,
  };
}

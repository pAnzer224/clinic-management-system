import { ref, computed, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import {
  serverTimestamp,
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs,
} from "firebase/firestore";
import { handleImageUpload } from "@/utils/image-utils";
import { handleDocumentUpload } from "@/utils/document-upload-utils";
import { useCRUD } from "@/utils/firebaseCRUD";
import { logActivity } from "@/utils/activity-logger";
import { db } from "@/firebase-config";

// Constants
export const courseOptions = [
  { value: "", label: "Choose a Course" },
  { value: "BSCRIM", label: "BSCRIM" },
  { value: "BEED", label: "BEED" },
  { value: "BSED", label: "BSED" },
  { value: "BSIT", label: "BSIT" },
  { value: "BSAB", label: "BSAB" },
  { value: "HM", label: "HM" },
];

export const yearLevelOptions = [
  { value: "1st Year", label: "1st Year" },
  { value: "2nd Year", label: "2nd Year" },
  { value: "3rd Year", label: "3rd Year" },
  { value: "4th Year", label: "4th Year" },
];

export const schoolYearOptions = [
  { value: "", label: "Choose a School Year" },
  { value: "2023-2024", label: "2023-2024" },
  { value: "2024-2025", label: "2024-2025" },
  { value: "2025-2026", label: "2025-2026" },
];

export const sexOptions = [
  { value: "", label: "Select Sex" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export const documentLabels = {
  medicalCertificate: "Medical Certificate",
  urinalysisReport: "Urinalysis Report",
  radiologicReport: "Radiologic Report",
  hematologyReport: "Hematology Report",
  drugTestReport: "Drug Test Report",
  dentalHealthChart: "Dental Health Chart",
  healthExam: "Health Examination Form",
  physicalExam: "Physical Examination Form",
};

export const acceptedDocumentTypes =
  ".pdf,.doc,.docx,.jpg,.jpeg,.png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png";

const INITIAL_FORM = {
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
  schoolYear: "",
  guardianName: "",
  guardianOccupation: "",
  guardianAddress: "",
  guardianContact: "",
  profileImage: "",
  labTest: "",
  documents: {},
};

// Student Modal Functionality
export function useStudentModal(props, emit) {
  const fileInput = ref(null);
  const imagePreview = ref(null);
  const currentStep = ref(1);
  const healthExamFormRef = ref(null);
  const physicalExamFormRef = ref(null);
  const showDocumentViewer = ref(false);
  const selectedDocument = ref("");
  const formScrollContainer = ref(null);
  const activeAccordion = ref(null);

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
      schoolYear: "",
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
      physicalExam: "",
    },
    healthExamData: {},
    physicalExamData: {},
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
          schoolYear: newVal.schoolYear || "",
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
          physicalExam: newVal.documents?.physicalExam || "",
        },
        healthExamData: newVal.healthExamData || {},
        physicalExamData: newVal.physicalExamData || {},
      };
      imagePreview.value = newVal.profileImage || null;
    },
    { immediate: true, deep: true }
  );

  watch(currentStep, () => {
    nextTick(() => {
      if (formScrollContainer.value) {
        formScrollContainer.value.scrollTop = 0;
      }
    });
  });

  const upcomingAppointments = computed(() => {
    return props.appointments.filter((apt) => new Date(apt.date) > new Date());
  });

  const concludedAppointments = computed(() => {
    return props.appointments.filter((apt) => new Date(apt.date) <= new Date());
  });

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
        alert(error.message);
        event.target.value = "";
      }
    }
  }

  function updateHealthExamData(newData) {
    formData.value.healthExamData = newData;
  }

  function updatePhysicalExamData(newData) {
    formData.value.physicalExamData = newData;
  }

  function updateDocument(documentData) {
    if (documentData && documentData.key && documentData.data) {
      formData.value.documents[documentData.key] = documentData.data;
    }
  }

  async function handleNext() {
    if (currentStep.value === 2) {
      if (healthExamFormRef.value) {
        const healthExamData = healthExamFormRef.value.saveFormData();
        updateHealthExamData(healthExamData);
        if (healthExamFormRef.value.generatePdf) {
          const canvas = await healthExamFormRef.value.generatePdf();
          formData.value.documents.healthExam = canvas;
        }
      }
    } else if (currentStep.value === 3) {
      if (physicalExamFormRef.value) {
        const physicalExamData = physicalExamFormRef.value.saveFormData();
        updatePhysicalExamData(physicalExamData);
        if (physicalExamFormRef.value.generatePdf) {
          const canvas = await physicalExamFormRef.value.generatePdf();
          formData.value.documents.physicalExam = canvas;
        }
      }
    }
    currentStep.value++;
  }

  function handlePrevious() {
    currentStep.value--;
  }

  function viewDocument(documentData) {
    selectedDocument.value = documentData;
    showDocumentViewer.value = true;
  }

  function closeModal() {
    currentStep.value = 1;
    emit("update:modelValue", false);
  }

  function handleBackgroundClick(event) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  async function handleFormSubmit() {
    if (!props.isEditing && currentStep.value < 4) {
      currentStep.value++;
      return;
    }

    const submissionData = {
      ...formData.value.personalInfo,
      ...formData.value.academicInfo,
      ...formData.value.emergencyContact,
      profileImage: formData.value.profileImage,
      documents: formData.value.documents,
      healthExamData: formData.value.healthExamData,
      physicalExamData: formData.value.physicalExamData,
      id: formData.value.personalInfo.studentId,
    };

    closeModal();
    emit("submit", submissionData);
  }

  function toggleAccordion(section) {
    activeAccordion.value = activeAccordion.value === section ? null : section;
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return {
    fileInput,
    formData,
    imagePreview,
    activeAccordion,
    currentStep,
    healthExamFormRef,
    physicalExamFormRef,
    showDocumentViewer,
    selectedDocument,
    upcomingAppointments,
    concludedAppointments,
    formScrollContainer,
    handleImageChange,
    handleDocumentChange,
    viewDocument,
    closeModal,
    handleBackgroundClick,
    handleFormSubmit,
    formatDate,
    toggleAccordion,
    handleNext,
    handlePrevious,
    updateHealthExamData,
    updatePhysicalExamData,
    updateDocument,
  };
}

// Students List Functionality
export function useStudentsList() {
  const route = useRoute();
  const {
    items: students,
    loading,
    error,
    listenToChanges,
    stopListening,
    addItem,
    updateItem,
    deleteItem,
  } = useCRUD("students");

  const searchQuery = ref("");
  const filterYear = ref("");
  const filterSchoolYear = ref("");
  const showModal = ref(false);
  const isEditing = ref(false);
  const formData = ref({ ...INITIAL_FORM });
  const showToast = ref(false);
  const toastMessage = ref("");
  const currentUser = ref(
    JSON.parse(localStorage.getItem("currentUser")) || {}
  );
  const appointments = ref([]);
  const studentMedicalRecords = ref([]);
  let unsubscribeAppointments = null;
  let unsubscribeMedicalRecords = null;

  function listenToAppointments() {
    const appointmentsQuery = query(
      collection(db, "appointments"),
      orderBy("date"),
      orderBy("time")
    );

    unsubscribeAppointments = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        appointments.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      },
      (error) => {
        console.error("Error fetching appointments:", error);
      }
    );
  }

  async function fetchMedicalRecords(studentId) {
    try {
      const medicalsRef = collection(db, "medicalRecords");
      const q = query(
        medicalsRef,
        where("studentId", "==", studentId),
        orderBy("date", "desc")
      );
      const snapshot = await getDocs(q);
      studentMedicalRecords.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching medical records:", error);
      studentMedicalRecords.value = [];
    }
  }

  const yearFilterOptions = computed(() => {
    return [
      { value: "", label: "All Years" },
      ...yearLevelOptions.map((year) => ({
        value: year.value,
        label: year.label,
      })),
    ];
  });

  const schoolYearFilterOptions = computed(() => {
    return [
      { value: "", label: "All Academic Years" },
      ...schoolYearOptions
        .filter((opt) => opt.value)
        .map((year) => ({ value: year.value, label: year.label })),
    ];
  });

  const filteredStudents = computed(() => {
    return students.value.filter((student) => {
      const matchesYear =
        !filterYear.value || student.yearLevel === filterYear.value;
      const matchesSchoolYear =
        !filterSchoolYear.value ||
        student.schoolYear === filterSchoolYear.value;
      const searchLower = searchQuery.value.toLowerCase();
      return (
        matchesYear &&
        matchesSchoolYear &&
        (!searchQuery.value ||
          student.lastName?.toLowerCase().includes(searchLower) ||
          student.firstName?.toLowerCase().includes(searchLower) ||
          student.studentId?.toLowerCase().includes(searchLower))
      );
    });
  });

  function showNotification(message) {
    toastMessage.value = message;
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  }

  function initializeStudents() {
    if (route.query.openModal === "true") {
      add();
    }
    listenToChanges();
    listenToAppointments();
  }

  function add() {
    isEditing.value = false;
    formData.value = { ...INITIAL_FORM };
    studentMedicalRecords.value = []; // Clear medical records when adding new student
    showModal.value = true;
  }

  async function editStudent(student) {
    isEditing.value = true;
    formData.value = { ...student };

    // Fetch medical records for this student
    await fetchMedicalRecords(student.studentId);

    showModal.value = true;
  }

  async function deleteStudent(student) {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteItem(student.studentId);
        logActivity({
          type: "student",
          action: "delete",
          title: "Student Removed",
          description: `Removed student ${student.firstName} ${student.lastName}`,
          timestamp: serverTimestamp(),
        });
        showNotification(
          `Student ${student.firstName} ${student.lastName} has been deleted`
        );
      } catch (error) {
        console.error("Error deleting student:", error);
        showNotification("Error deleting student");
      }
    }
  }

  async function submitForm(data) {
    try {
      const submitData = {
        ...data,
        id: data.studentId,
        updatedAt: serverTimestamp(),
      };

      if (!isEditing.value) {
        submitData.createdAt = serverTimestamp();
        await addItem(submitData);
      } else {
        await updateItem(submitData);
      }

      await logActivity({
        type: "student",
        action: isEditing.value ? "update" : "create",
        title: isEditing.value ? "Student Updated" : "New Student Added",
        description: isEditing.value
          ? `Updated student information for ${data.firstName} ${data.lastName}`
          : `Added new student ${data.firstName} ${data.lastName}`,
        timestamp: serverTimestamp(),
      });

      showNotification(
        `Student ${data.firstName} ${data.lastName} has been ${
          isEditing.value ? "updated" : "added"
        }`
      );
    } catch (error) {
      console.error("Error saving student:", error);
      showNotification("Error saving student information");
    }
  }

  function cleanup() {
    if (unsubscribeAppointments) {
      unsubscribeAppointments();
    }
    if (unsubscribeMedicalRecords) {
      unsubscribeMedicalRecords();
    }
    stopListening();
  }

  return {
    students,
    loading,
    error,
    searchQuery,
    filterYear,
    filterSchoolYear,
    showModal,
    isEditing,
    formData,
    filteredStudents,
    yearFilterOptions,
    schoolYearFilterOptions,
    showToast,
    toastMessage,
    currentUser,
    appointments,
    studentMedicalRecords,
    initializeStudents,
    add,
    editStudent,
    deleteStudent,
    submitForm,
    cleanup,
    fetchMedicalRecords,
  };
}

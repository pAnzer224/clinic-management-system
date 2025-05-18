import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
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
import {
  uploadImageToSupabase,
  uploadDocumentToSupabase,
} from "@/utils/supabase-storage";
import { useCRUD } from "@/utils/firebaseCRUD";
import { logActivity } from "@/utils/activity-logger";
import { db } from "@/firebase-config";

// Constants for course and form options
export const courseOptions = [
  { value: "", label: "Choose a Course" },
  { value: "BSCRIM", label: "BSCRIM" },
  { value: "BEED", label: "BEED" },
  { value: "BSED", label: "BSED" },
  { value: "BSIT", label: "BSIT" },
  { value: "BSAB", label: "BSAB" },
  { value: "BSHM", label: "BSHM" },
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

// Document type labels for UI display
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

// Accepted file types for document uploads
export const acceptedDocumentTypes =
  ".pdf,.doc,.docx,.jpg,.jpeg,.png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png";

// Initial form structure for student data
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

// Student Modal Functionality - handles modal operations and form logic
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
  const allStudents = ref([]);
  let studentsUnsubscribe = null;

  // Form data structure with organized sections
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

    // Document loading states
    medicalCertificateLoading: false,
    urinalysisReportLoading: false,
    radiologicReportLoading: false,
    hematologyReportLoading: false,
    drugTestReportLoading: false,
    dentalHealthChartLoading: false,
    healthExamLoading: false,
    physicalExamLoading: false,
    healthExamData: {},
    physicalExamData: {},
  });

  // Watch for changes in initial form data and populate form
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

  // Auto-scroll to top when changing steps
  watch(currentStep, () => {
    nextTick(() => {
      if (formScrollContainer.value) {
        formScrollContainer.value.scrollTop = 0;
      }
    });
  });

  // Setup real-time listener for all students data
  function setupStudentsListener() {
    const q = query(collection(db, "students"), orderBy("lastName"));
    studentsUnsubscribe = onSnapshot(q, (snapshot) => {
      allStudents.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    });
  }

  onMounted(() => {
    setupStudentsListener();
  });

  onUnmounted(() => {
    if (studentsUnsubscribe) {
      studentsUnsubscribe();
    }
  });

  // Filter appointments by date for upcoming/concluded
  const upcomingAppointments = computed(() => {
    return props.appointments.filter((apt) => new Date(apt.date) > new Date());
  });

  const concludedAppointments = computed(() => {
    return props.appointments.filter((apt) => new Date(apt.date) <= new Date());
  });

  // Handle profile image upload and preview
  async function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = await uploadImageToSupabase(file);
      imagePreview.value = imageUrl;
      formData.value.profileImage = imageUrl;
    }
  }

  // Handle document file uploads
  async function handleDocumentChange(event, documentKey) {
    const file = event.target.files[0];
    if (file) {
      try {
        const fileUrl = await uploadDocumentToSupabase(file, "image-uploads");
        formData.value.documents[documentKey] = fileUrl;
      } catch (error) {
        alert(error.message);
        event.target.value = "";
      }
    }
  }

  // Update health exam data from child component
  function updateHealthExamData(newData) {
    formData.value.healthExamData = newData;
  }

  // Update physical exam data from child component
  function updatePhysicalExamData(newData) {
    formData.value.physicalExamData = newData;
  }

  // Update document data from child components
  function updateDocument(documentData) {
    if (documentData && documentData.key && documentData.data) {
      formData.value.documents[documentData.key] = documentData.data;
    }
  }

  // Handle next step button in multi-step form
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

  // Handle previous step button
  function handlePrevious() {
    currentStep.value--;
  }

  // Open document viewer modal
  function viewDocument(documentData) {
    selectedDocument.value = documentData;
    showDocumentViewer.value = true;
  }

  // Close the modal and reset state
  function closeModal() {
    currentStep.value = 1;
    emit("update:modelValue", false);
  }

  // Handle form submission
  async function handleFormSubmit() {
    if (!props.isEditing && currentStep.value < 4) {
      currentStep.value++;
      return;
    }

    // Prepare submission data by flattening form structure
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

  // Toggle accordion sections
  function toggleAccordion(section) {
    activeAccordion.value = activeAccordion.value === section ? null : section;
  }

  // Format date for display
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
    allStudents,
    handleImageChange,
    handleDocumentChange,
    viewDocument,
    closeModal,
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

// Students List Functionality - handles the main students listing page
export function useStudentsList() {
  const route = useRoute();
  // Removed loading spinner dependency, using simple boolean flag
  const loading = ref(true);
  const error = ref(null);
  const students = ref([]);
  let studentsUnsubscribe = null;

  // Filter and search states
  const searchQuery = ref("");
  const filterYear = ref("");
  const filterSchoolYear = ref("");

  // Modal states
  const showModal = ref(false);
  const isEditing = ref(false);
  const formData = ref({ ...INITIAL_FORM });

  // Notification states
  const showToast = ref(false);
  const toastMessage = ref("");

  // User and related data
  const currentUser = ref(
    JSON.parse(localStorage.getItem("currentUser")) || {}
  );
  const appointments = ref([]);
  const studentMedicalRecords = ref([]);
  let unsubscribeAppointments = null;
  let unsubscribeMedicalRecords = null;

  // Setup Firestore listeners for real-time updates without heavy spinner dependencies
  function listenToStudentChanges() {
    loading.value = true;
    const studentsRef = collection(db, "students");
    const q = query(studentsRef, orderBy("lastName"));

    studentsUnsubscribe = onSnapshot(
      q,
      (snapshot) => {
        students.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Set loading to false immediately after data is received
        loading.value = false;
      },
      (err) => {
        console.error("Error fetching students:", err);
        error.value = err.message;
        loading.value = false;
      }
    );
  }

  // Listen to appointments collection for real-time updates
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

  // Listen to medical records for specific student
  function listenToStudentMedicalRecords(studentId) {
    if (unsubscribeMedicalRecords) {
      unsubscribeMedicalRecords();
    }

    if (!studentId) return;

    const medicalsRef = collection(db, "medicalRecords");
    const q = query(
      medicalsRef,
      where("studentId", "==", studentId),
      orderBy("date", "desc")
    );

    unsubscribeMedicalRecords = onSnapshot(
      q,
      (snapshot) => {
        studentMedicalRecords.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      },
      (error) => {
        console.error("Error fetching medical records:", error);
        studentMedicalRecords.value = [];
      }
    );
  }

  // Fetch medical records for a specific student
  async function fetchMedicalRecords(studentId) {
    try {
      listenToStudentMedicalRecords(studentId);
    } catch (error) {
      console.error("Error fetching medical records:", error);
      studentMedicalRecords.value = [];
    }
  }

  // Computed filter options for year levels
  const yearFilterOptions = computed(() => {
    return [
      { value: "", label: "All Years" },
      ...yearLevelOptions.map((year) => ({
        value: year.value,
        label: year.label,
      })),
    ];
  });

  // Computed filter options for school years
  const schoolYearFilterOptions = computed(() => {
    return [
      { value: "", label: "All Academic Years" },
      ...schoolYearOptions
        .filter((opt) => opt.value)
        .map((year) => ({ value: year.value, label: year.label })),
    ];
  });

  // Filter students based on search and filter criteria
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

  // Show notification toast message
  function showNotification(message) {
    toastMessage.value = message;
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  }

  // Initialize students data and listeners
  function initializeStudents() {
    if (route.query.openModal === "true") {
      add();
    }
    listenToStudentChanges();
    listenToAppointments();
  }

  // Open modal for adding new student
  function add() {
    isEditing.value = false;
    formData.value = { ...INITIAL_FORM };
    studentMedicalRecords.value = []; // Clear medical records when adding new student
    showModal.value = true;
  }

  // Open modal for editing existing student
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
        // Use CRUD helper for deletion
        const { deleteItem } = useCRUD("students");
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

      // Use CRUD helper for add/update operations
      const { addItem, updateItem } = useCRUD("students");

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
    if (studentsUnsubscribe) {
      studentsUnsubscribe();
    }
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

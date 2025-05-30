<template>
  <main class="flex-1 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Medical Records</h1>
      <div class="flex gap-2">
        <button
          @click="showAddRecord"
          class="bg-blue1 hover:bg-blue1/80 text-white px-4 py-2 rounded-full text-[15px]"
        >
          Add Record
        </button>
        <div class="relative group">
          <button
            @click="downloadTableAsPDF"
            class="text-blue1 hover:text-blue1/80 flex items-center justify-center h-full"
          >
            <Download class="size-6" />
          </button>
          <div
            class="absolute z-10 bottom-[-33px] left-[-98px] tracking-wide bg-gray-800/70 text-background text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
          >
            Download as PDF
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div class="bg-white rounded-2xl px-8 pt-8 pb-2 shadow-sm">
        <div class="flex gap-4 mb-6 text-[13px] relative">
          <div class="relative w-80 flex-1">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            />
            <input
              type="search"
              v-model="searchQuery"
              placeholder="Search by student name or ID..."
              class="pl-10 px-4 py-2 rounded-full bg-graytint/40 border border-text/20 focus:ring-1 focus:ring-blue1/50 focus:outline-none"
            />
          </div>
          <Dropdown
            v-model="filterDate"
            :options="dateFilterOptions"
            class="w-40"
          />
        </div>

        <!-- Simple loading text instead of spinner -->
        <div v-if="loading" class="flex justify-center items-center py-8">
          <p class="text-black text-sm">
            Please wait, loading medical records...
          </p>
        </div>

        <div v-else class="relative">
          <!-- Table header - sticky at top of viewport -->
          <div class="sticky top-0 bg-white z-10">
            <table class="w-full table-fixed">
              <thead>
                <tr class="text-left text-text/60">
                  <th class="pb-4 w-1/6">Date</th>
                  <th class="pb-4 w-1/6">Student Name</th>
                  <th class="pb-4 w-1/6">Student ID</th>
                  <th class="pb-4 w-1/6">Chief Complaint</th>
                  <th class="pb-4 w-1/6">Treatment</th>
                  <th class="pb-4 w-1/6">Remarks</th>
                  <th class="pb-4 w-16 text-center">Actions</th>
                </tr>
              </thead>
            </table>
            <!-- Table header separator line -->
            <div
              class="absolute bottom-0 left-0 right-0 border-t border-graytint"
            ></div>
          </div>

          <!-- Scrollable table body -->
          <div class="relative">
            <div
              class="min-h-[calc(100.2vh-335px)] max-h-[calc(100.2vh-335px)] overflow-y-scroll no-scrollbar"
            >
              <table class="w-full table-fixed">
                <tbody>
                  <tr
                    v-for="record in paginatedRecords"
                    :key="record.id"
                    class="border-t border-graytint/50"
                  >
                    <!-- Date column with formatted date and time -->
                    <td class="py-4 w-1/6">
                      <div class="flex flex-col">
                        <span>{{ formatDate(record.date) }}</span>
                        <span class="text-xs text-gray-500">{{
                          formatTime(record.date)
                        }}</span>
                      </div>
                    </td>
                    <!-- Student name column -->
                    <td class="w-1/6 truncate">{{ record.studentName }}</td>
                    <!-- Student ID column -->
                    <td class="w-1/6">{{ record.studentId }}</td>
                    <!-- Chief complaint column -->
                    <td class="w-1/6 truncate">{{ record.chiefComplaint }}</td>
                    <!-- Treatment column -->
                    <td class="w-1/6 truncate">{{ record.treatment }}</td>
                    <!-- Remarks column -->
                    <td class="w-1/6">{{ record.remarks }}</td>
                    <!-- Actions column with edit, refer, and delete buttons -->
                    <td class="w-16 text-center">
                      <div class="flex justify-center">
                        <button
                          @click="editRecord(record)"
                          class="text-blue2/90 hover:text-blue1 p-1"
                          title="Edit Record"
                        >
                          <Eye class="h-4 w-4" />
                        </button>
                        <button
                          @click="showReferralModal(record)"
                          class="text-green-600 hover:text-green-700 p-1"
                          title="Refer to Hospital"
                        >
                          <Stethoscope class="h-4 w-4" />
                        </button>
                        <button
                          @click="deleteRecord(record)"
                          class="text-red-600 hover:text-red-700 p-1"
                          title="Delete Record"
                        >
                          <Trash2 class="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Bottom fade gradient effect -->
            <div
              class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Component - only show if more than one page -->
    <Pagination
      v-if="totalRecordPages > 1"
      v-model="currentPage"
      :total-pages="totalRecordPages"
    />

    <!-- Modal for adding/editing medical records -->
    <RecordModal
      v-model="showModal"
      :is-editing="isEditing"
      :initial-form-data="formData"
      :students="students"
      :appointments="appointments"
      @submit="submitForm"
    />

    <!-- Hospital Referral Modal for referring patients to hospital -->
    <HospitalReferralModal
      v-model="showHospitalReferral"
      :record-data="selectedRecord"
      @referral-submitted="handleReferralSubmitted"
    />

    <!-- Health Alerts Modal - displays urgent health notifications -->
    <div
      v-if="showHealthAlert"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div class="bg-white rounded-2xl p-6 shadow-lg w-[400px]">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-satoshi-bold">Health Alerts</h3>
          <button @click="showHealthAlert = false" class="text-gray-500">
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="space-y-2">
          <div
            v-for="alert in healthAlerts"
            :key="alert.id"
            class="p-3 bg-red-50 rounded-lg"
          >
            <p class="text-red-700 font-medium">{{ alert.message }}</p>
            <p class="text-sm text-red-600">{{ alert.date }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity Toast - success notifications for user actions -->
    <div
      v-if="showToast"
      class="fixed bottom-4 right-4 bg-blue1 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500"
      :class="{ 'opacity-100': showToast, 'opacity-0': !showToast }"
    >
      {{ toastMessage }}
    </div>
  </main>
</template>

<script>
import { useRecordsList } from "@/composables/recordManagement";
import { Download, Eye, Trash2, X, Search, Stethoscope } from "lucide-vue-next";
import RecordModal from "@/components/RecordModal.vue";
import StudentModal from "@/components/StudentModal.vue";
import HospitalReferralModal from "@/components/HospitalReferralModal.vue";
// Removed IntersectingCirclesSpinner import for faster loading
import Dropdown from "@/components/Dropdown.vue";
import Pagination from "@/components/Pagination.vue";
import { ref, computed, onMounted } from "vue";
import { serverTimestamp } from "firebase/firestore";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import logoSrc from "@/assets/images/logo.png";
import cpsuLogoSrc from "@/assets/images/cpsulogo.png";

export default {
  name: "Records",
  components: {
    RecordModal,
    Download,
    Eye,
    Trash2,
    X,
    Search,
    Stethoscope,
    // Removed IntersectingCirclesSpinner from components
    Dropdown,
    StudentModal,
    Pagination,
    HospitalReferralModal,
  },
  setup() {
    // Get composable functions and reactive data for record management
    const {
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
      loading, // Keep for simple loading state management
      dateFilterOptions,
      appointments,
      showAddRecord,
      editRecord,
      deleteRecord,
      submitForm,
      isSubmitting,
    } = useRecordsList();

    // Toast notification system for user feedback
    const showToast = ref(false);
    const toastMessage = ref("");

    // Function to display a toast message with automatic dismissal
    const displayToast = (message) => {
      toastMessage.value = message;
      showToast.value = true;
      setTimeout(() => {
        showToast.value = false;
      }, 3000); // Toast will disappear after 3 seconds
    };

    // Pagination configuration for efficient data display
    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    // Computed property to slice records based on current page
    const paginatedRecords = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage.value;
      const endIndex = startIndex + itemsPerPage.value;
      return filteredRecords.value.slice(startIndex, endIndex);
    });

    // Calculate total pages needed for pagination controls
    const totalRecordPages = computed(() => {
      return Math.ceil(filteredRecords.value.length / itemsPerPage.value) || 1;
    });

    // Date Formatting Functions for consistent display across application
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const formatTime = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Hospital referral system for patient management
    const showHospitalReferral = ref(false);
    const selectedRecord = ref(null);

    // Open referral modal with selected patient record
    const showReferralModal = (record) => {
      selectedRecord.value = record;
      showHospitalReferral.value = true;
    };

    // Handle successful referral submission with user feedback
    const handleReferralSubmitted = (referralData) => {
      displayToast(
        `Referral created for ${referralData.patientName} to ${referralData.hospitalName}`
      );
    };

    // PDF Download Method - generates comprehensive report of medical records
    const downloadTableAsPDF = () => {
      const doc = new jsPDF("landscape");

      // Set page margins to center content properly on page
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      const centerX = pageWidth / 2;

      // Add clinic logo to left side of header
      const logoWidth = 20;
      const logoHeight = 20;
      doc.addImage(logoSrc, "PNG", margin, margin, logoWidth, logoHeight);

      // Add CPSU Logo to right side of header
      const cpsuLogoWidth = 20;
      const cpsuLogoHeight = 20;
      doc.addImage(
        cpsuLogoSrc,
        "PNG",
        pageWidth - margin - cpsuLogoWidth,
        margin,
        cpsuLogoWidth,
        cpsuLogoHeight
      );

      // Add main title centered
      doc.setFontSize(18);
      doc.text(
        "Clinic Management System - Medical Records",
        centerX,
        margin + 12,
        { align: "center" }
      );

      // Add current date stamp
      doc.setFontSize(10);
      doc.text(
        `As of: ${new Date().toLocaleDateString()}`,
        centerX,
        margin + 18,
        { align: "center" }
      );

      // Define table column headers
      const tableColumns = [
        "Date",
        "Name",
        "Course",
        "Chief Complaint",
        "Treatment",
        "Remarks",
      ];

      // Format data for table display
      const tableData = filteredRecords.value.map((record) => [
        `${formatDate(record.date)}\n${formatTime(record.date)}`,
        record.studentName,
        record.student?.course || "",
        record.chiefComplaint,
        record.treatment,
        record.remarks || "",
      ]);

      // Generate the table with centered configuration and styling
      autoTable(doc, {
        startY: margin + 30,
        head: [tableColumns],
        body: tableData,
        theme: "striped",
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: "linebreak",
          halign: "center",
          valign: "middle",
        },
        headStyles: {
          fillColor: [63, 115, 206],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: contentWidth * 0.13 }, // Date
          1: { cellWidth: contentWidth * 0.17 }, // Name
          2: { cellWidth: contentWidth * 0.13 }, // Course
          3: { cellWidth: contentWidth * 0.22 }, // Chief Complaint
          4: { cellWidth: contentWidth * 0.22 }, // Treatment
          5: { cellWidth: contentWidth * 0.13 }, // Remarks
        },
        didDrawPage: function (data) {
          // Add header on subsequent pages
          if (data.pageNumber > 1) {
            doc.setFontSize(12);
            doc.text(
              "Clinic Management System - Medical Records",
              centerX,
              margin / 2,
              { align: "center" }
            );
          }

          // Add page number at bottom center
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber}`,
            centerX,
            pageHeight - margin / 2,
            { align: "center" }
          );
        },
      });

      // Download the generated PDF
      doc.save("medical_records.pdf");
    };

    // Enhanced submitForm with user feedback notifications
    const handleSubmitForm = async (formData) => {
      await submitForm(formData);
      // After successful submission, show appropriate feedback
      if (isEditing.value) {
        displayToast(
          `Medical record for ${formData.studentName} updated successfully`
        );
      } else {
        displayToast(
          `Medical record for ${formData.studentName} added successfully`
        );
      }
      // Close modal immediately after submission for better UX
      showModal.value = false;
    };

    // Enhanced deleteRecord with user feedback notifications
    const handleDeleteRecord = async (record) => {
      await deleteRecord(record);
      // After successful deletion, notify user
      displayToast(
        `Medical record for ${record.studentName} deleted successfully`
      );
    };

    // Return all necessary data and functions for component usage
    return {
      // Core record management functionality
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
      loading, // Keep for simple loading state
      dateFilterOptions,
      appointments,
      showAddRecord,
      editRecord,
      deleteRecord: handleDeleteRecord,
      submitForm: handleSubmitForm,
      isSubmitting,
      // Pagination functionality
      currentPage,
      itemsPerPage,
      paginatedRecords,
      totalRecordPages,
      // Additional features
      downloadTableAsPDF,
      formatDate,
      formatTime,
      showToast,
      toastMessage,
      showHospitalReferral,
      selectedRecord,
      showReferralModal,
      handleReferralSubmitted,
    };
  },
};
</script>

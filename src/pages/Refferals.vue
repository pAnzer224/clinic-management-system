<template>
  <main class="flex-1 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Hospital Referrals</h1>
      <div class="flex gap-2">
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
              placeholder="Search by patient name or hospital..."
              class="pl-10 px-4 py-2 rounded-full bg-graytint/40 border border-text/20 focus:ring-1 focus:ring-blue1/50 focus:outline-none"
            />
          </div>
          <Dropdown
            v-model="filterDate"
            :options="dateFilterOptions"
            class="w-40"
          />
        </div>

        <div v-if="loading" class="flex justify-center items-center py-8">
          <intersecting-circles-spinner
            :animation-duration="1200"
            :size="70"
            color="#3f73ce"
          />
        </div>

        <div
          v-else-if="filteredReferrals.length === 0"
          class="py-10 text-center text-gray-500"
        >
          <Stethoscope class="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <p>No referrals found.</p>
        </div>

        <div v-else class="relative">
          <div class="sticky top-0 bg-white z-10">
            <table class="w-full table-fixed">
              <thead>
                <tr class="text-left text-text/60">
                  <th class="pb-4 w-1/6">Date</th>
                  <th class="pb-4 w-1/6">Patient Name</th>
                  <th class="pb-4 w-1/6">Referred From</th>
                  <th class="pb-4 w-1/6">Referred To</th>
                  <th class="pb-4 w-1/6">Reason</th>
                  <th class="pb-4 w-1/12">Actions</th>
                </tr>
              </thead>
            </table>
            <div
              class="absolute bottom-0 left-0 right-0 border-t border-graytint"
            ></div>
          </div>

          <div class="relative">
            <div
              class="min-h-[calc(100.2vh-335px)] max-h-[calc(100.2vh-335px)] overflow-y-scroll no-scrollbar"
            >
              <table class="w-full table-fixed">
                <tbody>
                  <tr
                    v-for="referral in paginatedReferrals"
                    :key="referral.id"
                    class="border-t border-graytint/50"
                  >
                    <td class="py-4 w-1/6">
                      <div class="flex flex-col">
                        <span>{{ formatDate(referral.referral_date) }}</span>
                        <span class="text-xs text-gray-500">{{
                          formatDate(referral.created_at)
                        }}</span>
                      </div>
                    </td>
                    <td class="w-1/6 truncate">{{ referral.patient_name }}</td>
                    <td class="w-1/6 truncate">{{ referral.referred_from }}</td>
                    <td class="w-1/6 truncate">{{ referral.referred_to }}</td>
                    <td class="w-1/6 truncate">
                      {{ referral.reason_for_referral }}
                    </td>
                    <td class="w-1/12 space-x-2">
                      <button
                        @click="viewReferral(referral)"
                        class="text-blue2/90 hover:text-blue1"
                      >
                        <Eye class="h-5 w-5 inline" />
                      </button>
                      <button
                        @click="deleteReferral(referral)"
                        class="text-red-600"
                      >
                        <Trash2 class="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Component -->
    <Pagination
      v-if="totalPages > 1"
      v-model="currentPage"
      :total-pages="totalPages"
    />

    <!-- Referral Document Viewer -->
    <DocumentViewerModal
      :show="showDocumentViewer"
      :documentUrl="selectedReferralImage"
      @close="showDocumentViewer = false"
    />

    <!-- Hospital Referral Modal for editing/viewing -->
    <HospitalReferralModal
      v-model="showReferralModal"
      :record-data="selectedReferral"
      view-only
    />

    <!-- Activity Toast -->
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
import { Download, Eye, Trash2, Search, Stethoscope } from "lucide-vue-next";
import HospitalReferralModal from "@/components/HospitalReferralModal.vue";
import DocumentViewerModal from "@/components/DocumentViewerModal.vue";
import { IntersectingCirclesSpinner } from "epic-spinners";
import Dropdown from "@/components/Dropdown.vue";
import Pagination from "@/components/Pagination.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import logoSrc from "@/assets/images/logo.png";
import cpsuLogoSrc from "@/assets/images/cpsulogo.png";

export default {
  name: "Referrals",
  components: {
    Download,
    Eye,
    Trash2,
    Search,
    Stethoscope,
    IntersectingCirclesSpinner,
    Dropdown,
    Pagination,
    HospitalReferralModal,
    DocumentViewerModal,
  },
  setup() {
    const referrals = ref([]);
    const loading = ref(true);
    const searchQuery = ref("");
    const filterDate = ref("");

    // Initialize Supabase client
    const supabaseUrl = "https://wfornkmxdpgtxvatwzne.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmb3Jua214ZHBndHh2YXR3em5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMjY5MzAsImV4cCI6MjA1NjgwMjkzMH0.hkUPR7wV1iVg5Zxv-1zHYVPjiO1QFPgNvuB-jHuojdY";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Modal state
    const showReferralModal = ref(false);
    const selectedReferral = ref(null);
    const showDocumentViewer = ref(false);
    const selectedReferralImage = ref(null);

    // Toast state
    const showToast = ref(false);
    const toastMessage = ref("");

    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    const DATE_FILTER_OPTIONS = [
      { value: "", label: "All Time" },
      { value: "today", label: "Today" },
      { value: "week", label: "Last 7 Days" },
      { value: "month", label: "Last 30 Days" },
    ];

    let intervalId = null;

    onMounted(() => {
      fetchReferrals();
      // Poll for updates every 30 seconds
      intervalId = setInterval(fetchReferrals, 30000);
    });

    onUnmounted(() => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    });

    const fetchReferrals = async () => {
      try {
        loading.value = true;

        const { data, error } = await supabase
          .from("referrals")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        referrals.value = data || [];
      } catch (error) {
        console.error("Error fetching referrals:", error);
        displayToast(`Error fetching referrals: ${error.message}`);
      } finally {
        loading.value = false;
      }
    };

    const filterDateRange = (dateStr, range) => {
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
    };

    const filteredReferrals = computed(() => {
      return referrals.value.filter((referral) => {
        const matchesSearch =
          !searchQuery.value ||
          referral.patient_name
            ?.toLowerCase()
            .includes(searchQuery.value.toLowerCase()) ||
          referral.referred_to
            ?.toLowerCase()
            .includes(searchQuery.value.toLowerCase()) ||
          referral.referred_from
            ?.toLowerCase()
            .includes(searchQuery.value.toLowerCase());

        const matchesDate =
          !filterDate.value ||
          filterDateRange(referral.referral_date, filterDate.value);

        return matchesSearch && matchesDate;
      });
    });

    const paginatedReferrals = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage.value;
      const endIndex = startIndex + itemsPerPage.value;
      return filteredReferrals.value.slice(startIndex, endIndex);
    });

    const totalPages = computed(() => {
      return (
        Math.ceil(filteredReferrals.value.length / itemsPerPage.value) || 1
      );
    });

    const viewReferral = (referral) => {
      // Show the referral image directly
      if (referral.image_url) {
        selectedReferralImage.value = referral.image_url;
        showDocumentViewer.value = true;
      } else {
        displayToast("No document image available for this referral");
      }
    };

    const deleteReferral = async (referral) => {
      if (
        confirm(
          `Are you sure you want to delete the referral for ${referral.patient_name}?`
        )
      ) {
        try {
          const { error } = await supabase
            .from("referrals")
            .delete()
            .eq("id", referral.id);

          if (error) {
            throw error;
          }

          // Remove from local state
          referrals.value = referrals.value.filter((r) => r.id !== referral.id);

          displayToast(
            `Referral for ${referral.patient_name} deleted successfully`
          );
        } catch (error) {
          console.error("Error deleting referral:", error);
          displayToast(`Error deleting referral: ${error.message}`);
        }
      }
    };

    const displayToast = (message) => {
      toastMessage.value = message;
      showToast.value = true;
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const downloadTableAsPDF = () => {
      const doc = new jsPDF("landscape");

      // Set page margins to center content
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      const centerX = pageWidth / 2;

      // logo
      const logoWidth = 20;
      const logoHeight = 20;
      doc.addImage(logoSrc, "PNG", margin, margin, logoWidth, logoHeight);

      // CPSU Logo
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

      // title
      doc.setFontSize(18);
      doc.text(
        "Clinic Management System - Hospital Referrals",
        centerX,
        margin + 12,
        { align: "center" }
      );

      // current date
      doc.setFontSize(10);
      doc.text(
        `As of: ${new Date().toLocaleDateString()}`,
        centerX,
        margin + 18,
        { align: "center" }
      );

      const tableColumns = [
        "Referral Date",
        "Patient Name",
        "Referred From",
        "Referred To",
        "Reason for Referral",
      ];

      const tableData = filteredReferrals.value.map((referral) => [
        formatDate(referral.referral_date),
        referral.patient_name,
        referral.referred_from,
        referral.referred_to,
        referral.reason_for_referral,
      ]);

      // Generate the table with centered configuration
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
          0: { cellWidth: contentWidth * 0.15 }, // Date
          1: { cellWidth: contentWidth * 0.2 }, // Name
          2: { cellWidth: contentWidth * 0.2 }, // From
          3: { cellWidth: contentWidth * 0.2 }, // To
          4: { cellWidth: contentWidth * 0.25 }, // Reason
        },
        didDrawPage: function (data) {
          if (data.pageNumber > 1) {
            doc.setFontSize(12);
            doc.text(
              "Clinic Management System - Hospital Referrals",
              centerX,
              margin / 2,
              { align: "center" }
            );
          }

          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber}`,
            centerX,
            pageHeight - margin / 2,
            { align: "center" }
          );
        },
      });

      doc.save("hospital_referrals.pdf");
    };

    return {
      referrals,
      loading,
      searchQuery,
      filterDate,
      dateFilterOptions: DATE_FILTER_OPTIONS,
      showReferralModal,
      selectedReferral,
      showToast,
      toastMessage,
      currentPage,
      itemsPerPage,
      filteredReferrals,
      paginatedReferrals,
      totalPages,
      viewReferral,
      deleteReferral,
      formatDate,
      downloadTableAsPDF,
      showDocumentViewer,
      selectedReferralImage,
    };
  },
};
</script>

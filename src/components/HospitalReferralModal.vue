<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 flex justify-center items-center z-50"
  >
    <div class="fixed inset-0 bg-black/50"></div>
    <div
      class="relative bg-white rounded-2xl p-8 shadow-lg w-[650px] h-[90vh]"
      @click.stop
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-satoshi-bold">Hospital Referral</h2>
        <div class="flex items-center gap-2">
          <div class="relative group">
            <button
              @click="downloadReferral"
              class="text-blue1 hover:text-blue1/80 flex items-center justify-center h-full"
            >
              <Download class="size-6" />
            </button>
          </div>
          <button @click="close" class="text-gray-500 hover:text-gray-700">
            <X class="w-6 h-6" />
          </button>
        </div>
      </div>

      <div class="h-[calc(90vh-88px)] overflow-y-scroll no-scrollbar pr-4">
        <div ref="referralContent" class="space-y-6 p-8 bg-white">
          <div class="text-center mb-6">
            <h1 class="text-xl font-bold">
              CENTRAL PHILIPPINES STATE UNIVERSITY
            </h1>
            <h2 class="text-base">San Carlos, Negros Occidental</h2>
            <h3 class="text-lg font-bold mt-2">HOSPITAL REFERRAL FORM</h3>
            <p class="text-sm mt-1">{{ formatDate(new Date()) }}</p>
          </div>

          <div class="space-y-4">
            <h3 class="font-satoshi-bold">PATIENT INFORMATION</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-600 mb-1"
                  >Patient Name</label
                >
                <input
                  v-model="referralData.patientName"
                  class="w-full focus:outline-none bg-transparent border-b border-gray-300 pb-1"
                  :disabled="viewOnly"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1"
                  >Student ID</label
                >
                <input
                  v-model="referralData.studentId"
                  class="w-full focus:outline-none bg-transparent border-b border-gray-300 pb-1"
                  :disabled="viewOnly"
                />
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="font-satoshi-bold">REFERRAL DETAILS</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-gray-600 mb-1"
                  >Hospital/Facility Name*</label
                >
                <input
                  v-model="referralData.hospitalName"
                  class="w-full focus:outline-none bg-transparent border-b border-gray-300 pb-1"
                  placeholder="Enter hospital or facility name"
                  :disabled="viewOnly"
                  required
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1"
                  >Referral Date</label
                >
                <input
                  v-model="referralData.referralDate"
                  type="date"
                  class="w-full focus:outline-none bg-transparent border-b border-gray-300 pb-1"
                  :disabled="viewOnly"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1"
                  >Reason for Referral*</label
                >
                <textarea
                  v-model="referralData.referralReason"
                  class="w-full border border-gray-300 focus:outline-none bg-transparent min-h-[100px] p-2 rounded"
                  placeholder="Briefly explain why this patient is being referred"
                  :disabled="viewOnly"
                  required
                ></textarea>
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1"
                  >Additional Instructions</label
                >
                <textarea
                  v-model="referralData.additionalInstructions"
                  class="w-full border border-gray-300 focus:outline-none bg-transparent min-h-[100px] p-2 rounded"
                  placeholder="Any additional instructions or information for the receiving facility"
                  :disabled="viewOnly"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="font-satoshi-bold">REFERRING PROVIDER</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-600 mb-1"
                  >Provider Name</label
                >
                <input
                  v-model="referralData.providerName"
                  class="w-full focus:outline-none bg-transparent border-b border-gray-300 pb-1"
                  placeholder="Your name"
                  :disabled="viewOnly"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1"
                  >Contact Number</label
                >
                <input
                  v-model="referralData.providerContact"
                  class="w-full focus:outline-none bg-transparent border-b border-gray-300 pb-1"
                  placeholder="Your contact number"
                  :disabled="viewOnly"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-between mt-8 pt-4">
            <div class="text-center border-t border-gray-300 pt-2 w-48">
              <span class="text-sm text-gray-600">Provider Signature</span>
            </div>
            <div class="text-center border-t border-gray-300 pt-2 w-48">
              <span class="text-sm text-gray-600"
                >Date: {{ formatDate(new Date()) }}</span
              >
            </div>
          </div>
        </div>

        <div v-if="!viewOnly" class="flex justify-end gap-4 mt-6">
          <button
            @click="close"
            class="px-6 py-2 bg-gray-300 rounded-full hover:bg-gray-400 mb-8"
          >
            Cancel
          </button>
          <button
            @click="submitReferral"
            class="px-6 py-2 rounded-full mb-8 bg-blue1 text-white hover:bg-blue-700 flex items-center gap-2"
            :disabled="!isFormValid || isSubmitting"
          >
            <span v-if="isSubmitting">Submitting...</span>
            <span v-else>Submit</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { X, Download } from "lucide-vue-next";
import html2canvas from "html2canvas";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase-config";
import { logActivity } from "@/utils/activity-logger";
import { uploadDocumentToSupabase } from "@/utils/supabase-storage";

export default {
  name: "HospitalReferralModal",
  components: {
    X,
    Download,
  },
  props: {
    modelValue: Boolean,
    recordData: {
      type: Object,
      default: () => ({}),
    },
    viewOnly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "referral-submitted"],
  setup(props, { emit }) {
    const referralContent = ref(null);
    const isSubmitting = ref(false);

    const currentUser = ref(
      JSON.parse(localStorage.getItem("currentUser")) || {}
    );

    const referralData = ref({
      id: `referral_${Date.now()}`,
      patientName: "",
      studentId: "",
      hospitalName: "",
      referralDate: new Date().toISOString().split("T")[0],
      referralReason: "",
      additionalInstructions: "",
      providerName: currentUser.value?.name || "",
      providerContact: "",
      status: "Pending",
      createdAt: new Date().toISOString(),
    });

    // Watch for changes in record data
    watch(
      () => props.recordData,
      (newData) => {
        if (newData) {
          // For new referral creation
          if (newData.studentName) {
            referralData.value.patientName = newData.studentName || "";
            referralData.value.studentId = newData.studentId || "";
          }
          // For viewing existing referral
          else if (newData.patientName) {
            Object.assign(referralData.value, newData);
          }
        }
      },
      { immediate: true }
    );

    const isFormValid = computed(() => {
      return (
        referralData.value.hospitalName && referralData.value.referralReason
      );
    });

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const close = () => {
      emit("update:modelValue", false);
    };

    const downloadReferral = async () => {
      try {
        const element = referralContent.value;
        const canvas = await html2canvas(element, {
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        // Convert canvas to blob and download
        canvas.toBlob(
          (blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `hospital_referral_${
              referralData.value.patientName || "patient"
            }_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          },
          "image/png",
          1.0
        );
      } catch (error) {
        console.error("Error downloading referral:", error);
      }
    };

    const submitReferral = async () => {
      if (!isFormValid.value || isSubmitting.value) return;

      isSubmitting.value = true;

      try {
        // Generate the canvas with higher quality settings for the entire form
        const element = referralContent.value;
        const canvas = await html2canvas(element, {
          scale: 2, // Higher scale for better quality
          logging: false,
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
          // Ensure we capture the entire content
          height: element.scrollHeight,
          width: element.scrollWidth,
        });

        // Convert canvas to blob
        const blob = await new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
        });

        // Create a File object from the blob
        const file = new File([blob], `referral_${Date.now()}.png`, {
          type: "image/png",
        });

        // Upload the file using Supabase - specify 'referrals' folder
        const documentUrl = await uploadDocumentToSupabase(file, "referrals");

        // Create the full referral object with document URL
        const fullReferralData = {
          ...referralData.value,
          documentUrl: documentUrl,
          timestamp: serverTimestamp(),
        };

        // Add to Firestore
        const docRef = await addDoc(
          collection(db, "referrals"),
          fullReferralData
        );

        // Log activity
        await logActivity({
          type: "referral",
          action: "create",
          title: "New Hospital Referral",
          description: `Created hospital referral for ${referralData.value.patientName} to ${referralData.value.hospitalName}`,
          timestamp: serverTimestamp(),
          performedBy: currentUser.value,
        });

        // Notify parent component
        emit("referral-submitted", { ...fullReferralData, id: docRef.id });

        // Close modal
        close();
      } catch (error) {
        console.error("Error submitting referral:", error);
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      referralContent,
      referralData,
      isFormValid,
      isSubmitting,
      formatDate,
      close,
      downloadReferral,
      submitReferral,
    };
  },
};
</script>

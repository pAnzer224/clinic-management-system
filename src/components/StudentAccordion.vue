<template>
  <div class="space-y-4">
    <div class="bg-graytint/50 rounded-xl">
      <button
        @click="toggleAccordion('documents')"
        class="w-full p-4 flex justify-between items-center font-satoshi-bold"
      >
        Documents
        <ChevronDownIcon
          :class="[
            'w-5 h-5 transition-transform',
            activeAccordion === 'documents' ? 'rotate-180' : '',
          ]"
        />
      </button>
      <div v-show="activeAccordion === 'documents'" class="p-4 pt-0 space-y-2">
        <div
          v-for="(label, key) in documentLabels"
          :key="key"
          class="flex justify-between items-center p-3 bg-white rounded-lg hover:bg-gray-50"
        >
          <div class="flex items-center space-x-2">
            <CheckCircleIcon
              v-if="documents[key]"
              class="w-5 h-5 text-green-500"
            />
            <span class="text-sm">{{ label }}</span>
          </div>
          <div class="flex items-center">
            <input
              type="file"
              :accept="acceptedDocumentTypes"
              class="hidden"
              :ref="
                (el) => {
                  if (el) uploadRefs[key] = el;
                }
              "
              @change="(e) => handleDocumentUpload(e, key)"
            />
            <button
              v-if="!documents[key]"
              @click="triggerFileUpload(key)"
              class="text-blue1/60 hover:text-blue1 mr-2"
            >
              <PlusCircleIcon class="w-5 h-5" />
            </button>
            <button
              v-if="documents[key]"
              @click="viewDocument(documents[key])"
              class="text-blue1"
            >
              <EyeIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Referrals Accordion (New) -->
    <div class="bg-graytint/50 rounded-xl">
      <button
        @click="toggleAccordion('referrals')"
        class="w-full p-4 flex justify-between items-center font-satoshi-bold"
      >
        Referrals
        <ChevronDownIcon
          :class="[
            'w-5 h-5 transition-transform',
            activeAccordion === 'referrals' ? 'rotate-180' : '',
          ]"
        />
      </button>
      <div v-show="activeAccordion === 'referrals'" class="p-4 pt-0 space-y-2">
        <div
          v-if="referrals.length > 0"
          v-for="referral in referrals"
          :key="referral.id"
          class="flex justify-between items-center p-3 bg-white rounded-lg hover:bg-gray-50"
        >
          <div class="flex flex-col">
            <span class="text-sm font-medium">{{ referral.hospitalName }}</span>
            <span class="text-xs text-gray-500">{{
              formatDate(referral.createdAt)
            }}</span>
          </div>
          <div class="flex items-center">
            <span
              class="px-2 py-1 text-xs rounded-full mr-2"
              :class="{
                'bg-yellow-100 text-yellow-800': referral.status === 'Pending',
                'bg-green-100 text-green-800': referral.status === 'Completed',
                'bg-red-100 text-red-800': referral.status === 'Cancelled',
              }"
            >
              {{ referral.status }}
            </span>
            <button
              v-if="referral.documentUrl"
              @click="viewDocument(referral.documentUrl)"
              class="text-blue1"
            >
              <EyeIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
        <div
          v-if="referrals.length === 0"
          class="p-3 bg-white rounded-lg text-center text-gray-500"
        >
          No referrals found for this student
        </div>
      </div>
    </div>

    <div class="bg-graytint/50 rounded-xl">
      <button
        @click="toggleAccordion('appointments')"
        class="w-full p-4 flex justify-between items-center font-satoshi-bold"
      >
        Appointments
        <ChevronDownIcon
          :class="[
            'w-5 h-5 transition-transform',
            activeAccordion === 'appointments' ? 'rotate-180' : '',
          ]"
        />
      </button>
      <div
        v-show="activeAccordion === 'appointments'"
        class="p-4 pt-0 space-y-4"
      >
        <div v-if="upcomingAppointments.length > 0">
          <h4 class="text-sm font-medium mb-2">Upcoming</h4>
          <div class="space-y-2">
            <div
              v-for="appointment in upcomingAppointments"
              :key="appointment.id"
              class="bg-white p-3 rounded-lg flex justify-between items-center"
            >
              <div>
                <p class="font-medium">{{ appointment.reason }}</p>
                <p class="text-sm text-gray-600">
                  {{ formatDate(appointment.date) }} - {{ appointment.time }}
                </p>
              </div>
              <button
                @click="viewAppointmentDetails(appointment)"
                class="text-blue1"
              >
                <EyeIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="concludedAppointments.length > 0">
          <h4 class="text-sm font-medium mb-2">Concluded</h4>
          <div class="space-y-2">
            <div
              v-for="appointment in concludedAppointments"
              :key="appointment.id"
              class="bg-white p-3 rounded-lg flex justify-between items-center"
            >
              <div>
                <p class="font-medium">{{ appointment.reason }}</p>
                <p class="text-sm text-gray-600">
                  {{ formatDate(appointment.date) }} - {{ appointment.time }}
                </p>
              </div>
              <button
                @click="viewAppointmentDetails(appointment)"
                class="text-blue1"
              >
                <EyeIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="
            upcomingAppointments.length === 0 &&
            concludedAppointments.length === 0
          "
          class="text-center py-4 text-gray-500"
        >
          No appointments found for this student.
        </div>
      </div>
    </div>

    <!-- Appointment Detail Modal -->
    <div
      v-if="showAppointmentDetailModal && selectedAppointment"
      class="fixed inset-0 bg-text/50 flex justify-center items-center"
      style="z-index: 9999"
      @click="showAppointmentDetailModal = false"
    >
      <div class="bg-white rounded-2xl p-6 shadow-lg w-[400px]" @click.stop>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-satoshi-bold">Appointment Details</h2>
          <button
            @click="showAppointmentDetailModal = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-2 text-[14px]">
          <div class="grid grid-cols-3 gap-2">
            <div class="col-span-1 text-blue2 font-satoshi-medium">Student</div>
            <div class="col-span-2 font-regular tracking-wide text-gray-700">
              {{ selectedAppointment.studentName }}
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div class="col-span-1 text-blue2 font-satoshi-medium">
              Student ID
            </div>
            <div class="col-span-2 font-regular tracking-wide text-gray-700">
              {{ selectedAppointment.studentId }}
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div class="col-span-1 text-blue2 font-satoshi-medium">Date</div>
            <div class="col-span-2 font-regular tracking-wide text-gray-700">
              {{ formatDate(selectedAppointment.date) }}
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div class="col-span-1 text-blue2 font-satoshi-medium">Time</div>
            <div class="col-span-2 font-regular tracking-wide text-gray-700">
              {{ selectedAppointment.time }}
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div class="col-span-1 text-blue2 font-satoshi-medium">Reason</div>
            <div class="col-span-2 font-regular tracking-wide text-gray-700">
              {{ selectedAppointment.reason }}
            </div>
          </div>

          <div v-if="selectedAppointment.notes" class="grid grid-cols-3 gap-2">
            <div class="col-span-1 text-blue2 font-satoshi-medium">Notes</div>
            <div class="col-span-2 font-regular tracking-wide text-gray-700">
              {{ selectedAppointment.notes }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <DocumentViewerModal
      :show="showDocumentViewer"
      :documentUrl="selectedDocument"
      @close="showDocumentViewer = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import {
  ChevronDownIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  PlusCircleIcon,
} from "@heroicons/vue/24/solid";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import DocumentViewerModal from "./DocumentViewerModal.vue";
import { handleDocumentUpload as uploadDocument } from "@/utils/document-upload-utils";

export default {
  name: "StudentAccordion",
  components: {
    ChevronDownIcon,
    EyeIcon,
    XMarkIcon,
    CheckCircleIcon,
    PlusCircleIcon,
    DocumentViewerModal,
  },
  props: {
    documents: {
      type: Object,
      required: true,
    },
    documentLabels: {
      type: Object,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    acceptedDocumentTypes: {
      type: String,
      default:
        ".pdf,.doc,.docx,.jpg,.jpeg,.png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png",
    },
  },
  emits: ["document-updated"],
  setup(props, { emit }) {
    const activeAccordion = ref(null);
    const showAppointmentDetailModal = ref(false);
    const selectedAppointment = ref(null);
    const appointments = ref([]);
    const referrals = ref([]);
    const showDocumentViewer = ref(false);
    const selectedDocument = ref("");
    const uploadRefs = ref({});
    let unsubscribeAppointments = null;
    let unsubscribeReferrals = null;

    // Function to create and set up the Firestore referrals listener
    const setupReferralsListener = () => {
      // Only create query if studentId exists and is not empty
      if (props.studentId) {
        const referralsQuery = query(
          collection(db, "referrals"),
          where("studentId", "==", props.studentId),
          orderBy("timestamp", "desc")
        );

        if (unsubscribeReferrals) {
          unsubscribeReferrals();
        }

        unsubscribeReferrals = onSnapshot(
          referralsQuery,
          (snapshot) => {
            referrals.value = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          },
          (error) => {
            console.error("Error fetching referrals:", error);
          }
        );
      } else {
        // If no valid studentId, set empty array
        referrals.value = [];
      }
    };

    onMounted(() => {
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

      // Set up referrals listener if studentId is valid
      setupReferralsListener();
    });

    // Watch for changes to studentId and re-setup the listener if it changes
    watch(
      () => props.studentId,
      (newStudentId) => {
        setupReferralsListener();
      }
    );

    onUnmounted(() => {
      if (unsubscribeAppointments) {
        unsubscribeAppointments();
      }
      if (unsubscribeReferrals) {
        unsubscribeReferrals();
      }
    });

    const studentAppointments = computed(() => {
      return appointments.value.filter(
        (apt) => apt.studentId === props.studentId
      );
    });

    const upcomingAppointments = computed(() => {
      return studentAppointments.value.filter(
        (apt) => new Date(apt.date) > new Date()
      );
    });

    const concludedAppointments = computed(() => {
      return studentAppointments.value.filter(
        (apt) => new Date(apt.date) <= new Date()
      );
    });

    function formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    function toggleAccordion(section) {
      activeAccordion.value =
        activeAccordion.value === section ? null : section;
    }

    function viewDocument(documentData) {
      selectedDocument.value = documentData;
      showDocumentViewer.value = true;
    }

    function viewAppointmentDetails(appointment) {
      selectedAppointment.value = appointment;
      showAppointmentDetailModal.value = true;
    }

    function triggerFileUpload(key) {
      if (uploadRefs.value[key]) {
        uploadRefs.value[key].click();
      }
    }

    async function handleDocumentUpload(event, documentKey) {
      const file = event.target.files[0];
      if (file) {
        try {
          const fileData = await uploadDocument(file);
          // Update the document in the parent component
          emit("document-updated", { key: documentKey, data: fileData.data });
        } catch (error) {
          alert("Error uploading document: " + error.message);
          event.target.value = "";
        }
      }
    }

    return {
      activeAccordion,
      upcomingAppointments,
      concludedAppointments,
      referrals,
      showAppointmentDetailModal,
      selectedAppointment,
      showDocumentViewer,
      selectedDocument,
      uploadRefs,
      formatDate,
      toggleAccordion,
      viewDocument,
      viewAppointmentDetails,
      handleDocumentUpload,
      triggerFileUpload,
    };
  },
};
</script>

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
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  ChevronDownIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  PlusCircleIcon,
} from "@heroicons/vue/24/solid";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
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
    const showDocumentViewer = ref(false);
    const selectedDocument = ref("");
    const uploadRefs = ref({});
    let unsubscribeAppointments = null;

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
    });

    onUnmounted(() => {
      if (unsubscribeAppointments) {
        unsubscribeAppointments();
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

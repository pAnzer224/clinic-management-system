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

    <DocumentViewerModal
      :show="showDocumentViewer"
      :documentUrl="selectedDocument"
      @close="showDocumentViewer = false"
    />
  </div>
</template>

<script>
import { ref } from "vue";
import {
  ChevronDownIcon,
  EyeIcon,
  CheckCircleIcon,
  PlusCircleIcon,
} from "@heroicons/vue/24/solid";
import DocumentViewerModal from "./DocumentViewerModal.vue";
import { handleDocumentUpload as uploadDocument } from "@/utils/document-upload-utils";

export default {
  name: "StudentAccordion",
  components: {
    ChevronDownIcon,
    EyeIcon,
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
    const showDocumentViewer = ref(false);
    const selectedDocument = ref("");
    const uploadRefs = ref({});

    function toggleAccordion(section) {
      activeAccordion.value =
        activeAccordion.value === section ? null : section;
    }

    function viewDocument(documentData) {
      selectedDocument.value = documentData;
      showDocumentViewer.value = true;
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
          emit("document-updated", { key: documentKey, data: fileData.data });
        } catch (error) {
          alert("Error uploading document: " + error.message);
          event.target.value = "";
        }
      }
    }

    return {
      activeAccordion,
      showDocumentViewer,
      selectedDocument,
      uploadRefs,
      toggleAccordion,
      viewDocument,
      handleDocumentUpload,
      triggerFileUpload,
    };
  },
};
</script>

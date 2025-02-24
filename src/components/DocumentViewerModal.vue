<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex justify-center items-center"
    style="z-index: 99999"
    @click="$emit('close')"
  >
    <div
      class="bg-white rounded-xl w-[700px] max-w-[90vw] max-h-[90vh] flex flex-col"
      @click.stop
    >
      <div class="p-4 border-b flex justify-between items-center">
        <h3 class="font-satoshi-bold">Document Viewer</h3>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
      <div class="flex-1 p-4 overflow-auto">
        <img
          v-if="documentUrl.startsWith('data:image')"
          :src="documentUrl"
          class="max-w-full mx-auto"
          alt="Document Preview"
        />
        <iframe
          v-else
          :src="documentUrl"
          class="w-full h-full border-0"
        ></iframe>
      </div>
    </div>
  </div>
</template>
<script>
import { XMarkIcon } from "@heroicons/vue/24/solid";

export default {
  name: "DocumentViewerModal",
  components: {
    XMarkIcon,
  },
  props: {
    show: Boolean,
    documentUrl: String,
  },
  emits: ["close"],
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 flex justify-center items-center z-[9999]"
  >
    <div class="fixed inset-0 bg-black/50" @click="$emit('close')"></div>
    <div
      class="relative bg-white rounded-2xl p-8 shadow-lg w-[700px] h-[90vh] overflow-hidden z-[9999] mt-5"
      @click.stop
    >
      <div class="sticky top-0 bg-white z-20 mb-6">
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-xl font-satoshi-bold">Document Viewer</h2>
          <button
            @click="$emit('close')"
            class="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <div class="flex flex-col h-[calc(90vh-88px-64px)]">
        <div class="flex-1 overflow-y-auto pr-4">
          <div class="pb-20">
            <img
              v-if="isImageDocument"
              :src="documentUrl"
              class="max-w-full mx-auto"
              alt="Document Preview"
            />
            <iframe
              v-else
              :src="documentUrl"
              class="w-full h-[calc(90vh-160px)]"
              frameborder="0"
            ></iframe>
          </div>
        </div>
      </div>

      <div
        class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent"
        style="z-index: 9999; height: 150px"
      >
        <div
          class="absolute bottom-0 left-0 right-0 py-10 px-8 flex justify-end gap-4"
        >
          <button
            type="button"
            @click="$emit('close')"
            class="px-6 py-2 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { XMarkIcon } from "@heroicons/vue/24/solid";
import { computed } from "vue";

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
  setup(props) {
    const isImageDocument = computed(() => {
      return (
        props.documentUrl &&
        (props.documentUrl.startsWith("data:image") ||
          /\.(jpg|jpeg|png|gif|webp)$/i.test(props.documentUrl))
      );
    });

    return {
      isImageDocument,
    };
  },
};
</script>

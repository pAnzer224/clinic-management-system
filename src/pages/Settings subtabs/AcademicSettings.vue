<template>
  <div class="space-y-6">
    <!-- Time Slots Section (Now First) -->
    <div class="bg-white rounded-2xl p-8 shadow-sm">
      <h2 class="text-md font-satoshi-medium text-text mb-6">
        Appointment Time Slots
      </h2>
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <!-- Time Picker Trigger -->
          <div class="relative w-full">
            <div
              @click="openTimePicker"
              class="w-full px-4 py-2 rounded-full border bg-graytint flex justify-between items-center cursor-pointer"
            >
              <span v-if="newTimeSlot">{{ newTimeSlot }}</span>
              <span v-else class="text-gray-400">Select time</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd"
                  transform="rotate(45 10 10)"
                />
              </svg>
            </div>
          </div>
          <button
            @click="addTimeSlot"
            class="bg-blue1 text-white px-6 py-2 rounded-full"
          >
            Add
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="slot in timeSlots"
            :key="slot"
            class="flex justify-between items-center p-3 bg-graytint/40 rounded-lg"
          >
            <span>{{ slot }}</span>
            <button
              @click="removeTimeSlot(slot)"
              class="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Academic Years Section (Now Second) -->
    <div class="bg-white rounded-2xl p-8 shadow-sm">
      <h2 class="text-md font-satoshi-medium text-text mb-6">Academic Years</h2>
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <input
            v-model="newAcademicYear"
            placeholder="YYYY-YYYY"
            class="w-full px-4 py-2 rounded-full border bg-graytint"
            pattern="\d{4}-\d{4}"
          />
          <button
            @click="addAcademicYear"
            class="bg-blue1 text-white px-6 py-2 rounded-full"
          >
            Add
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="year in academicYears"
            :key="year"
            class="flex justify-between items-center p-3 bg-graytint/40 rounded-lg"
          >
            <span>{{ year }}</span>
            <button
              @click="removeAcademicYear(year)"
              class="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Time Picker Modal -->
    <div
      v-if="showTimePicker"
      class="fixed inset-0 flex items-center justify-center z-50"
    >
      <div
        class="fixed inset-0 bg-black bg-opacity-50"
        @click="showTimePicker = false"
      ></div>
      <div class="relative z-10 w-full max-w-md mx-auto">
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div
            class="flex justify-between items-center px-5 py-4 border-b border-gray-200"
          >
            <h3 class="text-lg font-semibold">Select Time</h3>
            <button
              @click="showTimePicker = false"
              class="text-gray-500 hover:text-black transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="p-5">
            <div class="space-y-5">
              <!-- Hour Selection -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-600">Hour</label>
                <div class="grid grid-cols-4 gap-2">
                  <button
                    v-for="hour in 12"
                    :key="`hour-${hour}`"
                    @click="selectHour(hour)"
                    class="py-2.5 rounded-lg text-sm transition-colors"
                    :class="
                      selectedHour === hour
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    "
                  >
                    {{ hour }}
                  </button>
                </div>
              </div>

              <!-- Minute Selection -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-600">Minute</label>
                <div class="grid grid-cols-4 gap-2">
                  <button
                    v-for="minute in ['00', '15', '30', '45']"
                    :key="`minute-${minute}`"
                    @click="selectMinute(minute)"
                    class="py-2.5 rounded-lg text-sm transition-colors"
                    :class="
                      selectedMinute === minute
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    "
                  >
                    {{ minute }}
                  </button>
                </div>
              </div>

              <!-- AM/PM Selection -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-600">Period</label>
                <div class="flex gap-2">
                  <button
                    @click="selectAmPm('AM')"
                    class="flex-1 py-2.5 rounded-lg text-sm transition-colors"
                    :class="
                      selectedAmPm === 'AM'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    "
                  >
                    AM
                  </button>
                  <button
                    @click="selectAmPm('PM')"
                    class="flex-1 py-2.5 rounded-lg text-sm transition-colors"
                    :class="
                      selectedAmPm === 'PM'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    "
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            class="flex justify-end gap-2 px-5 py-4 border-t border-gray-200"
          >
            <button
              @click="showTimePicker = false"
              class="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="confirmTimeSelection"
              class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              :disabled="!selectedHour || !selectedMinute"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase-config";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default {
  name: "AcademicSettings",
  emits: ["notification"],
  data() {
    return {
      academicYears: [],
      newAcademicYear: "",
      timeSlots: [],
      newTimeSlot: "",
      // Time picker related states
      showTimePicker: false,
      selectedHour: null,
      selectedMinute: null,
      selectedAmPm: "AM",
    };
  },
  async mounted() {
    // Load academic years
    const savedYears = localStorage.getItem("academicYears");
    if (savedYears) {
      this.academicYears = JSON.parse(savedYears);
    } else {
      // Default years
      this.academicYears = ["2023-2024", "2024-2025", "2025-2026"];
      localStorage.setItem("academicYears", JSON.stringify(this.academicYears));
    }

    // Load time slots from Firestore
    try {
      const timeSlotsDoc = await getDoc(doc(db, "settings", "timeSlots"));
      if (timeSlotsDoc.exists()) {
        this.timeSlots = timeSlotsDoc.data().slots;
      } else {
        // Default time slots
        this.timeSlots = [
          "9:00 AM",
          "10:00 AM",
          "11:00 AM",
          "1:00 PM",
          "2:00 PM",
          "3:00 PM",
          "4:00 PM",
        ];
        await setDoc(doc(db, "settings", "timeSlots"), {
          slots: this.timeSlots,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error loading time slots:", error);
      this.$emit("notification", "Error loading time slots");
    }
  },
  methods: {
    openTimePicker() {
      this.showTimePicker = true;
    },
    selectHour(hour) {
      this.selectedHour = hour;
    },
    selectMinute(minute) {
      this.selectedMinute = minute;
    },
    selectAmPm(period) {
      this.selectedAmPm = period;
    },
    confirmTimeSelection() {
      if (this.selectedHour && this.selectedMinute) {
        this.newTimeSlot = `${this.selectedHour}:${this.selectedMinute} ${this.selectedAmPm}`;
        this.showTimePicker = false;
      } else {
        this.$parent.showNotification("Please select both hour and minute");
      }
    },
    async saveSettings() {
      try {
        // Save academic years
        localStorage.setItem(
          "academicYears",
          JSON.stringify(this.academicYears)
        );

        // Save time slots to Firestore
        await setDoc(doc(db, "settings", "timeSlots"), {
          slots: this.timeSlots,
          updatedAt: serverTimestamp(),
        });

        return true;
      } catch (error) {
        console.error("Error saving academic settings:", error);
        throw error;
      }
    },
    addAcademicYear() {
      if (!this.newAcademicYear.match(/^\d{4}-\d{4}$/)) {
        this.$parent.showNotification("Please use YYYY-YYYY format");
        return;
      }

      if (!this.academicYears.includes(this.newAcademicYear)) {
        this.academicYears.push(this.newAcademicYear);
        this.newAcademicYear = "";
        this.$parent.showNotification("Academic year added");
      } else {
        this.$parent.showNotification("This academic year already exists");
      }
    },
    removeAcademicYear(year) {
      this.academicYears = this.academicYears.filter((y) => y !== year);
      this.$parent.showNotification("Academic year removed");
    },
    addTimeSlot() {
      if (!this.newTimeSlot) {
        this.$parent.showNotification("Please select a time");
        return;
      }

      if (!this.timeSlots.includes(this.newTimeSlot)) {
        this.timeSlots.push(this.newTimeSlot);
        // Sort time slots
        this.timeSlots.sort((a, b) => {
          const aHour = parseInt(a.split(":")[0]);
          const bHour = parseInt(b.split(":")[0]);
          const aMin = parseInt(a.split(":")[1].split(" ")[0]);
          const bMin = parseInt(b.split(":")[1].split(" ")[0]);
          const aIsPM = a.includes("PM");
          const bIsPM = b.includes("PM");

          if (aIsPM && !bIsPM) return 1;
          if (!aIsPM && bIsPM) return -1;
          if (aHour !== bHour) return aHour - bHour;
          return aMin - bMin;
        });

        this.newTimeSlot = "";
        this.selectedHour = null;
        this.selectedMinute = null;
        this.$parent.showNotification("Time slot added");
      } else {
        this.$parent.showNotification("This time slot already exists");
      }
    },
    removeTimeSlot(slot) {
      this.timeSlots = this.timeSlots.filter((s) => s !== slot);
      this.$parent.showNotification("Time slot removed");
    },
  },
};
</script>

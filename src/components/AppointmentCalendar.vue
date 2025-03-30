<template>
  <div class="bg-white rounded-2xl p-8 shadow-sm flex flex-col h-full">
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-2">
        <CalendarIcon class="size-5 text-gray-600" />
        <h3 class="text-md font-satoshi-medium text-text">{{ monthYear }}</h3>
      </div>
      <div class="flex gap-2">
        <button @click="prevMonth" class="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeftIcon class="h-5 w-5 text-gray-600" />
        </button>
        <button @click="nextMonth" class="p-2 rounded-full hover:bg-gray-100">
          <ChevronRightIcon class="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="day in weekDays"
        :key="day"
        class="p-2 text-center text-text/60 text-sm"
      >
        {{ day }}
      </div>

      <template v-for="day in calendarDays" :key="day.key">
        <div v-if="day.empty" class="p-2"></div>
        <button
          v-else
          @click="selectDay(day.date)"
          :disabled="day.isPast"
          class="relative p-1"
        >
          <div
            :class="[
              'p-2 text-center rounded-xl transition-colors w-full h-full',
              day.isSelected
                ? 'bg-gradient-to-tr from-blue1 to-blue2/80 text-white ring-2 ring-blue1/50 ring-offset-2'
                : 'hover:bg-gray-100 text-text',
              day.isPast ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ]"
          >
            {{ day.value }}
          </div>

          <div
            v-if="hasAppointment(day.date)"
            class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue1"
          ></div>
        </button>
      </template>
    </div>

    <!-- Selected date display -->
    <div
      v-if="selectedDay"
      class="mt-4 mb-2 text-sm text-blue1 font-satoshi-medium"
    >
      Selected: {{ formatSelectedDate(selectedDay) }}
    </div>

    <div v-if="selectedDay" class="mt-2">
      <div class="flex items-center gap-2 mb-3">
        <ClockIcon class="size-4 text-gray-500" />
        <h4 class="text-md font-satoshi-medium text-text">
          Available Time Slots
        </h4>
      </div>
      <div class="grid grid-cols-4 gap-2 text-sm">
        <button
          v-for="(slot, index) in slots"
          :key="index"
          @click="selectTime(index)"
          :disabled="isTimeSlotBooked(selectedDay, slot)"
          :class="[
            'p-2 text-center rounded-full transition-colors text-sm font-satoshi-medium',
            selectedTime === index
              ? 'bg-gradient-to-r from-blue1 to-blue2/90 text-white'
              : isTimeSlotBooked(selectedDay, slot)
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-graytint hover:bg-gray-200 text-text',
          ]"
        >
          {{ slot }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/solid";
import { CalendarIcon, ClockIcon } from "@heroicons/vue/24/outline";
import { ref, watch, onMounted, computed } from "vue";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase-config";

export default {
  name: "AppointmentCalendar",
  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarIcon,
    ClockIcon,
  },
  props: {
    appointments: {
      type: Array,
      required: true,
    },
  },
  setup(props, { emit }) {
    const currentMonth = ref(new Date());
    const selectedDay = ref(null);
    const selectedTime = ref(null);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const slots = ref([]);
    let unsubscribeSettings = null;

    const monthYear = computed(() => {
      return currentMonth.value.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    });

    const calendarDays = ref([]);

    // Format the selected date for display
    const formatSelectedDate = (date) => {
      if (!date) return "";
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    // Load time slots from Firestore
    onMounted(() => {
      // Listen to time slots from settings
      const settingsRef = doc(db, "settings", "timeSlots");
      unsubscribeSettings = onSnapshot(settingsRef, (doc) => {
        if (doc.exists()) {
          slots.value = doc.data().slots;
        } else {
          // Default time slots if none exist
          slots.value = [
            "9:00 AM",
            "10:00 AM",
            "11:00 AM",
            "1:00 PM",
            "2:00 PM",
            "3:00 PM",
            "4:00 PM",
          ];
        }
      });
    });

    const updateCalendarDays = () => {
      const year = currentMonth.value.getFullYear();
      const month = currentMonth.value.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDay = firstDay.getDay();

      const days = [];

      for (let i = 0; i < startingDay; i++) {
        days.push({ key: `empty-${i}`, empty: true });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isSelected =
          selectedDay.value &&
          date.getDate() === selectedDay.value.getDate() &&
          date.getMonth() === selectedDay.value.getMonth() &&
          date.getFullYear() === selectedDay.value.getFullYear();

        days.push({
          key: `${year}-${month}-${day}`,
          value: day,
          date: date,
          isPast: date < today,
          isSelected: isSelected,
        });
      }

      calendarDays.value = days;
    };

    const prevMonth = () => {
      currentMonth.value = new Date(
        currentMonth.value.getFullYear(),
        currentMonth.value.getMonth() - 1
      );
      updateCalendarDays();
    };

    const nextMonth = () => {
      currentMonth.value = new Date(
        currentMonth.value.getFullYear(),
        currentMonth.value.getMonth() + 1
      );
      updateCalendarDays();
    };

    const selectDay = (date) => {
      selectedDay.value = date;
      selectedTime.value = null;
      updateCalendarDays(); // Update to reflect selection
      emit("day-selected", date);
    };

    const selectTime = (index) => {
      selectedTime.value = index;
      emit("time-selected", {
        date: selectedDay.value,
        time: slots.value[index],
      });
    };

    const hasAppointment = (date) => {
      if (!date) return false;

      return props.appointments.some((appointment) => {
        const appointmentDate = new Date(appointment.date);
        return (
          appointmentDate.getDate() === date.getDate() &&
          appointmentDate.getMonth() === date.getMonth() &&
          appointmentDate.getFullYear() === date.getFullYear()
        );
      });
    };

    const isTimeSlotBooked = (date, timeSlot) => {
      if (!date) return false;

      // Check current appointments for the selected date and time
      return props.appointments.some((appointment) => {
        const appointmentDate = new Date(appointment.date);
        const selectedDate = new Date(date);

        return (
          appointmentDate.getDate() === selectedDate.getDate() &&
          appointmentDate.getMonth() === selectedDate.getMonth() &&
          appointmentDate.getFullYear() === selectedDate.getFullYear() &&
          appointment.time === timeSlot
        );
      });
    };

    watch(() => props.appointments, updateCalendarDays, { deep: true });

    watch(currentMonth, updateCalendarDays);

    watch(selectedDay, updateCalendarDays);

    updateCalendarDays();

    return {
      currentMonth,
      selectedDay,
      selectedTime,
      slots,
      weekDays,
      monthYear,
      calendarDays,
      prevMonth,
      nextMonth,
      selectDay,
      selectTime,
      hasAppointment,
      isTimeSlotBooked,
      formatSelectedDate,
    };
  },
};
</script>

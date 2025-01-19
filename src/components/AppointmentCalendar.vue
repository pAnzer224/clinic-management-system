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
          class="relative"
        >
          <div
            :class="[
              'p-2 text-center rounded-2xl transition-colors',
              day.isSelected
                ? 'bg-blue1 text-white'
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

    <div v-if="selectedDay" class="mt-4">
      <div class="flex items-center gap-2 mb-3">
        <ClockIcon class="size-4 text-gray-500" />
        <h4 class="text-md font-satoshi-medium text-text">
          Available Time Slots
        </h4>
      </div>
      <div class="grid grid-cols-4 gap-2 text-sm">
        <button
          v-for="(slot, index) in timeSlots"
          :key="index"
          @click="selectTime(index)"
          :class="[
            'p-2 text-center rounded-full transition-colors text-sm font-satoshi-medium',
            selectedTime === index
              ? 'bg-blue1 text-white'
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

export default {
  name: "AppointmentCalendar",
  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarIcon,
    ClockIcon,
  },
  props: {
    timeSlots: {
      type: Array,
      required: true,
    },
    appointments: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      currentMonth: new Date(),
      selectedDay: null,
      selectedTime: null,
      weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    };
  },
  computed: {
    monthYear() {
      return this.currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    },
    calendarDays() {
      const year = this.currentMonth.getFullYear();
      const month = this.currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDay = firstDay.getDay();

      const days = [];

      for (let i = 0; i < startingDay; i++) {
        days.push({ key: `empty-${i}`, empty: true });
      }

      const today = new Date();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        days.push({
          key: day,
          value: day,
          date: date,
          isPast: date < today,
          isSelected:
            this.selectedDay &&
            date.getDate() === this.selectedDay.getDate() &&
            date.getMonth() === this.selectedDay.getMonth() &&
            date.getFullYear() === this.selectedDay.getFullYear(),
        });
      }

      return days;
    },
  },
  methods: {
    prevMonth() {
      this.currentMonth = new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth() - 1
      );
    },
    nextMonth() {
      this.currentMonth = new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth() + 1
      );
    },
    selectDay(date) {
      this.selectedDay = date;
      this.selectedTime = null;
      this.$emit("day-selected", date);
    },
    selectTime(index) {
      this.selectedTime = index;
      this.$emit("time-selected", {
        date: this.selectedDay,
        time: this.timeSlots[index],
      });
    },
    hasAppointment(date) {
      return this.appointments.some((appointment) => {
        const appointmentDate = new Date(appointment.date);
        return (
          appointmentDate.getDate() === date.getDate() &&
          appointmentDate.getMonth() === date.getMonth() &&
          appointmentDate.getFullYear() === date.getFullYear()
        );
      });
    },
  },
};
</script>

<template>
  <main class="h-full space-y-6">
    <h1 class="text-2xl font-satoshi-bold text-text">Appointments</h1>

    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-2">
        <AppointmentCalendar
          :timeSlots="timeSlots"
          :appointments="appointments"
          @day-selected="handleDaySelected"
          @time-selected="handleTimeSelected"
          class="h-[calc(99vh-16rem)]"
        />
      </div>

      <div
        class="bg-white rounded-2xl shadow-sm h-[calc(92vh-8rem)] flex flex-col"
      >
        <div class="p-8 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 class="text-md font-satoshi-medium text-text">
            Upcoming Appointments
          </h2>
        </div>

        <div class="px-8 pb-8 overflow-y-auto flex-1">
          <div class="space-y-4">
            <div
              v-for="appointment in appointments"
              :key="appointment.id"
              class="flex items-center justify-between p-4 border border-graytint rounded-xl hover:border-blue1 transition-colors"
            >
              <div class="flex-1">
                <h3 class="font-satoshi-medium text-md">
                  {{ appointment.studentName }}
                </h3>
                <p class="text-text/60">{{ appointment.reason }}</p>
              </div>
              <div class="text-right">
                <p class="font-satoshi-medium">{{ appointment.time }}</p>
                <p class="text-text/60">{{ formatDate(appointment.date) }}</p>
              </div>
              <div class="ml-4 flex gap-2">
                <button
                  @click="editAppointment(appointment)"
                  class="text-blue1 hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  @click="deleteAppointment(appointment.id)"
                  class="text-red-600 hover:text-red-700"
                >
                  Cancel
                </button>
              </div>
            </div>
            <p
              v-if="appointments.length === 0"
              class="text-center text-text/60 py-4"
            >
              No upcoming appointments
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule/Edit Modal -->
    <div
      v-if="showScheduleModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div class="bg-white rounded-2xl p-8 shadow-lg w-[500px]">
        <h2 class="text-xl font-satoshi-bold mb-6">
          {{ isEditing ? "Edit Appointment" : "Schedule Appointment" }}
        </h2>
        <form @submit.prevent="submitAppointment" class="space-y-4">
          <div>
            <label class="block mb-1">Student Name</label>
            <input
              v-model="appointmentForm.studentName"
              type="text"
              required
              class="w-full px-4 py-2 rounded-full bg-graytint"
            />
          </div>
          <div>
            <label class="block mb-1">Date</label>
            <input
              v-model="appointmentForm.date"
              type="date"
              required
              class="w-full px-4 py-2 rounded-full bg-graytint"
            />
          </div>
          <div>
            <label class="block mb-1">Time</label>
            <select
              v-model="appointmentForm.time"
              required
              class="w-full px-4 py-2 rounded-full bg-graytint"
            >
              <option value="">Select Time Slot</option>
              <option v-for="time in timeSlots" :key="time" :value="time">
                {{ time }}
              </option>
            </select>
          </div>
          <div>
            <label class="block mb-1">Reason for Visit</label>
            <textarea
              v-model="appointmentForm.reason"
              required
              class="w-full px-4 py-2 rounded-xl bg-graytint min-h-[100px]"
            ></textarea>
          </div>
          <div class="flex justify-end gap-4 mt-6">
            <button
              type="button"
              @click="showScheduleModal = false"
              class="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue1 text-white rounded-full hover:bg-blue-700"
            >
              {{ isEditing ? "Update" : "Schedule" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script>
import { ref } from "vue";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import AppointmentCalendar from "@/components/AppointmentCalendar.vue";

export default {
  name: "Appointments",
  components: {
    AppointmentCalendar,
  },
  setup() {
    const appointments = ref([]);
    const showScheduleModal = ref(false);
    const isEditing = ref(false);
    const selectedDate = ref(new Date().toISOString().split("T")[0]);
    const editingId = ref(null);

    const timeSlots = [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "01:00 PM",
      "01:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM",
    ];

    const initialFormState = {
      studentName: "",
      date: "",
      time: "",
      reason: "",
    };

    const appointmentForm = ref({ ...initialFormState });

    async function fetchAppointments() {
      const querySnapshot = await getDocs(
        query(collection(db, "appointments"), orderBy("date"), orderBy("time"))
      );
      appointments.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    function formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    const handleDaySelected = (date) => {
      selectedDate.value = date.toISOString().split("T")[0];
    };

    const handleTimeSelected = ({ date, time }) => {
      appointmentForm.value.date = date.toISOString().split("T")[0];
      appointmentForm.value.time = time;
      showScheduleModal.value = true;
    };

    async function submitAppointment() {
      try {
        if (isEditing.value && editingId.value) {
          await updateDoc(
            doc(db, "appointments", editingId.value),
            appointmentForm.value
          );
        } else {
          await addDoc(collection(db, "appointments"), appointmentForm.value);
        }
        await fetchAppointments();
        showScheduleModal.value = false;
        appointmentForm.value = { ...initialFormState };
        isEditing.value = false;
        editingId.value = null;
      } catch (error) {
        console.error("Error saving appointment:", error);
      }
    }

    function editAppointment(appointment) {
      isEditing.value = true;
      editingId.value = appointment.id;
      appointmentForm.value = { ...appointment };
      showScheduleModal.value = true;
    }

    async function deleteAppointment(id) {
      if (confirm("Are you sure you want to cancel this appointment?")) {
        try {
          await deleteDoc(doc(db, "appointments", id));
          await fetchAppointments();
        } catch (error) {
          console.error("Error deleting appointment:", error);
        }
      }
    }

    fetchAppointments();

    return {
      appointments,
      showScheduleModal,
      isEditing,
      selectedDate,
      appointmentForm,
      timeSlots,
      formatDate,
      submitAppointment,
      editAppointment,
      deleteAppointment,
      handleDaySelected,
      handleTimeSelected,
    };
  },
};
</script>

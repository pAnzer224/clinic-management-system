<template>
  <main class="h-full space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-satoshi-bold text-text">Appointments</h1>
      <button
        @click="showModal"
        class="bg-blue1 text-white px-4 py-2 rounded-full"
      >
        Schedule Appointment
      </button>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-2">
        <AppointmentCalendar
          :timeSlots="timeSlots"
          :appointments="appointments"
          @day-selected="handleDaySelected"
          @time-selected="handleTimeSelected"
          class="min-h-[calc(108.4vh-16rem)] max-h-[calc(108.4vh-16rem)]"
        />
      </div>

      <div
        class="bg-white rounded-2xl shadow-sm h-[calc(92vh-8rem)] flex flex-col overflow-y-auto"
      >
        <!-- Upcoming Appointments -->
        <div class="p-6 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 class="text-lg font-satoshi-medium text-text">
            Upcoming Appointments
          </h2>
        </div>

        <div class="px-6 pb-4">
          <div
            v-if="upcomingAppointments.length === 0"
            class="text-center text-text/60 py-8"
          >
            No upcoming appointments
          </div>
          <div v-else>
            <div class="relative overflow-hidden">
              <div
                class="appointment-slider"
                :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
              >
                <button
                  v-for="(appointment, index) in upcomingAppointments"
                  :key="appointment.id"
                  @click="editAppointment(appointment)"
                  class="p-4 bg-white border border-graytint rounded-xl hover:border-blue1 transition-colors w-full flex-shrink-0 text-left"
                >
                  <div class="flex items-start justify-between mb-2">
                    <h3 class="font-satoshi-medium text-text">
                      {{ appointment.studentName }}
                    </h3>
                    <div class="flex gap-2">
                      <button
                        @click="editAppointment(appointment)"
                        class="text-blue1 hover:text-blue-700"
                      >
                        <PencilIcon class="h-4 w-4" />
                      </button>
                      <button
                        @click="deleteAppointment(appointment.id)"
                        class="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p class="text-sm text-text/60 mb-2">
                    {{ appointment.reason }}
                  </p>
                  <div class="flex gap-4 text-sm text-text/80">
                    <span>{{ appointment.time }}</span>
                    <span>{{ formatDate(appointment.date) }}</span>
                  </div>
                </button>
              </div>
            </div>

            <div class="flex justify-center items-center gap-4 mt-4">
              <button
                @click="prevAppointment"
                class="hover:bg-blue3/60 rounded-full p-2 disabled:opacity-50"
                :disabled="currentIndex === 0"
              >
                <ChevronLeftIcon class="h-5 w-5 text-text" />
              </button>
              <span class="text-sm text-text/60">
                {{ currentIndex + 1 }} / {{ upcomingAppointments.length }}
              </span>
              <button
                @click="nextAppointment"
                class="hover:bg-blue3/60 rounded-full p-2 shadow-sm disabled:opacity-50"
                :disabled="currentIndex >= upcomingAppointments.length - 1"
              >
                <ChevronRightIcon class="h-5 w-5 text-text" />
              </button>
            </div>
          </div>
        </div>

        <!-- Concluded Appointments -->
        <div class="p-6 bg-white z-10 border-t">
          <h2 class="text-lg font-satoshi-medium text-text">
            Concluded Appointments
          </h2>
        </div>

        <div class="px-6 pb-6 overflow-y-auto">
          <div
            v-if="concludedAppointments.length === 0"
            class="text-center text-text/60 py-8"
          >
            No concluded appointments
          </div>
          <div v-else class="space-y-3 py-2">
            <div
              v-for="appointment in concludedAppointments"
              :key="appointment.id"
              class="p-4 bg-gray-50 border border-graytint rounded-xl"
            >
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-satoshi-medium text-text">
                  {{ appointment.studentName }}
                </h3>
                <button
                  @click="deleteAppointment(appointment.id)"
                  class="text-red-600 hover:text-red-700"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
              <p class="text-sm text-text/60 mb-2">{{ appointment.reason }}</p>
              <div class="flex gap-4 text-sm text-text/80">
                <span>{{ appointment.time }}</span>
                <span>{{ formatDate(appointment.date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule/Edit Modal -->
    <div
      v-if="showScheduleModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      @click.self="showScheduleModal = false"
    >
      <div class="bg-white rounded-2xl p-8 shadow-lg w-[500px]">
        <h2 class="text-xl font-satoshi-bold mb-6">
          {{ isEditing ? "Edit Appointment" : "Schedule Appointment" }}
        </h2>
        <form @submit.prevent="submitAppointment" class="space-y-4">
          <div>
            <label class="block mb-1">Student</label>
            <div class="flex items-center gap-2">
              <Dropdown
                v-model="selectedStudent"
                :options="studentOptions"
                style="z-index: 9999"
                placeholder="Select Student"
                class="flex-1"
              />
              <button
                type="button"
                @click="showStudentModal = true"
                class="bg-blue2 text-white p-2 rounded-full hover:bg-blue1"
              >
                <PlusIcon class="size-3" />
              </button>
            </div>
          </div>
          <div>
            <label class="block mb-1">Date</label>
            <input
              v-model="appointmentForm.date"
              type="date"
              required
              class="w-full px-4 py-2 rounded-lg bg-graytint"
            />
          </div>
          <div>
            <label class="block mb-1">Time</label>
            <Dropdown
              v-model="appointmentForm.time"
              :options="timeSlotOptions"
              placeholder="Select Time Slot"
              required
            />
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

    <!-- Student Modal -->
    <StudentModal
      v-model="showStudentModal"
      :is-editing="false"
      :initial-form-data="studentFormData"
      @submit="handleStudentSubmit"
    />
  </main>
</template>

<script>
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  setDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase-config";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";
import AppointmentCalendar from "@/components/AppointmentCalendar.vue";
import StudentModal from "@/components/StudentModal.vue";
import Dropdown from "@/components/Dropdown.vue";
import { logActivity } from "@/utils/activity-logger";

export default {
  name: "Appointments",
  components: {
    AppointmentCalendar,
    StudentModal,
    Dropdown,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
  },
  setup() {
    const appointments = ref([]);
    const students = ref([]);
    const showScheduleModal = ref(false);
    const showStudentModal = ref(false);
    const isEditing = ref(false);
    const selectedDate = ref(new Date().toISOString().split("T")[0]);
    const editingId = ref(null);
    const selectedStudent = ref("");
    const currentIndex = ref(0);
    const showToast = ref(false);
    const toastMessage = ref("");
    const currentUser = ref(
      JSON.parse(localStorage.getItem("currentUser")) || {}
    );

    // Unsubscribe functions for cleanup
    let unsubscribeAppointments = null;
    let unsubscribeStudents = null;

    function showNotification(message) {
      toastMessage.value = message;
      showToast.value = true;
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    }

    const studentFormData = ref({
      studentId: "",
      lastName: "",
      firstName: "",
      middleInitial: "",
      age: "",
      sex: "",
      nationality: "",
      address: "",
      religion: "",
      course: "",
      yearLevel: "1st Year",
      guardianName: "",
      guardianOccupation: "",
      guardianAddress: "",
      guardianContact: "",
      profileImage: "",
      labTest: "",
    });

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

    const timeSlotOptions = computed(() => {
      return timeSlots.map((time) => ({
        value: time,
        label: time,
      }));
    });

    const studentOptions = computed(() => {
      return students.value.map((student) => ({
        value: student,
        label: `${student.firstName} ${student.lastName} (${student.studentId})`,
      }));
    });

    const initialFormState = {
      studentName: "",
      studentId: "",
      date: "",
      time: "",
      reason: "",
    };

    const appointmentForm = ref({ ...initialFormState });

    const upcomingAppointments = computed(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return appointments.value.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate >= today;
      });
    });

    const concludedAppointments = computed(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return appointments.value.filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate < today;
      });
    });

    const nextAppointment = () => {
      if (currentIndex.value < upcomingAppointments.value.length - 1) {
        currentIndex.value++;
      }
    };

    const prevAppointment = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--;
      }
    };

    watch(selectedStudent, (student) => {
      if (student) {
        appointmentForm.value.studentName = `${student.firstName} ${student.lastName}`;
        appointmentForm.value.studentId = student.studentId;
      }
    });

    // Real-time students listener
    function listenToStudents() {
      const studentsQuery = query(collection(db, "students"));
      unsubscribeStudents = onSnapshot(
        studentsQuery,
        (snapshot) => {
          students.value = snapshot.docs.map((doc) => ({ ...doc.data() }));
        },
        (error) => {
          console.error("Error fetching students:", error);
          showNotification("Error loading students data");
        }
      );
    }

    // Real-time appointments listener
    function listenToAppointments() {
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
          showNotification("Error loading appointments data");
        }
      );
    }

    function formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    function showModal() {
      showScheduleModal.value = true;
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
        const appointmentData = {
          ...appointmentForm.value,
          updatedAt: serverTimestamp(),
        };

        if (isEditing.value && editingId.value) {
          await updateDoc(
            doc(db, "appointments", editingId.value),
            appointmentData
          );

          await logActivity({
            type: "appointment",
            action: "update",
            title: "Appointment Updated",
            description: `Updated appointment for ${
              appointmentForm.value.studentName
            } on ${formatDate(appointmentForm.value.date)} at ${
              appointmentForm.value.time
            }`,
            timestamp: serverTimestamp(),
            performedBy: currentUser.value,
          });

          showNotification("Appointment updated successfully");
        } else {
          appointmentData.createdAt = serverTimestamp();
          await addDoc(collection(db, "appointments"), appointmentData);

          await logActivity({
            type: "appointment",
            action: "create",
            title: "New Appointment Scheduled",
            description: `Scheduled appointment for ${
              appointmentForm.value.studentName
            } on ${formatDate(appointmentForm.value.date)} at ${
              appointmentForm.value.time
            }`,
            timestamp: serverTimestamp(),
            performedBy: currentUser.value,
          });

          showNotification("Appointment scheduled successfully");
        }

        showScheduleModal.value = false;
        appointmentForm.value = { ...initialFormState };
        selectedStudent.value = "";
        isEditing.value = false;
        editingId.value = null;
      } catch (error) {
        console.error("Error saving appointment:", error);
        showNotification("Error saving appointment");
      }
    }

    async function handleStudentSubmit(data) {
      try {
        const studentData = {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, "students", data.studentId), studentData);
        showStudentModal.value = false;

        await logActivity({
          type: "student",
          action: "create",
          title: "New Student Added",
          description: `Added new student ${data.firstName} ${data.lastName}`,
          timestamp: serverTimestamp(),
          performedBy: currentUser.value,
        });

        showNotification(
          `Student ${data.firstName} ${data.lastName} has been added`
        );
      } catch (error) {
        console.error("Error saving student:", error);
        showNotification("Error saving student");
      }
    }

    function editAppointment(appointment) {
      isEditing.value = true;
      editingId.value = appointment.id;
      appointmentForm.value = { ...appointment };
      selectedStudent.value = students.value.find(
        (s) => s.studentId === appointment.studentId
      );
      showScheduleModal.value = true;
    }

    async function deleteAppointment(id) {
      if (confirm("Are you sure you want to delete this appointment?")) {
        try {
          const appointment = appointments.value.find((a) => a.id === id);
          const appointmentDate = new Date(appointment.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isConcluded = appointmentDate < today;

          await deleteDoc(doc(db, "appointments", id));

          await logActivity({
            type: "appointment",
            action: "delete",
            title: isConcluded
              ? "Concluded Appointment Deleted"
              : "Appointment Cancelled",
            description: `${
              isConcluded
                ? "Deleted concluded appointment"
                : "Cancelled appointment"
            } for ${appointment.studentName} on ${formatDate(
              appointment.date
            )} at ${appointment.time}`,
            timestamp: serverTimestamp(),
            performedBy: currentUser.value,
          });

          if (currentIndex.value >= upcomingAppointments.value.length) {
            currentIndex.value = Math.max(
              0,
              upcomingAppointments.value.length - 1
            );
          }

          showNotification(
            isConcluded
              ? "Concluded appointment deleted successfully"
              : "Appointment cancelled successfully"
          );
        } catch (error) {
          console.error("Error deleting appointment:", error);
          showNotification("Error deleting appointment");
        }
      }
    }

    onMounted(() => {
      listenToAppointments();
      listenToStudents();
    });

    onUnmounted(() => {
      if (unsubscribeAppointments) {
        unsubscribeAppointments();
      }
      if (unsubscribeStudents) {
        unsubscribeStudents();
      }
    });

    return {
      appointments,
      students,
      upcomingAppointments,
      concludedAppointments,
      showScheduleModal,
      showStudentModal,
      isEditing,
      selectedDate,
      selectedStudent,
      appointmentForm,
      studentFormData,
      timeSlots,
      timeSlotOptions,
      studentOptions,
      currentIndex,
      showToast,
      toastMessage,
      currentUser,
      formatDate,
      showModal,
      submitAppointment,
      handleStudentSubmit,
      editAppointment,
      deleteAppointment,
      handleDaySelected,
      handleTimeSelected,
      nextAppointment,
      prevAppointment,
    };
  },
};
</script>

<style>
.appointment-slider {
  display: flex;
  transition: transform 0.3s ease;
}

.appointment-slider > div {
  width: 100%;
}
</style>

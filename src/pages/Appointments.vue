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
            class="text-center text-text/60 py-8 text-sm font-satoshi-italic tracking-wide"
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
            class="text-center text-text/60 py-8 text-sm font-satoshi-italic tracking-wide"
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
      class="fixed inset-0 flex justify-center items-center z-50"
    >
      <div
        class="fixed inset-0 bg-black/50"
        @click="showScheduleModal = false"
      ></div>
      <div
        class="relative bg-white rounded-2xl p-8 shadow-lg w-[500px]"
        @click.stop
      >
        <h2 class="text-xl font-satoshi-bold mb-6">
          {{ isEditing ? "Edit Appointment" : "Schedule Appointment" }}
        </h2>
        <form @submit.prevent="submitAppointment" class="space-y-4">
          <div>
            <label class="block mb-1">Student</label>
            <StudentSearch
              :students="students"
              style="z-index: 9999"
              @select-student="selectSearchResult"
            >
              <template #dropdown>
                <Dropdown
                  v-model="selectedStudent"
                  :options="studentOptions"
                  placeholder="Select Student"
                  class="w-full"
                  style="z-index: 9999"
                  :searchable="true"
                />
              </template>

              <template #add-button>
                <button
                  type="button"
                  @click="showStudentModal = true"
                  class="bg-blue2 text-white p-2 rounded-full hover:bg-blue1 ml-2"
                  title="Add New Student"
                >
                  <PlusIcon class="size-3" />
                </button>
              </template>
            </StudentSearch>
          </div>
          <div>
            <label class="block mb-1">Date</label>
            <input
              v-model="appointmentForm.date"
              type="date"
              required
              :min="currentDateISOString"
              class="w-full px-4 py-2 rounded-lg bg-graytint"
            />
          </div>
          <div>
            <label class="block mb-1">Time</label>
            <Dropdown
              v-model="appointmentForm.time"
              :options="timeSlotOptions"
              placeholder="Select Time Slot"
              style="z-index: 999"
              required
            />
            <p
              class="text-sm text-gray-500 mt-2 flex items-center tracking-wide font-satoshi-italic"
            >
              <span class="mr-1">Manage time slots in</span>
              <router-link
                to="/settings"
                class="text-blue1 hover:underline font-satoshi-medium"
              >
                Settings
              </router-link>
            </p>
          </div>
          <div>
            <label class="block mb-1">Appointment Type</label>
            <Dropdown
              v-model="appointmentForm.type"
              :options="appointmentTypeOptions"
              placeholder="Select Appointment Type"
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
import StudentSearch from "@/components/StudentSearch.vue";
import Dropdown from "@/components/Dropdown.vue";
import { logActivity } from "@/utils/activity-logger";

export default {
  name: "Appointments",
  components: {
    AppointmentCalendar,
    StudentModal,
    StudentSearch,
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
    const currentDateISOString = ref(new Date().toISOString().split("T")[0]);
    const editingId = ref(null);
    const selectedStudent = ref("");
    const currentIndex = ref(0);
    const showToast = ref(false);
    const toastMessage = ref("");
    const timeSlots = ref([]);
    const currentUser = ref(
      JSON.parse(localStorage.getItem("currentUser")) || {}
    );
    const timeSlotOptions = computed(() => {
      return timeSlots.value.map((slot) => ({ value: slot, label: slot }));
    });

    const appointmentTypeOptions = [
      { value: "regular", label: "Regular Consultation" },
      { value: "emergency", label: "Emergency Case" },
      { value: "followup", label: "Follow-up Visit" },
    ];

    let unsubscribeAppointments = null;
    let unsubscribeStudents = null;
    let unsubscribeSettings = null;

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
      type: "regular",
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

    // Handle student selection from StudentSearch
    const selectSearchResult = (student) => {
      selectedStudent.value = student;
      appointmentForm.value.studentName = `${student.firstName} ${student.lastName}`;
      appointmentForm.value.studentId = student.studentId;
    };

    watch(selectedStudent, (student) => {
      if (student) {
        appointmentForm.value.studentName = `${student.firstName} ${student.lastName}`;
        appointmentForm.value.studentId = student.studentId;
      }
    });
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

    // Get time slots from Settings
    function listenToTimeSlots() {
      const settingsRef = doc(db, "settings", "timeSlots");
      unsubscribeSettings = onSnapshot(settingsRef, (doc) => {
        if (doc.exists()) {
          timeSlots.value = doc.data().slots;
        } else {
          // Default time slots if none exist yet
          timeSlots.value = [
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
    }

    function formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    function showModal() {
      // Set date to today by default when opening the modal
      appointmentForm.value.date = currentDateISOString.value;
      showScheduleModal.value = true;
    }

    const handleDaySelected = (date) => {
      selectedDate.value = date.toISOString().split("T")[0];
    };

    const handleTimeSelected = ({ date, time }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate >= today) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        appointmentForm.value.date = `${year}-${
          month < 10 ? "0" + month : month
        }-${day < 10 ? "0" + day : day}`;
        appointmentForm.value.time = time;
        showScheduleModal.value = true;
      } else {
        showNotification("Cannot schedule appointments for past dates");
      }
    };

    async function handleStudentSubmit(data) {
      try {
        const studentData = {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, "students", data.studentId), studentData);

        // Update current form with new student data
        selectedStudent.value = studentData;
        appointmentForm.value.studentName = `${studentData.firstName} ${studentData.lastName}`;
        appointmentForm.value.studentId = studentData.studentId;

        await logActivity({
          type: "student",
          action: "create",
          title: "New Student Added",
          description: `Added new student ${data.firstName} ${data.lastName}`,
          timestamp: serverTimestamp(),
          performedBy: currentUser.value,
        });

        showStudentModal.value = false;
        showNotification(
          `Student ${data.firstName} ${data.lastName} has been added`
        );
      } catch (error) {
        console.error("Error saving student:", error);
        showNotification("Error saving student");
      }
    }

    async function submitAppointment() {
      try {
        // Validate that date is not in the past
        const selectedDate = new Date(appointmentForm.value.date);
        selectedDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          showNotification("Cannot schedule appointments for past dates");
          return;
        }

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
      listenToTimeSlots();
    });

    onUnmounted(() => {
      if (unsubscribeAppointments) {
        unsubscribeAppointments();
      }
      if (unsubscribeStudents) {
        unsubscribeStudents();
      }
      if (unsubscribeSettings) {
        unsubscribeSettings();
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
      timeSlotOptions,
      appointmentTypeOptions,
      studentOptions,
      currentIndex,
      showToast,
      toastMessage,
      currentUser,
      currentDateISOString,
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
      selectSearchResult,
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

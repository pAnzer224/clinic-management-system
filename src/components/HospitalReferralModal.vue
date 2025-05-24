<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 flex justify-center items-center z-50"
  >
    <div class="fixed inset-0 bg-black/50"></div>
    <div
      class="relative bg-white rounded-2xl p-8 shadow-lg w-[800px] h-[90vh]"
      @click.stop
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-satoshi-bold">Hospital Referral</h2>
        <div class="flex items-center gap-2">
          <div class="relative group">
            <button
              @click="downloadReferral"
              class="text-blue1 hover:text-blue1/80 flex items-center justify-center h-full"
            >
              <Download class="size-6" />
            </button>
          </div>
          <button @click="close" class="text-gray-500 hover:text-gray-700">
            <X class="w-6 h-6" />
          </button>
        </div>
      </div>

      <div class="h-[calc(90vh-88px)] overflow-y-scroll no-scrollbar pr-4">
        <!-- This div will be captured as an image -->
        <div ref="referralContent" class="bg-white p-6 rounded-lg">
          <!-- Header with university name -->
          <div class="text-center mb-6">
            <h1 class="text-xl font-bold uppercase">
              CENTRAL PHILIPPINES STATE UNIVERSITY
            </h1>
            <p>Kabankalan City, Negros Occidental</p>
            <h2 class="text-lg font-bold mt-3 uppercase">REFERRAL FORM</h2>
          </div>

          <!-- Patient Information Section -->
          <div class="space-y-4 mb-6">
            <div>
              <div class="flex mb-2">
                <label class="block text-sm">Date:</label>
                <input
                  type="date"
                  v-model="referralData.referralDate"
                  class="ml-2 border-b border-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3">
              <div>
                <label class="block text-sm">Name:</label>
                <input
                  v-model="referralData.patientName"
                  class="w-full border-b border-gray-400 focus:outline-none"
                  placeholder="Full Name"
                />
              </div>
              <div class="flex gap-4">
                <div class="flex-1">
                  <label class="block text-sm">Address:</label>
                  <input
                    v-model="referralData.address"
                    class="w-full border-b border-gray-400 focus:outline-none"
                    placeholder="Complete Address"
                  />
                </div>
              </div>
              <div class="grid grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm">Age:</label>
                  <input
                    v-model="referralData.age"
                    class="w-full border-b border-gray-400 focus:outline-none"
                    placeholder="Age"
                  />
                </div>
                <div>
                  <label class="block text-sm">Date of Birth:</label>
                  <input
                    type="date"
                    v-model="referralData.dateOfBirth"
                    class="w-full border-b border-gray-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm">Civil Status:</label>
                  <input
                    v-model="referralData.civilStatus"
                    class="w-full border-b border-gray-400 focus:outline-none"
                    placeholder="Civil Status"
                  />
                </div>
                <div>
                  <label class="block text-sm">Sex:</label>
                  <input
                    v-model="referralData.sex"
                    class="w-full border-b border-gray-400 focus:outline-none"
                    placeholder="Sex"
                  />
                </div>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="student"
                    v-model="referralData.isStudent"
                  />
                  <label for="student" class="text-sm">student</label>
                  <input
                    type="checkbox"
                    id="personnel"
                    v-model="referralData.isPersonnel"
                  />
                  <label for="personnel" class="text-sm">personnel</label>
                </div>
                <div class="mt-1">
                  <label class="block text-sm"
                    >Occupation/Year & Section:</label
                  >
                  <input
                    v-model="referralData.occupationYearSection"
                    class="w-full border-b border-gray-400 focus:outline-none"
                    placeholder="Occupation/Year & Section"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Referral Information -->
          <div class="space-y-4 mb-6">
            <div class="grid grid-cols-1 gap-4">
              <div>
                <div class="flex gap-4 mb-2">
                  <p class="text-sm">Referred from:</p>
                  <div class="flex gap-6">
                    <div class="flex items-center gap-1">
                      <input
                        type="checkbox"
                        id="md1"
                        v-model="referralData.referredFromMD"
                      />
                      <label for="md1" class="text-sm">Medical Doctor</label>
                    </div>
                    <div class="flex items-center gap-1">
                      <input
                        type="checkbox"
                        id="nurse1"
                        v-model="referralData.referredFromNurse"
                        checked
                      />
                      <label for="nurse1" class="text-sm">School Nurse</label>
                    </div>
                    <div class="flex items-center gap-1">
                      <input
                        type="checkbox"
                        id="dentist1"
                        v-model="referralData.referredFromDentist"
                      />
                      <label for="dentist1" class="text-sm">Dentist</label>
                    </div>
                  </div>
                </div>
                <input
                  v-model="referralData.referredFrom"
                  class="w-full border-b border-gray-400 focus:outline-none"
                  placeholder="Referred from"
                />
              </div>
              <div>
                <div class="flex gap-4 mb-2">
                  <p class="text-sm">Referred to:</p>
                  <div class="flex gap-6">
                    <div class="flex items-center gap-1">
                      <input
                        type="checkbox"
                        id="md2"
                        v-model="referralData.referredToMD"
                        checked
                      />
                      <label for="md2" class="text-sm">Medical Doctor</label>
                    </div>
                    <div class="flex items-center gap-1">
                      <input
                        type="checkbox"
                        id="cho"
                        v-model="referralData.referredToCHO"
                      />
                      <label for="cho" class="text-sm">CHO</label>
                    </div>
                    <div class="flex items-center gap-1">
                      <input
                        type="checkbox"
                        id="dentist2"
                        v-model="referralData.referredToDentist"
                      />
                      <label for="dentist2" class="text-sm">Dentist</label>
                    </div>
                    <div class="flex items-center gap-1">
                      <input
                        type="checkbox"
                        id="radio"
                        v-model="referralData.referredToRadiologist"
                      />
                      <label for="radio" class="text-sm">Radiologist</label>
                    </div>
                  </div>
                </div>
                <input
                  v-model="referralData.referredTo"
                  class="w-full border-b border-gray-400 focus:outline-none"
                  placeholder="Referred to"
                />
              </div>
            </div>

            <div class="grid grid-cols-6 gap-3">
              <div>
                <label class="block text-sm">Weight:</label>
                <input
                  v-model="referralData.weight"
                  class="w-full border-b border-gray-400 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-sm">T:</label>
                <input
                  v-model="referralData.temperature"
                  class="w-full border-b border-gray-400 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-sm">BP:</label>
                <input
                  v-model="referralData.bloodPressure"
                  class="w-full border-b border-gray-400 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-sm">HR:</label>
                <input
                  v-model="referralData.heartRate"
                  class="w-full border-b border-gray-400 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-sm">RR:</label>
                <input
                  v-model="referralData.respiratoryRate"
                  class="w-full border-b border-gray-400 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-sm">AOG:</label>
                <input
                  v-model="referralData.aog"
                  class="w-full border-b border-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm mb-1">Reason for Referral:</label>
              <textarea
                v-model="referralData.reasonForReferral"
                class="w-full border border-gray-400 p-2 min-h-[80px] focus:outline-none"
                placeholder="Provide reason for referral"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm mb-1">Tentative Diagnosis:</label>
              <textarea
                v-model="referralData.tentativeDiagnosis"
                class="w-full border border-gray-400 p-2 min-h-[80px] focus:outline-none"
                placeholder="Provide tentative diagnosis if available"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm mb-1"
                >Treatment/Medications Given:</label
              >
              <textarea
                v-model="referralData.treatmentGiven"
                class="w-full border border-gray-400 p-2 min-h-[80px] focus:outline-none"
                placeholder="List any treatments or medications given"
              ></textarea>
            </div>
          </div>

          <!-- Signature section -->
          <div class="mt-8 mb-10 text-right">
            <div
              class="border-t border-gray-400 inline-block w-64 pt-1 text-center"
            >
              <p class="text-sm">
                Name and Signature of Examining Physician/Nurse
              </p>
            </div>
          </div>

          <!-- Return referral slip with additional padding to prevent text cut-off -->
          <div class="mt-10 pt-6 border-t-2 border-gray-500">
            <h3 class="text-center font-bold mb-2">RETURN REFERRAL SLIP</h3>
            <p class="text-center text-sm mb-6">
              (Please send back this form when accomplished)
            </p>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm">To:</label>
                <input
                  v-model="referralData.returnTo"
                  class="w-full border-b border-gray-400 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-sm">Date:</label>
                <input
                  v-model="referralData.returnDate"
                  class="w-full border-b border-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm">From:</label>
              <input
                v-model="referralData.returnFrom"
                class="w-full border-b border-gray-400 focus:outline-none"
              />
            </div>

            <div class="grid grid-cols-1 gap-4 mt-3">
              <div>
                <label class="block text-sm">Name of Patient:</label>
                <input
                  v-model="referralData.returnPatientName"
                  class="w-full border-b border-gray-400 focus:outline-none"
                />
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm">Gender:</label>
                  <input
                    v-model="referralData.returnGender"
                    class="w-full border-b border-gray-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm">Civil Status:</label>
                  <input
                    v-model="referralData.returnCivilStatus"
                    class="w-full border-b border-gray-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm">Occupation:</label>
                  <input
                    v-model="referralData.returnOccupation"
                    class="w-full border-b border-gray-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm">Address:</label>
                <input
                  v-model="referralData.returnAddress"
                  class="w-full border-b border-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <div class="mt-4 mb-4">
              <label class="block text-sm mb-1">Diagnosis:</label>
              <textarea
                v-model="referralData.returnDiagnosis"
                class="w-full border border-gray-400 p-2 min-h-[60px] focus:outline-none"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4 mt-3 mb-4">
              <div>
                <label class="block text-sm">Date Received:</label>
                <input
                  v-model="referralData.dateReceived"
                  class="w-full border-b border-gray-400 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-sm">Action Taken:</label>
                <input
                  v-model="referralData.actionTaken"
                  class="w-full border-b border-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <div class="mt-4 mb-4">
              <label class="block text-sm mb-1">Result:</label>
              <div class="flex gap-6 mt-1">
                <div class="flex items-center gap-1">
                  <input
                    type="checkbox"
                    id="improved"
                    v-model="referralData.resultImproved"
                  />
                  <label for="improved" class="text-sm">Improved</label>
                </div>
                <div class="flex items-center gap-1">
                  <input
                    type="checkbox"
                    id="unimproved"
                    v-model="referralData.resultUnimproved"
                  />
                  <label for="unimproved" class="text-sm">Unimproved</label>
                </div>
                <div class="flex items-center gap-1">
                  <input
                    type="checkbox"
                    id="deceased"
                    v-model="referralData.resultDeceased"
                  />
                  <label for="deceased" class="text-sm">Deceased</label>
                </div>
                <div class="flex items-center gap-1">
                  <input
                    type="checkbox"
                    id="confined"
                    v-model="referralData.resultConfined"
                  />
                  <label for="confined" class="text-sm">Confined</label>
                </div>
              </div>
              <div class="mt-2">
                <label class="block text-sm">Others (Please specify):</label>
                <input
                  v-model="referralData.resultOthers"
                  class="w-full border-b border-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <div class="mt-4 mb-6">
              <label class="block text-sm mb-1">Remarks:</label>
              <textarea
                v-model="referralData.remarks"
                class="w-full border border-gray-400 p-2 min-h-[60px] focus:outline-none"
              ></textarea>
            </div>

            <div class="mt-8 mb-8 text-right">
              <div
                class="border-t border-gray-400 inline-block w-64 pt-1 text-center"
              >
                <p class="text-sm">
                  Name and Signature of Examining Medical Officer
                </p>
              </div>
            </div>

            <div class="mt-4 mb-4 text-sm text-gray-500 text-right">
              <p>Doc Control Code:CPSU-F-MDH-U-04</p>
              <p>Effective Date:08/12/2018</p>
              <p>Page No.:1 of 1</p>
            </div>
          </div>
        </div>

        <div v-if="!viewOnly" class="flex justify-end gap-4 mt-6">
          <button
            @click="close"
            class="px-6 py-2 bg-gray-300 rounded-full hover:bg-gray-400 mb-8"
          >
            Cancel
          </button>
          <button
            @click="submitReferral"
            class="px-6 py-2 rounded-full mb-8 bg-blue1 text-white hover:bg-blue-700 flex items-center gap-2"
            :disabled="!isFormValid || isSubmitting"
          >
            <span v-if="isSubmitting">Submitting...</span>
            <span v-else>Submit</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { X, Download } from "lucide-vue-next";
import html2canvas from "html2canvas";
import { uploadDocumentToSupabase } from "@/utils/supabase-storage";
import { createClient } from "@supabase/supabase-js";

export default {
  name: "HospitalReferralModal",
  components: {
    X,
    Download,
  },
  props: {
    modelValue: Boolean,
    recordData: {
      type: Object,
      default: () => ({}),
    },
    viewOnly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "referral-submitted"],
  setup(props, { emit }) {
    const referralContent = ref(null);
    const isSubmitting = ref(false);

    // Initialize Supabase client
    const supabaseUrl = "https://wfornkmxdpgtxvatwzne.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmb3Jua214ZHBndHh2YXR3em5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMjY5MzAsImV4cCI6MjA1NjgwMjkzMH0.hkUPR7wV1iVg5Zxv-1zHYVPjiO1QFPgNvuB-jHuojdY";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const referralData = ref({
      patientName: "",
      referralDate: new Date().toISOString().split("T")[0],
      referredFrom: "CENTRAL PHILIPPINES STATE UNIVERSITY",
      referredTo: "",
      reasonForReferral: "",
      tentativeDiagnosis: "",
      age: "",
      address: "",
      dateOfBirth: "",
      civilStatus: "",
      sex: "",
      isStudent: true,
      isPersonnel: false,
      occupationYearSection: "",
      referredFromMD: false,
      referredFromNurse: true,
      referredFromDentist: false,
      referredToMD: true,
      referredToCHO: false,
      referredToDentist: false,
      referredToRadiologist: false,
      weight: "",
      temperature: "",
      bloodPressure: "",
      heartRate: "",
      respiratoryRate: "",
      aog: "",
      treatmentGiven: "",
      returnTo: "",
      returnDate: "",
      returnFrom: "",
      returnPatientName: "",
      returnGender: "",
      returnCivilStatus: "",
      returnOccupation: "",
      returnAddress: "",
      returnDiagnosis: "",
      dateReceived: "",
      actionTaken: "",
      resultImproved: false,
      resultUnimproved: false,
      resultDeceased: false,
      resultConfined: false,
      resultOthers: "",
      remarks: "",
    });

    // Watch for changes in record data to auto-fill form
    watch(
      () => props.recordData,
      (newData) => {
        if (newData) {
          // For new referral creation from patient record
          if (newData.studentName) {
            referralData.value.patientName = newData.studentName || "";
            referralData.value.returnPatientName = newData.studentName || "";

            // Pre-fill personal information if available
            if (newData.student) {
              referralData.value.age = newData.student.age || "";
              referralData.value.sex = newData.student.sex || "";
              referralData.value.address = newData.student.address || "";
              referralData.value.civilStatus =
                newData.student.civilStatus || "";
              referralData.value.dateOfBirth =
                newData.student.dateOfBirth || "";
              referralData.value.occupationYearSection = `${
                newData.student.course || ""
              } - ${newData.student.yearLevel || ""}`;

              // Copy to return section
              referralData.value.returnGender = newData.student.sex || "";
              referralData.value.returnCivilStatus =
                newData.student.civilStatus || "";
              referralData.value.returnAddress = newData.student.address || "";
              referralData.value.returnOccupation =
                referralData.value.occupationYearSection;
            }

            // Pre-fill vital signs if available
            if (newData.temperature) {
              referralData.value.temperature = newData.temperature || "";
            }
            if (newData.bloodPressure) {
              referralData.value.bloodPressure = newData.bloodPressure || "";
            }

            // Pre-fill reason for referral based on chief complaint if available
            if (newData.chiefComplaint) {
              referralData.value.reasonForReferral = `Patient presented with: ${newData.chiefComplaint}`;
            }

            // Pre-fill tentative diagnosis if available from treatment notes
            if (newData.treatment) {
              referralData.value.tentativeDiagnosis = newData.treatment;
            }

            // Pre-fill treatment/medications given
            if (newData.medications && newData.medications.length) {
              const meds = newData.medications
                .map(
                  (med) =>
                    `${med.name} ${med.strength ? `(${med.strength})` : ""} - ${
                      med.dosage
                    } ${med.quantity > 1 ? `x${med.quantity}` : ""}`
                )
                .join("\n");
              referralData.value.treatmentGiven = meds;
            }
          }
          // For viewing existing referral
          else if (newData.patient_name) {
            referralData.value.patientName = newData.patient_name || "";
            referralData.value.referralDate =
              newData.referral_date || new Date().toISOString().split("T")[0];
            referralData.value.referredFrom =
              newData.referred_from || "CENTRAL PHILIPPINES STATE UNIVERSITY";
            referralData.value.referredTo = newData.referred_to || "";
            referralData.value.reasonForReferral =
              newData.reason_for_referral || "";
            referralData.value.tentativeDiagnosis =
              newData.tentative_diagnosis || "";

            // Add other fields if they exist in the record
            if (newData.return_patient_name) {
              referralData.value.returnPatientName =
                newData.return_patient_name;
            } else {
              referralData.value.returnPatientName = newData.patient_name || "";
            }
          }
        }
      },
      { immediate: true }
    );

    const isFormValid = computed(() => {
      return (
        referralData.value.patientName &&
        referralData.value.referralDate &&
        referralData.value.referredFrom &&
        referralData.value.referredTo &&
        referralData.value.reasonForReferral
      );
    });

    const close = () => {
      emit("update:modelValue", false);
    };

    const downloadReferral = async () => {
      try {
        const element = referralContent.value;
        const canvas = await html2canvas(element, {
          scale: 3, // Higher scale for better quality
          logging: false,
          useCORS: true,
          backgroundColor: "#ffffff",
          // Add extra height to ensure nothing is cut off
          height: element.offsetHeight + 20,
        });

        // Convert canvas to blob and download
        canvas.toBlob(
          (blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `hospital_referral_${
              referralData.value.patientName || "patient"
            }_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          },
          "image/png",
          1.0
        );
      } catch (error) {
        console.error("Error downloading referral:", error);
      }
    };

    const submitReferral = async () => {
      if (!isFormValid.value || isSubmitting.value) return;

      isSubmitting.value = true;

      try {
        // Generate the canvas with higher quality settings for the entire form
        const element = referralContent.value;
        const canvas = await html2canvas(element, {
          scale: 3, // Higher scale for better quality
          logging: false,
          useCORS: true,
          backgroundColor: "#ffffff",
          // Add extra height to ensure nothing is cut off
          height: element.offsetHeight + 20,
        });

        // Convert canvas to blob
        const blob = await new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
        });

        // Create a File object from the blob
        const file = new File([blob], `referral_${Date.now()}.png`, {
          type: "image/png",
        });

        // Upload the file using Supabase - specify 'referrals' folder
        const imageUrl = await uploadDocumentToSupabase(file, "referrals");

        // Prepare data for Supabase SQL database (only the fields defined in the SQL schema)
        const referralForDB = {
          image_url: imageUrl,
          patient_name: referralData.value.patientName,
          referral_date: referralData.value.referralDate,
          referred_from: referralData.value.referredFrom,
          referred_to: referralData.value.referredTo,
          reason_for_referral: referralData.value.reasonForReferral,
          tentative_diagnosis: referralData.value.tentativeDiagnosis || null,
        };

        // Insert into Supabase SQL database
        const { data, error } = await supabase
          .from("referrals")
          .insert([referralForDB])
          .select();

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        console.log("Referral saved successfully:", data);

        // Notify parent component of successful submission
        emit("referral-submitted", {
          id: data[0].id,
          imageUrl: imageUrl,
          patientName: referralData.value.patientName,
          referralDate: referralData.value.referralDate,
        });

        // Show success message
        alert("Referral submitted successfully!");

        // Close modal
        close();
      } catch (error) {
        console.error("Error submitting referral:", error);
        alert(`Failed to submit referral: ${error.message}`);
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      referralContent,
      referralData,
      isFormValid,
      isSubmitting,
      close,
      downloadReferral,
      submitReferral,
    };
  },
};
</script>

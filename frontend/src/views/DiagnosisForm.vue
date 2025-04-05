<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">New Diagnosis</h2>
    
    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Patient Selection -->
      <div>
        <label for="patient" class="block text-sm font-medium text-gray-700">Select Patient</label>
        <select
          id="patient"
          v-model="form.patientId"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          required
        >
          <option value="">-- Select a patient --</option>
          <option v-for="patient in patients" :key="patient.id" :value="patient.id">
            {{ patient.firstName }} {{ patient.lastName }} ({{ patient.village }})
          </option>
        </select>
      </div>

      <!-- Diagnosis Type -->
      <div>
        <label for="diagnosisType" class="block text-sm font-medium text-gray-700">Diagnosis Type</label>
        <select
          id="diagnosisType"
          v-model="form.diagnosisType"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          required
        >
          <option value="malaria">Malaria</option>
          <option value="covid">COVID-19</option>
          <option value="maternal">Maternal Health</option>
          <option value="general">General</option>
        </select>
      </div>

      <!-- Symptoms -->
      <div>
        <label for="symptoms" class="block text-sm font-medium text-gray-700">Symptoms</label>
        <textarea
          id="symptoms"
          v-model="form.symptoms"
          rows="4"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          placeholder="Enter symptoms, separated by commas"
          required
        ></textarea>
      </div>

      <!-- Image Upload -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Upload Image (Optional)</label>
        <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div class="space-y-1 text-center">
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div class="flex text-sm text-gray-600">
              <label
                for="file-upload"
                class="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  type="file"
                  class="sr-only"
                  accept="image/*"
                  @change="handleImageUpload"
                />
              </label>
              <p class="pl-1">or drag and drop</p>
            </div>
            <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        <div v-if="form.imagePreview" class="mt-2">
          <img :src="form.imagePreview" class="max-h-32" />
          <button
            @click="removeImage"
            class="mt-2 text-sm text-red-600 hover:text-red-500"
          >
            Remove image
          </button>
        </div>
      </div>

      <!-- Voice Input -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Voice Input (Optional)</label>
        <div class="mt-1">
          <button
            type="button"
            @click="toggleVoiceRecording"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white"
            :class="[
              isRecording
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700',
            ]"
          >
            <svg
              class="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                v-if="isRecording"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                v-if="isRecording"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            {{ isRecording ? "Stop Recording" : "Start Voice Input" }}
          </button>
          <p v-if="form.voiceText" class="mt-2 text-sm text-gray-500">
            Transcription: {{ form.voiceText }}
          </p>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Submit for Diagnosis
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();

const form = ref({
  patientId: "",
  diagnosisType: "general",
  symptoms: "",
  imageFile: null,
  imagePreview: null,
  voiceText: "",
});

const patients = ref([]);
const isRecording = ref(false);

onMounted(async () => {
  // TODO: Fetch patients from API
  patients.value = [
    {
      id: 1,
      firstName: "John",
      lastName: "Mukisa",
      village: "Kampala",
    },
    {
      id: 2,
      firstName: "Sarah",
      lastName: "Nambi",
      village: "Jinja",
    },
  ];
});

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  form.value.imageFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    form.value.imagePreview = e.target.result;
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  form.value.imageFile = null;
  form.value.imagePreview = null;
};

const toggleVoiceRecording = () => {
  isRecording.value = !isRecording.value;
  
  if (isRecording.value) {
    // TODO: Implement actual voice recording
    // For now, simulate voice recognition
    setTimeout(() => {
      const possibleTexts = [
        "Patient has fever, headache, and joint pain for three days",
        "Coughing, difficulty breathing, and chest pain",
        "Stomach pain, vomiting, and diarrhea since yesterday",
      ];
      form.value.voiceText = possibleTexts[Math.floor(Math.random() * possibleTexts.length)];
      isRecording.value = false;
      toast.success("Voice transcription complete");
    }, 3000);
  }
};

const submitForm = async () => {
  try {
    // TODO: Implement API call to backend
    toast.success("Diagnosis submitted successfully");
    router.push("/diagnosis-result/1"); // Replace with actual diagnosis ID
  } catch (error) {
    toast.error("Error submitting diagnosis");
    console.error(error);
  }
};
</script> 
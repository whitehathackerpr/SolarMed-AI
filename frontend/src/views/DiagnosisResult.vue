<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Diagnosis Result</h2>
        <span
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          :class="[
            isOnline
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800',
          ]"
        >
          {{ isOnline ? "Online" : "Offline" }}
        </span>
      </div>
      
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p class="mt-2">Loading diagnosis results...</p>
      </div>
      
      <div v-else>
        <!-- Patient Information -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p class="text-sm text-gray-500">Name</p>
              <p class="font-medium">{{ patient.firstName }} {{ patient.lastName }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Age</p>
              <p class="font-medium">{{ patient.age }} years</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Gender</p>
              <p class="font-medium">{{ patient.gender }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Location</p>
              <p class="font-medium">{{ patient.village }}, {{ patient.district }}</p>
            </div>
          </div>
        </div>
        
        <!-- Diagnosis Details -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Diagnosis Details</h3>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-500">Diagnosis Type</p>
              <p class="font-medium">{{ diagnosis.type }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Symptoms</p>
              <p class="font-medium">{{ diagnosis.symptoms }}</p>
            </div>
            <div v-if="diagnosis.imagePath">
              <p class="text-sm text-gray-500 mb-2">Uploaded Image</p>
              <img :src="diagnosis.imagePath" class="max-h-48 rounded-lg" />
            </div>
            <div v-if="diagnosis.voiceText">
              <p class="text-sm text-gray-500">Voice Input</p>
              <p class="font-medium">{{ diagnosis.voiceText }}</p>
            </div>
          </div>
        </div>
        
        <!-- AI Prediction -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">AI Prediction</h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
              <p class="font-medium">Predicted Condition</p>
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="[
                  diagnosis.confidence > 0.7
                    ? 'bg-green-100 text-green-800'
                    : diagnosis.confidence > 0.4
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800',
                ]"
              >
                {{ (diagnosis.confidence * 100).toFixed(1) }}% Confidence
              </span>
            </div>
            <div class="space-y-2">
              <p class="font-medium text-lg">{{ diagnosis.prediction.condition }}</p>
              <p class="text-gray-600">{{ diagnosis.prediction.description }}</p>
            </div>
          </div>
        </div>
        
        <!-- Recommended Treatment -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Recommended Treatment</h3>
          <div class="bg-green-50 rounded-lg p-4">
            <ul class="list-disc list-inside space-y-2">
              <li v-for="(treatment, index) in diagnosis.treatment" :key="index">
                {{ treatment }}
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex justify-end space-x-4">
          <button
            @click="printDiagnosis"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg
              class="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print
          </button>
          <button
            @click="saveDiagnosis"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg
              class="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiagnosisResult',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      patient: {},
      diagnosis: {},
      isOnline: navigator.onLine
    }
  },
  mounted() {
    // Simulate loading diagnosis data
    setTimeout(() => {
      // In a real implementation, we would fetch from the API using this.id
      this.diagnosis = {
        id: parseInt(this.id),
        patient_id: 2,
        symptoms: "Fever, headache, joint pain, chills for three days",
        diagnosis: this.getRandomDiagnosis(),
        confidence: Math.random() * 0.5 + 0.5, // Between 0.5 and 1.0
        image_path: null,
        voice_path: null,
        created_at: new Date(),
        synced: false,
        type: "Malaria",
        imagePath: null,
        voiceText: "Patient has been experiencing fever and headache for three days",
        prediction: {
          condition: "Malaria",
          description:
            "Based on the symptoms and test results, the patient is likely suffering from malaria. Further blood tests are recommended to confirm the diagnosis.",
        },
        treatment: [
          "Artemether-lumefantrine (AL) for 3 days",
          "Paracetamol for fever and pain",
          "Rest and hydration",
          "Follow-up in 3 days",
        ],
      };
      
      // Get patient data
      this.patient = {
        id: 2,
        firstName: "Sarah",
        lastName: "Nambi",
        age: 32,
        gender: "Female",
        village: "Jinja",
        district: "Eastern",
      };
      
      this.loading = false;
      
      // Show toast message
      this.$parent.showToastMessage('Diagnosis loaded');
      
      // Add event listeners for online/offline status
      window.addEventListener("online", () => (this.isOnline = true));
      window.addEventListener("offline", () => (this.isOnline = false));
    },
    methods: {
      formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-UG') + ' ' + d.toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
      },
      getRandomDiagnosis() {
        const diagnoses = ['malaria', 'pneumonia', 'covid19', 'tuberculosis', 'maternal_complication'];
        return diagnoses[Math.floor(Math.random() * diagnoses.length)];
      },
      getBgColorByConfidence(confidence) {
        if (confidence >= 0.8) return 'bg-green-50';
        if (confidence >= 0.6) return 'bg-yellow-50';
        return 'bg-red-50';
      },
      getConfidenceBadgeColor(confidence) {
        if (confidence >= 0.8) return 'bg-green-600';
        if (confidence >= 0.6) return 'bg-yellow-600';
        return 'bg-red-600';
      },
      printDiagnosis() {
        // In a real implementation, this would generate a printable report
        this.$parent.showToastMessage('Preparing print report...');
        setTimeout(() => {
          window.print();
        }, 500);
      },
      saveDiagnosis() {
        // TODO: Implement API call to save diagnosis
        this.$parent.showToastMessage('Saving diagnosis...');
        setTimeout(() => {
          this.$parent.showToastMessage('Diagnosis saved successfully');
        }, 500);
      }
    }
  }
}
</script>

<style>
@media print {
  nav, header, button, .btn {
    display: none !important;
  }
  
  body, html {
    background-color: white !important;
  }
  
  .bg-white, .bg-gray-50, .bg-blue-50, .bg-green-50, .bg-yellow-50, .bg-red-50 {
    background-color: white !important;
    border: 1px solid #eee !important;
  }
}
</style>

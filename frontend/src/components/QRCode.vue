<template>
  <div class="flex flex-col items-center">
    <div
      ref="qrCodeRef"
      class="bg-white p-4 rounded-lg shadow-lg"
      :class="{ 'cursor-pointer': clickable }"
      @click="handleClick"
    >
      <canvas ref="canvasRef"></canvas>
    </div>
    <div v-if="showPatientInfo" class="mt-4 text-center">
      <p class="text-lg font-semibold">{{ patientName }}</p>
      <p class="text-sm text-gray-600">ID: {{ patientId }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import QRCode from 'qrcode';

const props = defineProps({
  patientId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 200
  },
  showPatientInfo: {
    type: Boolean,
    default: true
  },
  clickable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const canvasRef = ref(null);
const qrCodeRef = ref(null);

const generateQRCode = async () => {
  try {
    const data = JSON.stringify({
      id: props.patientId,
      name: props.patientName,
      timestamp: new Date().toISOString()
    });

    await QRCode.toCanvas(canvasRef.value, data, {
      width: props.size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
};

const handleClick = () => {
  if (props.clickable) {
    emit('click', {
      id: props.patientId,
      name: props.patientName
    });
  }
};

// Watch for changes in patient data
watch([() => props.patientId, () => props.patientName], () => {
  generateQRCode();
});

onMounted(() => {
  generateQRCode();
});
</script> 
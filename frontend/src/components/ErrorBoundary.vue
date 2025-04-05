<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <h2>Something went wrong</h2>
      <p>{{ error.message }}</p>
      <button @click="resetError" class="retry-button">
        Try again
      </button>
      <button @click="reportError" class="report-button">
        Report error
      </button>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';
import { notificationService } from '../services/notificationService';

const error = ref(null);
const errorInfo = ref(null);

const resetError = () => {
  error.value = null;
  errorInfo.value = null;
};

const reportError = () => {
  // Here you would typically send the error to your error tracking service
  console.error('Error reported:', error.value, errorInfo.value);
  notificationService.success('Error reported successfully');
};

onErrorCaptured((err, instance, info) => {
  error.value = err;
  errorInfo.value = info;
  
  // Log error for debugging
  console.error('Error caught by boundary:', err);
  console.error('Component info:', info);
  
  // Prevent error from propagating
  return false;
});
</script>

<style scoped>
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-content h2 {
  color: #dc3545;
  margin-bottom: 10px;
}

.error-content p {
  color: #6c757d;
  margin-bottom: 20px;
}

.retry-button,
.report-button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  margin: 0 5px;
}

.retry-button {
  background-color: #007bff;
  color: white;
}

.report-button {
  background-color: #6c757d;
  color: white;
}

.retry-button:hover {
  background-color: #0056b3;
}

.report-button:hover {
  background-color: #5a6268;
}
</style> 
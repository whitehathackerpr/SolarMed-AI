import { ref } from 'vue';

class NotificationService {
  constructor() {
    this.notifications = ref([]);
    this.maxNotifications = 5;
    this.defaultDuration = 5000;
  }

  addNotification(message, type = 'info', duration = this.defaultDuration) {
    const id = Date.now().toString(36);
    const notification = {
      id,
      message,
      type,
      duration,
      timestamp: new Date().toISOString()
    };

    this.notifications.value.push(notification);

    // Remove notification after duration
    setTimeout(() => {
      this.removeNotification(id);
    }, duration);

    // Limit number of notifications
    if (this.notifications.value.length > this.maxNotifications) {
      this.notifications.value.shift();
    }

    return id;
  }

  removeNotification(id) {
    this.notifications.value = this.notifications.value.filter(
      notification => notification.id !== id
    );
  }

  clearNotifications() {
    this.notifications.value = [];
  }

  info(message, duration = this.defaultDuration) {
    return this.addNotification(message, 'info', duration);
  }

  success(message, duration = this.defaultDuration) {
    return this.addNotification(message, 'success', duration);
  }

  warning(message, duration = this.defaultDuration) {
    return this.addNotification(message, 'warning', duration);
  }

  error(message, duration = this.defaultDuration) {
    return this.addNotification(message, 'error', duration);
  }

  getNotifications() {
    return this.notifications.value;
  }

  setMaxNotifications(max) {
    this.maxNotifications = max;
  }

  setDefaultDuration(duration) {
    this.defaultDuration = duration;
  }

  // System alerts that require user action
  showAlert(title, message, type = 'info', options = {}) {
    return new Promise((resolve) => {
      const alert = {
        id: Date.now(),
        title,
        message,
        type,
        options,
        resolve
      };

      // In a real implementation, this would show a modal or alert dialog
      console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
      
      // For now, we'll just resolve immediately
      resolve(true);
    });
  }

  // Low battery warning
  showLowBatteryWarning(level) {
    return this.showAlert(
      'Low Battery Warning',
      `Battery level is at ${level}%. Please connect to power source.`,
      'warning',
      { persistent: true }
    );
  }

  // Offline mode notification
  showOfflineModeNotification() {
    return this.showAlert(
      'Offline Mode',
      'You are now working offline. Changes will be synced when connection is restored.',
      'info',
      { persistent: false }
    );
  }

  // Sync status notification
  showSyncStatus(success, count = 0) {
    if (success) {
      this.success(`Successfully synced ${count} items`);
    } else {
      this.error('Failed to sync data. Please check your connection.');
    }
  }

  // Voice recognition status
  showVoiceRecognitionStatus(enabled) {
    this.info(`Voice recognition ${enabled ? 'enabled' : 'disabled'}`);
  }
}

export const notificationService = new NotificationService(); 
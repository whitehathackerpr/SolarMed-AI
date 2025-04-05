import { ref } from 'vue';

class ModalService {
  constructor() {
    this.isOpen = ref(false);
    this.title = ref('');
    this.message = ref('');
    this.type = ref('info');
    this.actions = ref([]);
    this.onClose = ref(null);
  }

  showModal({ title, message, type = 'info', actions = [], onClose = null }) {
    this.title.value = title;
    this.message.value = message;
    this.type.value = type;
    this.actions.value = actions;
    this.onClose.value = onClose;
    this.isOpen.value = true;
  }

  closeModal() {
    if (this.onClose.value) {
      this.onClose.value();
    }
    this.resetModal();
  }

  resetModal() {
    this.isOpen.value = false;
    this.title.value = '';
    this.message.value = '';
    this.type.value = 'info';
    this.actions.value = [];
    this.onClose.value = null;
  }

  confirm({ title, message, onConfirm, onCancel = null }) {
    this.showModal({
      title,
      message,
      type: 'confirm',
      actions: [
        {
          label: 'Cancel',
          type: 'secondary',
          action: () => {
            if (onCancel) onCancel();
            this.closeModal();
          }
        },
        {
          label: 'Confirm',
          type: 'primary',
          action: () => {
            if (onConfirm) onConfirm();
            this.closeModal();
          }
        }
      ]
    });
  }

  alert({ title, message, type = 'info', onClose = null }) {
    this.showModal({
      title,
      message,
      type,
      actions: [
        {
          label: 'OK',
          type: 'primary',
          action: () => this.closeModal()
        }
      ],
      onClose
    });
  }

  error({ title, message, onClose = null }) {
    this.alert({
      title: title || 'Error',
      message,
      type: 'error',
      onClose
    });
  }

  warning({ title, message, onClose = null }) {
    this.alert({
      title: title || 'Warning',
      message,
      type: 'warning',
      onClose
    });
  }

  success({ title, message, onClose = null }) {
    this.alert({
      title: title || 'Success',
      message,
      type: 'success',
      onClose
    });
  }

  getModalState() {
    return {
      isOpen: this.isOpen.value,
      title: this.title.value,
      message: this.message.value,
      type: this.type.value,
      actions: this.actions.value
    };
  }
}

export const modalService = new ModalService(); 
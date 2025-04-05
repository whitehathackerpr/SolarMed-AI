import axios from 'axios';
import { offlineStorage } from './offlineStorage';
import { notificationService } from './notificationService';

const API_URL = import.meta.env.VITE_API_URL;

class PhotoUploadService {
  constructor() {
    this.isCapturing = ref(false);
    this.currentPhoto = ref(null);
    this.uploadProgress = ref(0);
    this.uploadError = ref(null);
  }

  async capturePhoto() {
    try {
      this.isCapturing.value = true;
      notificationService.info('Preparing camera...');

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      this.currentPhoto.value = photoData;

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      notificationService.success('Photo captured successfully');
      return photoData;
    } catch (error) {
      console.error('Error capturing photo:', error);
      notificationService.error('Failed to capture photo');
      throw error;
    } finally {
      this.isCapturing.value = false;
    }
  }

  async uploadPhoto(patientId, photoData, metadata = {}) {
    try {
      if (!photoData) {
        throw new Error('No photo data to upload');
      }

      this.uploadProgress.value = 0;
      this.uploadError.value = null;

      // Create photo object
      const photo = {
        id: this.generatePhotoId(patientId),
        patientId,
        data: photoData,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          size: this.getPhotoSize(photoData)
        },
        synced: false
      };

      // Store locally first
      await offlineStorage.addPhoto(photo);

      // Try to upload if online
      if (navigator.onLine) {
        await this.syncPhoto(photo);
      } else {
        notificationService.warning('Photo will be uploaded when online');
      }

      return photo;
    } catch (error) {
      console.error('Error uploading photo:', error);
      this.uploadError.value = error.message;
      notificationService.error('Failed to upload photo');
      throw error;
    }
  }

  async syncPhoto(photo) {
    try {
      if (photo.synced) return;

      const formData = new FormData();
      formData.append('photo', this.dataURLtoFile(photo.data, `photo-${photo.id}.jpg`));
      formData.append('metadata', JSON.stringify(photo.metadata));
      formData.append('patientId', photo.patientId);

      const response = await axios.post(`${API_URL}/photos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          this.uploadProgress.value = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
        }
      });

      // Update photo with server response
      const updatedPhoto = {
        ...photo,
        ...response.data,
        synced: true
      };

      await offlineStorage.updatePhoto(photo.id, updatedPhoto);
      notificationService.success('Photo uploaded successfully');
      return updatedPhoto;
    } catch (error) {
      console.error('Error syncing photo:', error);
      throw error;
    }
  }

  async getPhotos(patientId) {
    try {
      // Get from local storage first
      const localPhotos = await offlineStorage.getPhotos(patientId);

      // If online, try to sync with server
      if (navigator.onLine) {
        const response = await axios.get(`${API_URL}/photos?patientId=${patientId}`);
        const serverPhotos = response.data;

        // Merge and deduplicate photos
        const mergedPhotos = this.mergePhotos(localPhotos, serverPhotos);
        await offlineStorage.setPhotos(patientId, mergedPhotos);
        return mergedPhotos;
      }

      return localPhotos;
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
  }

  async deletePhoto(photoId) {
    try {
      // Delete locally first
      await offlineStorage.deletePhoto(photoId);

      // Try to delete from server if online
      if (navigator.onLine) {
        await axios.delete(`${API_URL}/photos/${photoId}`);
      }

      notificationService.success('Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
      notificationService.error('Failed to delete photo');
      throw error;
    }
  }

  mergePhotos(localPhotos, serverPhotos) {
    const merged = [...localPhotos];
    const localIds = new Set(localPhotos.map(p => p.id));

    serverPhotos.forEach(photo => {
      if (!localIds.has(photo.id)) {
        merged.push(photo);
      }
    });

    return merged.sort((a, b) => 
      new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp)
    );
  }

  generatePhotoId(patientId) {
    const timestamp = Date.now().toString(36);
    const patientHash = this.hashString(patientId);
    return `PH-${timestamp}-${patientHash}`;
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 4);
  }

  getPhotoSize(dataUrl) {
    // Calculate size in bytes
    const base64String = dataUrl.split(',')[1];
    const padding = base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0;
    return Math.ceil((base64String.length * 3) / 4) - padding;
  }

  dataURLtoFile(dataUrl, filename) {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  getCaptureStatus() {
    return this.isCapturing.value;
  }

  getCurrentPhoto() {
    return this.currentPhoto.value;
  }

  getUploadProgress() {
    return this.uploadProgress.value;
  }

  getUploadError() {
    return this.uploadError.value;
  }
}

export const photoUploadService = new PhotoUploadService(); 
import { notificationService } from './notificationService';
import { offlineStorage } from './offlineStorage';

class VoiceToTextService {
  constructor() {
    this.recognition = null;
    this.isListening = ref(false);
    this.transcript = ref('');
    this.isSupported = ref(false);
    this.recognitionError = ref(null);
    this.initializeRecognition();
  }

  initializeRecognition() {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onstart = () => {
          this.isListening.value = true;
          notificationService.info('Voice recognition started');
        };
        
        this.recognition.onend = () => {
          this.isListening.value = false;
          notificationService.info('Voice recognition stopped');
        };
        
        this.recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          this.transcript.value = finalTranscript + interimTranscript;
        };
        
        this.recognition.onerror = (event) => {
          this.recognitionError.value = event.error;
          notificationService.error(`Voice recognition error: ${event.error}`);
        };
        
        this.isSupported.value = true;
      } else {
        this.isSupported.value = false;
        notificationService.warning('Speech recognition is not supported in this browser');
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      this.isSupported.value = false;
      notificationService.error('Failed to initialize speech recognition');
    }
  }

  async startListening() {
    try {
      if (!this.isSupported.value) {
        throw new Error('Speech recognition is not supported');
      }
      
      if (this.isListening.value) {
        this.stopListening();
      }
      
      this.transcript.value = '';
      this.recognitionError.value = null;
      this.recognition.start();
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      notificationService.error('Failed to start voice recognition');
      throw error;
    }
  }

  stopListening() {
    try {
      if (this.recognition && this.isListening.value) {
        this.recognition.stop();
      }
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      notificationService.error('Failed to stop voice recognition');
      throw error;
    }
  }

  async saveTranscript(patientId) {
    try {
      if (!this.transcript.value) {
        throw new Error('No transcript to save');
      }
      
      const transcriptData = {
        id: this.generateTranscriptId(patientId),
        patientId,
        transcript: this.transcript.value,
        timestamp: new Date().toISOString(),
        synced: false
      };
      
      // Store locally
      await offlineStorage.addTranscript(transcriptData);
      
      // Clear current transcript
      this.transcript.value = '';
      
      notificationService.success('Transcript saved successfully');
      return transcriptData;
    } catch (error) {
      console.error('Error saving transcript:', error);
      notificationService.error('Failed to save transcript');
      throw error;
    }
  }

  async getTranscripts(patientId) {
    try {
      return await offlineStorage.getTranscripts(patientId);
    } catch (error) {
      console.error('Error fetching transcripts:', error);
      throw error;
    }
  }

  async deleteTranscript(transcriptId) {
    try {
      await offlineStorage.deleteTranscript(transcriptId);
      notificationService.success('Transcript deleted successfully');
    } catch (error) {
      console.error('Error deleting transcript:', error);
      notificationService.error('Failed to delete transcript');
      throw error;
    }
  }

  generateTranscriptId(patientId) {
    const timestamp = Date.now().toString(36);
    const patientHash = this.hashString(patientId);
    return `TX-${timestamp}-${patientHash}`;
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

  getListeningStatus() {
    return this.isListening.value;
  }

  getCurrentTranscript() {
    return this.transcript.value;
  }

  getSupportStatus() {
    return this.isSupported.value;
  }

  getError() {
    return this.recognitionError.value;
  }
}

export const voiceToTextService = new VoiceToTextService(); 
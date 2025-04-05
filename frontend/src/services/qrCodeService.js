import QRCode from 'qrcode';
import { patientService } from './patientService';
import { notificationService } from './notificationService';

class QRCodeService {
  constructor() {
    this.qrCodeData = ref(null);
    this.qrCodeImage = ref(null);
    this.isGenerating = ref(false);
  }

  async generateQRCode(patientId) {
    try {
      this.isGenerating.value = true;
      notificationService.info('Generating QR code...');

      // Get patient data
      const patient = await patientService.getPatient(patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      // Create QR code data
      const qrData = {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        timestamp: new Date().toISOString()
      };

      // Generate QR code image
      const qrImage = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      this.qrCodeData.value = qrData;
      this.qrCodeImage.value = qrImage;

      notificationService.success('QR code generated successfully');
      return qrImage;
    } catch (error) {
      console.error('Error generating QR code:', error);
      notificationService.error('Failed to generate QR code');
      throw error;
    } finally {
      this.isGenerating.value = false;
    }
  }

  async scanQRCode(imageData) {
    try {
      this.isGenerating.value = true;
      notificationService.info('Scanning QR code...');

      // Decode QR code
      const qrData = await QRCode.toDataURL(imageData);
      const decodedData = JSON.parse(qrData);

      // Verify data
      if (!decodedData.id || !decodedData.firstName || !decodedData.lastName) {
        throw new Error('Invalid QR code data');
      }

      // Get patient
      const patient = await patientService.getPatient(decodedData.id);
      if (!patient) {
        throw new Error('Patient not found');
      }

      // Verify patient data
      if (
        patient.firstName !== decodedData.firstName ||
        patient.lastName !== decodedData.lastName ||
        patient.dateOfBirth !== decodedData.dateOfBirth
      ) {
        throw new Error('Patient data mismatch');
      }

      notificationService.success('QR code scanned successfully');
      return patient;
    } catch (error) {
      console.error('Error scanning QR code:', error);
      notificationService.error('Failed to scan QR code');
      throw error;
    } finally {
      this.isGenerating.value = false;
    }
  }

  async printQRCode(patientId) {
    try {
      this.isGenerating.value = true;
      notificationService.info('Preparing QR code for printing...');

      // Generate QR code if not already generated
      if (!this.qrCodeImage.value || this.qrCodeData.value?.id !== patientId) {
        await this.generateQRCode(patientId);
      }

      // Create print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Pop-up blocked. Please allow pop-ups to print.');
      }

      // Create print content
      const patient = await patientService.getPatient(patientId);
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Patient QR Code</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
              }
              .patient-info {
                margin: 20px 0;
              }
              .qr-code {
                margin: 20px auto;
                max-width: 300px;
              }
              @media print {
                body {
                  padding: 0;
                }
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <h1>Patient QR Code</h1>
            <div class="patient-info">
              <p><strong>Name:</strong> ${patient.firstName} ${patient.lastName}</p>
              <p><strong>ID:</strong> ${patient.id}</p>
              <p><strong>Date of Birth:</strong> ${patient.dateOfBirth}</p>
            </div>
            <div class="qr-code">
              <img src="${this.qrCodeImage.value}" alt="Patient QR Code">
            </div>
            <div class="no-print">
              <button onclick="window.print()">Print</button>
              <button onclick="window.close()">Close</button>
            </div>
          </body>
        </html>
      `;

      // Write content and print
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();

      notificationService.success('QR code ready for printing');
    } catch (error) {
      console.error('Error printing QR code:', error);
      notificationService.error('Failed to print QR code');
      throw error;
    } finally {
      this.isGenerating.value = false;
    }
  }

  getQRCodeData() {
    return this.qrCodeData.value;
  }

  getQRCodeImage() {
    return this.qrCodeImage.value;
  }

  getGeneratingStatus() {
    return this.isGenerating.value;
  }
}

export const qrCodeService = new QRCodeService(); 
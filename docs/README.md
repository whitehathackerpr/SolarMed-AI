# SolarMed AI Documentation

## Overview

SolarMed AI is a solar-powered, AI-enabled offline diagnostic system designed for remote Ugandan health centers. The application allows health workers to input symptoms, upload images, or use voice-to-text to run diagnostic predictions using pre-trained AI models for conditions like malaria, COVID-19, and maternal health issues.

The system is designed to function offline on Raspberry Pi or Jetson Nano devices and sync data to the cloud when online connectivity is available.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Application Structure](#application-structure)
4. [Features](#features)
5. [User Guide](#user-guide)
6. [Offline Functionality](#offline-functionality)
7. [Deployment](#deployment)
8. [API Documentation](#api-documentation)
9. [Troubleshooting](#troubleshooting)

## System Requirements

### Hardware Requirements
- Raspberry Pi 4 (2GB RAM minimum, 4GB recommended) or Jetson Nano
- Solar power system with battery backup
- 32GB microSD card (minimum)
- Touch screen display (7" minimum recommended)
- Camera module (optional, for image-based diagnosis)
- Microphone (optional, for voice input)

### Software Requirements
- Raspberry Pi OS (64-bit) or Ubuntu 20.04+ for Jetson Nano
- Docker and Docker Compose
- Node.js 16+ (included in Docker setup)
- Python 3.10+ (included in Docker setup)

## Installation

### Using the Setup Script (Recommended)

1. Clone the repository to your Raspberry Pi:
   ```bash
   git clone https://github.com/your-organization/solarmed-ai.git
   cd solarmed-ai
   ```

2. Run the setup script:
   ```bash
   chmod +x setup_raspberry_pi.sh
   ./setup_raspberry_pi.sh
   ```

3. The script will install all dependencies, set up the environment, and start the application.

### Manual Installation

1. Install Docker and Docker Compose:
   ```bash
   curl -sSL https://get.docker.com | sh
   sudo apt-get install -y libffi-dev libssl-dev
   sudo apt-get install -y python3 python3-pip
   sudo pip3 install docker-compose
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/solarmed-ai.git
   cd solarmed-ai
   ```

3. Create environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. Build and start the application:
   ```bash
   docker-compose up -d
   ```

5. The application will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Application Structure

The application consists of two main components:

### Frontend (Vue.js + Vite + Tailwind CSS)
- Modern, responsive UI optimized for tablets
- Offline-first architecture using IndexedDB for local storage
- Pages: Dashboard, Patient Intake Form, Diagnosis Result, Energy Monitor, Settings

### Backend (FastAPI)
- RESTful API with OpenAPI/Swagger documentation
- SQLite database for local storage
- JWT-based authentication
- Endpoints for diagnosis, patient management, data synchronization, and energy monitoring

## Features

### Patient Management
- Create and manage patient records
- Store basic medical history locally
- Optional QR code identification for returning patients

### Diagnosis
- Input symptoms via text, dropdown selections, or voice
- Upload images for visual diagnosis
- AI-powered diagnosis prediction for common conditions:
  - Malaria
  - COVID-19
  - Pneumonia
  - Tuberculosis
  - Maternal health complications
  - And more

### Offline Functionality
- Complete offline operation capability
- Local data storage with IndexedDB
- Automatic synchronization when online
- Offline diagnosis using pre-trained models

### Energy Monitoring
- Track solar power input
- Monitor battery levels
- Optimize power usage
- Low power mode for extended operation

## User Guide

### Dashboard
The Dashboard provides an overview of the system status and recent patients:
- System status (online/offline, battery level, solar input)
- Quick actions for new patient intake and energy monitoring
- List of recent patients with options to view details or create new diagnoses

### Patient Intake
The Patient Intake form allows you to:
- Create new patient records
- Select existing patients
- Input symptoms via text
- Upload images for diagnosis
- Use voice input for symptom description

### Diagnosis Results
The Diagnosis Results page shows:
- Patient information
- Diagnosis prediction with confidence level
- Treatment recommendations
- Option to print the diagnosis report

### Energy Monitor
The Energy Monitor page displays:
- Current battery level
- Solar power input
- Power consumption
- Historical energy data
- Estimated runtime

### Settings
The Settings page allows configuration of:
- Offline mode settings
- Power management options
- Language preferences
- AI model settings

## Offline Functionality

SolarMed AI is designed to work completely offline, which is essential for remote healthcare settings in Uganda. Key offline features include:

### Local Data Storage
- Patient records stored in IndexedDB
- Diagnosis history saved locally
- Energy logs maintained offline

### Sync Mechanism
- Automatic synchronization when online
- Manual sync option
- Sync status indicator

### Offline Diagnosis
- Pre-trained models for offline diagnosis
- Symptom-based matching when AI models unavailable
- Confidence scoring for diagnosis reliability

## Deployment

### Docker Deployment
The application is containerized using Docker, making it easy to deploy on various hardware:

1. Ensure Docker and Docker Compose are installed
2. Configure environment variables in `.env` files
3. Run `docker-compose up -d` to start the application

### Raspberry Pi Deployment
For deployment on Raspberry Pi:

1. Use the provided setup script: `./setup_raspberry_pi.sh`
2. The script handles all dependencies and configuration
3. The application will start automatically

### Production Considerations
For production deployment:
- Update the JWT secret key in backend/.env
- Restrict CORS origins to your specific domain
- Consider setting up a reverse proxy for HTTPS
- Implement regular backups of the SQLite database

## API Documentation

The API documentation is available at http://localhost:8000/docs when the application is running. Key endpoints include:

### Authentication
- POST `/auth/token` - Get access token

### Patients
- GET `/api/patients` - List all patients
- GET `/api/patients/{id}` - Get patient details
- POST `/api/patients` - Create new patient
- PUT `/api/patients/{id}` - Update patient
- DELETE `/api/patients/{id}` - Delete patient

### Diagnosis
- GET `/api/diagnose` - List all diagnoses
- GET `/api/diagnose/{id}` - Get diagnosis details
- POST `/api/diagnose` - Create new diagnosis
- GET `/api/diagnose/patient/{patient_id}` - Get patient diagnoses

### Energy
- GET `/api/energy` - List energy logs
- GET `/api/energy/latest` - Get latest energy status
- POST `/api/energy` - Create energy log
- GET `/api/energy/simulate` - Simulate energy reading
- GET `/api/energy/stats` - Get energy statistics

### Sync
- POST `/api/sync` - Sync data to cloud
- GET `/api/sync/status` - Get sync status
- POST `/api/sync/pull` - Pull data from cloud

## Troubleshooting

### Common Issues

#### Application Won't Start
- Check Docker is running: `sudo systemctl status docker`
- Verify ports 5173 and 8000 are available: `netstat -tuln`
- Check logs: `docker-compose logs`

#### Offline Mode Issues
- Clear browser cache and IndexedDB storage
- Check browser compatibility (latest Chrome/Firefox recommended)
- Verify permissions for IndexedDB

#### Energy Monitoring Problems
- Ensure proper connection to solar system sensors
- Check battery connections
- Verify power management settings

#### Sync Failures
- Confirm internet connection is stable
- Check API endpoint configuration
- Verify credentials and authentication

### Support

For additional support, contact:
- Email: support@solarmed.org
- Documentation: https://docs.solarmed.org

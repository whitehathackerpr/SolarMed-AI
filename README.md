# SolarMed AI

SolarMed AI is an offline-first rural healthcare diagnosis system designed specifically for deployment in Ugandan health clinics. The system provides reliable medical diagnosis capabilities even in areas with limited or intermittent internet connectivity.

## Features

- **Offline-First Architecture**: Works seamlessly without internet connection
- **Patient Management**: Comprehensive patient intake and record-keeping
- **AI-Powered Diagnosis**: Advanced diagnostic capabilities with offline AI models
- **Energy Monitoring**: Real-time monitoring of solar power system
- **Data Synchronization**: Automatic background sync when connectivity is available
- **Voice-to-Text**: Hands-free data entry through voice commands
- **Photo Upload**: Capture and store medical images
- **QR Code Integration**: Quick patient identification and record retrieval
- **Progressive Web App**: Installable on mobile devices for easy access

## Technology Stack

### Frontend
- Vue 3 with Composition API
- Vite for build tooling
- Tailwind CSS for styling
- IndexedDB for offline storage
- Service Workers for offline functionality
- PWA capabilities

### Backend
- FastAPI for REST API
- SQLite for data storage
- JWT for authentication
- OpenAPI/Swagger documentation
- AI model integration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/whitehathackerpr/solarmed-ai.git
cd solarmed-ai
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Development

1. Start the frontend development server:
```bash
cd frontend
npm run dev
```

2. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

### Production Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the backend in production mode:
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

For detailed deployment instructions, see [DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Documentation

- [API Documentation](docs/API.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Offline Functionality](docs/OFFLINE.md)
- [User Guide](docs/USER_GUIDE.md)
- [Development Guide](docs/DEVELOPMENT.md)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Ministry of Health, Uganda
- Local healthcare providers
- Open-source community contributors
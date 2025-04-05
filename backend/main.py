from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import jwt
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="SolarMed AI API",
    description="API for SolarMed AI healthcare application",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database models
class Patient(BaseModel):
    id: Optional[int] = None
    first_name: str
    last_name: str
    date_of_birth: str
    gender: str
    phone_number: str
    address: str
    village: str
    district: str
    qr_code: Optional[str] = None

class Diagnosis(BaseModel):
    id: Optional[int] = None
    patient_id: int
    diagnosis_type: str
    symptoms: str
    image_path: Optional[str] = None
    voice_text: Optional[str] = None
    prediction: str
    confidence: float
    treatment: str
    created_at: Optional[datetime] = None

class EnergyData(BaseModel):
    id: Optional[int] = None
    solar_power: float
    battery_level: float
    power_usage: float
    timestamp: datetime

# Authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Health check endpoints
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.get("/health/db")
async def db_health_check():
    # TODO: Implement database connection check
    return {"status": "healthy", "database": "connected"}

@app.get("/health/sync")
async def sync_health_check():
    # TODO: Implement sync status check
    return {"status": "healthy", "sync": "active"}

# API Endpoints
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # TODO: Implement proper user authentication
    if form_data.username != "admin" or form_data.password != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/patients/", response_model=Patient)
async def create_patient(patient: Patient):
    # TODO: Implement database storage
    return patient

@app.get("/patients/", response_model=List[Patient])
async def get_patients():
    # TODO: Implement database retrieval
    return []

@app.get("/patients/{patient_id}", response_model=Patient)
async def get_patient(patient_id: int):
    # TODO: Implement database retrieval
    return Patient(
        id=patient_id,
        first_name="John",
        last_name="Doe",
        date_of_birth="1990-01-01",
        gender="Male",
        phone_number="1234567890",
        address="123 Main St",
        village="Sample Village",
        district="Sample District"
    )

@app.post("/diagnose/", response_model=Diagnosis)
async def create_diagnosis(diagnosis: Diagnosis):
    # TODO: Implement AI model integration
    return diagnosis

@app.get("/diagnoses/", response_model=List[Diagnosis])
async def get_diagnoses():
    # TODO: Implement database retrieval
    return []

@app.get("/energy/", response_model=EnergyData)
async def get_energy_data():
    # TODO: Implement real energy monitoring
    return EnergyData(
        solar_power=75.0,
        battery_level=65.0,
        power_usage=45.0,
        timestamp=datetime.utcnow()
    )

@app.post("/sync/")
async def sync_data(data: dict):
    # TODO: Implement offline data synchronization
    return {"status": "success", "message": "Data synchronized successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import json
import random
from datetime import datetime

from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(
    prefix="/api/diagnose",
    tags=["diagnose"],
    responses={404: {"description": "Not found"}},
)

# Simulated AI model predictions
DIAGNOSES = {
    "malaria": ["fever", "chills", "headache", "nausea", "body aches"],
    "pneumonia": ["cough", "fever", "difficulty breathing", "chest pain"],
    "covid19": ["fever", "cough", "fatigue", "loss of taste", "loss of smell"],
    "tuberculosis": ["cough", "weight loss", "night sweats", "fever"],
    "maternal_complication": ["abdominal pain", "bleeding", "swelling", "headache"],
    "diabetes": ["frequent urination", "increased thirst", "fatigue", "blurred vision"],
    "hypertension": ["headache", "shortness of breath", "chest pain", "dizziness"]
}

@router.post("/", response_model=schemas.Diagnosis)
async def create_diagnosis(
    patient_id: int = Form(...),
    symptoms: str = Form(...),
    image: Optional[UploadFile] = File(None),
    voice: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Check if patient exists
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Simulate AI model prediction
    symptoms_list = [s.strip().lower() for s in symptoms.split(',')]
    
    # Simple matching algorithm for demonstration
    matches = {}
    for disease, disease_symptoms in DIAGNOSES.items():
        match_count = sum(1 for s in symptoms_list if s in disease_symptoms)
        if match_count > 0:
            matches[disease] = match_count / len(disease_symptoms)
    
    # If no matches, return generic response
    if not matches:
        diagnosis = "Unknown condition"
        confidence = 0.3
    else:
        # Get the diagnosis with highest confidence
        diagnosis = max(matches, key=matches.get)
        confidence = matches[diagnosis] * 0.7 + random.random() * 0.3  # Add some randomness
    
    # Save files if provided
    image_path = None
    voice_path = None
    
    if image:
        # Create directory if it doesn't exist
        os.makedirs("uploads/images", exist_ok=True)
        image_path = f"uploads/images/{patient_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.jpg"
        with open(image_path, "wb") as f:
            f.write(await image.read())
    
    if voice:
        # Create directory if it doesn't exist
        os.makedirs("uploads/voice", exist_ok=True)
        voice_path = f"uploads/voice/{patient_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.mp3"
        with open(voice_path, "wb") as f:
            f.write(await voice.read())
    
    # Create diagnosis record
    db_diagnosis = models.Diagnosis(
        patient_id=patient_id,
        symptoms=symptoms,
        diagnosis=diagnosis,
        confidence=confidence,
        image_path=image_path,
        voice_path=voice_path,
        synced=False
    )
    
    db.add(db_diagnosis)
    db.commit()
    db.refresh(db_diagnosis)
    
    return db_diagnosis

@router.get("/", response_model=List[schemas.Diagnosis])
def read_diagnoses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    diagnoses = db.query(models.Diagnosis).offset(skip).limit(limit).all()
    return diagnoses

@router.get("/{diagnosis_id}", response_model=schemas.Diagnosis)
def read_diagnosis(diagnosis_id: int, db: Session = Depends(get_db)):
    db_diagnosis = db.query(models.Diagnosis).filter(models.Diagnosis.id == diagnosis_id).first()
    if db_diagnosis is None:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    return db_diagnosis

@router.get("/patient/{patient_id}", response_model=List[schemas.Diagnosis])
def read_patient_diagnoses(patient_id: int, db: Session = Depends(get_db)):
    diagnoses = db.query(models.Diagnosis).filter(models.Diagnosis.patient_id == patient_id).all()
    return diagnoses

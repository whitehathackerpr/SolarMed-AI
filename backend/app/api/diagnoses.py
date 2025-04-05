from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
from ..db.database import get_db
from ..models.diagnosis import Diagnosis, DiagnosisCreate, DiagnosisUpdate
from ..db.models import Diagnosis as DiagnosisModel
from ..core.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=Diagnosis)
def create_diagnosis(diagnosis: DiagnosisCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_diagnosis = DiagnosisModel(**diagnosis.dict())
    db.add(db_diagnosis)
    db.commit()
    db.refresh(db_diagnosis)
    return db_diagnosis

@router.get("/", response_model=List[Diagnosis])
def read_diagnoses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    diagnoses = db.query(DiagnosisModel).offset(skip).limit(limit).all()
    return diagnoses

@router.get("/{diagnosis_id}", response_model=Diagnosis)
def read_diagnosis(diagnosis_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    diagnosis = db.query(DiagnosisModel).filter(DiagnosisModel.id == diagnosis_id).first()
    if diagnosis is None:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    return diagnosis

@router.put("/{diagnosis_id}", response_model=Diagnosis)
def update_diagnosis(diagnosis_id: int, diagnosis: DiagnosisUpdate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_diagnosis = db.query(DiagnosisModel).filter(DiagnosisModel.id == diagnosis_id).first()
    if db_diagnosis is None:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    
    for key, value in diagnosis.dict(exclude_unset=True).items():
        setattr(db_diagnosis, key, value)
    
    db.commit()
    db.refresh(db_diagnosis)
    return db_diagnosis

@router.post("/upload/image/{diagnosis_id}")
async def upload_image(diagnosis_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    diagnosis = db.query(DiagnosisModel).filter(DiagnosisModel.id == diagnosis_id).first()
    if diagnosis is None:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads/images", exist_ok=True)
    
    # Save the file
    file_path = f"uploads/images/{diagnosis_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    diagnosis.image_path = file_path
    db.commit()
    return {"filename": file.filename}

@router.post("/upload/voice/{diagnosis_id}")
async def upload_voice(diagnosis_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    diagnosis = db.query(DiagnosisModel).filter(DiagnosisModel.id == diagnosis_id).first()
    if diagnosis is None:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads/voice", exist_ok=True)
    
    # Save the file
    file_path = f"uploads/voice/{diagnosis_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    diagnosis.voice_path = file_path
    db.commit()
    return {"filename": file.filename} 
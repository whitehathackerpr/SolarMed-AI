from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class DiagnosisStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    ERROR = "error"

class DiagnosisType(str, Enum):
    MALARIA = "malaria"
    COVID = "covid"
    MATERNAL = "maternal"
    GENERAL = "general"

class DiagnosisBase(BaseModel):
    patient_id: int
    diagnosis_type: DiagnosisType
    symptoms: List[str]
    notes: Optional[str] = None
    image_path: Optional[str] = None
    voice_path: Optional[str] = None

class DiagnosisCreate(DiagnosisBase):
    pass

class Diagnosis(DiagnosisBase):
    id: int
    status: DiagnosisStatus
    prediction: Optional[dict] = None
    confidence: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    is_synced: bool = False

    class Config:
        orm_mode = True

class DiagnosisUpdate(BaseModel):
    status: Optional[DiagnosisStatus] = None
    prediction: Optional[dict] = None
    confidence: Optional[float] = None
    notes: Optional[str] = None 
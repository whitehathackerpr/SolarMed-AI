from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    location: str
    contact: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class Patient(PatientBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DiagnosisBase(BaseModel):
    patient_id: int
    symptoms: str
    diagnosis: Optional[str] = None
    confidence: Optional[float] = None
    image_path: Optional[str] = None
    voice_path: Optional[str] = None


class DiagnosisCreate(DiagnosisBase):
    pass


class Diagnosis(DiagnosisBase):
    id: int
    created_at: datetime
    synced: bool

    class Config:
        from_attributes = True


class EnergyLogBase(BaseModel):
    battery_level: float
    solar_input: float
    power_consumption: float


class EnergyLogCreate(EnergyLogBase):
    pass


class EnergyLog(EnergyLogBase):
    id: int
    timestamp: datetime
    synced: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None

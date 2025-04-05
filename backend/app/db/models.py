from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    date_of_birth = Column(DateTime)
    gender = Column(String)
    phone_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
    village = Column(String)
    district = Column(String)
    qr_code = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_synced = Column(Boolean, default=False)

    diagnoses = relationship("Diagnosis", back_populates="patient")

class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    diagnosis_type = Column(String)
    symptoms = Column(JSON)
    notes = Column(String, nullable=True)
    image_path = Column(String, nullable=True)
    voice_path = Column(String, nullable=True)
    status = Column(String, default="pending")
    prediction = Column(JSON, nullable=True)
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_synced = Column(Boolean, default=False)

    patient = relationship("Patient", back_populates="diagnoses") 
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    location = Column(String)
    contact = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    diagnoses = relationship("Diagnosis", back_populates="patient")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    symptoms = Column(String)
    diagnosis = Column(String)
    confidence = Column(Float)
    image_path = Column(String, nullable=True)
    voice_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    synced = Column(Boolean, default=False)
    
    # Relationships
    patient = relationship("Patient", back_populates="diagnoses")


class EnergyLog(Base):
    __tablename__ = "energy_logs"

    id = Column(Integer, primary_key=True, index=True)
    battery_level = Column(Float)
    solar_input = Column(Float)
    power_consumption = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    synced = Column(Boolean, default=False)

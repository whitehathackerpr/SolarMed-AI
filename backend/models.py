from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    date_of_birth = Column(String)
    gender = Column(String)
    phone_number = Column(String)
    address = Column(String)
    village = Column(String)
    district = Column(String)
    qr_code = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    diagnoses = relationship("Diagnosis", back_populates="patient")

class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    diagnosis_type = Column(String)
    symptoms = Column(Text)
    image_path = Column(String, nullable=True)
    voice_text = Column(Text, nullable=True)
    prediction = Column(String)
    confidence = Column(Float)
    treatment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="diagnoses")

class EnergyData(Base):
    __tablename__ = "energy_data"

    id = Column(Integer, primary_key=True, index=True)
    solar_power = Column(Float)
    battery_level = Column(Float)
    power_usage = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow) 
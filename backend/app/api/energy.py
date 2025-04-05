from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import random
from datetime import datetime

from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(
    prefix="/api/energy",
    tags=["energy"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.EnergyLog)
def create_energy_log(energy_log: schemas.EnergyLogCreate, db: Session = Depends(get_db)):
    db_energy_log = models.EnergyLog(**energy_log.dict(), synced=False)
    db.add(db_energy_log)
    db.commit()
    db.refresh(db_energy_log)
    return db_energy_log

@router.get("/", response_model=List[schemas.EnergyLog])
def read_energy_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    energy_logs = db.query(models.EnergyLog).order_by(models.EnergyLog.timestamp.desc()).offset(skip).limit(limit).all()
    return energy_logs

@router.get("/latest", response_model=schemas.EnergyLog)
def read_latest_energy_log(db: Session = Depends(get_db)):
    db_energy_log = db.query(models.EnergyLog).order_by(models.EnergyLog.timestamp.desc()).first()
    if db_energy_log is None:
        # If no energy log exists, create a simulated one
        db_energy_log = models.EnergyLog(
            battery_level=random.uniform(50.0, 95.0),
            solar_input=random.uniform(0.0, 25.0),
            power_consumption=random.uniform(5.0, 15.0),
            timestamp=datetime.utcnow(),
            synced=False
        )
        db.add(db_energy_log)
        db.commit()
        db.refresh(db_energy_log)
    return db_energy_log

@router.get("/simulate", response_model=schemas.EnergyLog)
def simulate_energy_log(db: Session = Depends(get_db)):
    """Endpoint to simulate energy readings for testing purposes"""
    # Get current hour to simulate realistic solar input
    current_hour = datetime.utcnow().hour
    
    # Solar input is higher during daylight hours (8am-6pm)
    solar_input = random.uniform(15.0, 25.0) if 8 <= current_hour <= 18 else random.uniform(0.0, 5.0)
    
    # Battery level depends on solar input vs consumption
    # Get the latest battery level if available
    latest_log = db.query(models.EnergyLog).order_by(models.EnergyLog.timestamp.desc()).first()
    
    if latest_log:
        # Calculate new battery level based on solar input and consumption
        power_consumption = random.uniform(5.0, 15.0)
        net_power = solar_input - power_consumption
        
        # Battery level changes based on net power (charging or discharging)
        # Assume 1% change per 10W difference over 1 hour, scaled to 5 minutes
        battery_change = (net_power / 10) * (5 / 60)
        battery_level = max(0, min(100, latest_log.battery_level + battery_change))
    else:
        # If no previous log, generate a reasonable battery level
        battery_level = random.uniform(50.0, 95.0)
        power_consumption = random.uniform(5.0, 15.0)
    
    # Create and save the energy log
    db_energy_log = models.EnergyLog(
        battery_level=battery_level,
        solar_input=solar_input,
        power_consumption=power_consumption,
        timestamp=datetime.utcnow(),
        synced=False
    )
    db.add(db_energy_log)
    db.commit()
    db.refresh(db_energy_log)
    return db_energy_log

@router.get("/stats", response_model=Dict[str, Any])
def get_energy_stats(days: int = 1, db: Session = Depends(get_db)):
    """Get energy statistics for the specified number of days"""
    # In a real implementation, we would query the database for the specified time range
    # For simulation, we'll return mock data
    
    # Calculate average battery level, solar input, and power consumption
    logs = db.query(models.EnergyLog).order_by(models.EnergyLog.timestamp.desc()).limit(24 * days).all()
    
    if not logs:
        return {
            "average_battery": 75.0,
            "average_solar": 12.5,
            "average_consumption": 8.0,
            "net_power": 4.5,
            "estimated_runtime": "18 hours",
            "days_analyzed": days
        }
    
    avg_battery = sum(log.battery_level for log in logs) / len(logs)
    avg_solar = sum(log.solar_input for log in logs) / len(logs)
    avg_consumption = sum(log.power_consumption for log in logs) / len(logs)
    net_power = avg_solar - avg_consumption
    
    # Estimate runtime based on battery level and net power
    if net_power >= 0:
        estimated_runtime = "Indefinite (charging)"
    else:
        # Assume 100% battery = 100 watt-hours
        # If net power is negative, calculate how long until battery depletes
        hours_remaining = (avg_battery / 100) * 100 / abs(net_power)
        estimated_runtime = f"{hours_remaining:.1f} hours"
    
    return {
        "average_battery": avg_battery,
        "average_solar": avg_solar,
        "average_consumption": avg_consumption,
        "net_power": net_power,
        "estimated_runtime": estimated_runtime,
        "days_analyzed": days
    }

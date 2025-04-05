from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import patients, diagnoses
from .db.database import engine, Base
from .core.auth import router as auth_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SolarMed AI", description="Offline-first healthcare diagnosis system")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(patients.router, prefix="/patients", tags=["patients"])
app.include_router(diagnoses.router, prefix="/diagnoses", tags=["diagnoses"])

@app.get("/")
async def root():
    return {"message": "Welcome to SolarMed AI API"}

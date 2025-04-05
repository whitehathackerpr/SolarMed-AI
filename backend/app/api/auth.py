from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    responses={404: {"description": "Not found"}},
)

# Simulated user database
USERS = {
    "healthworker": {
        "username": "healthworker",
        "full_name": "Uganda Health Worker",
        "email": "health@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # "password"
        "disabled": False,
    }
}

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(username: str, password: str, db: Session = Depends(get_db)):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # In a real implementation, we would verify the password against the hashed password
    # For simulation, we'll just check if the user exists
    if username not in USERS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # In a real implementation, we would use the security module to create a token
    # For simulation, we'll just return a dummy token
    return {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJoZWFsdGh3b3JrZXIiLCJleHAiOjE3MTI0NTY3ODl9.8zNzKBXWi3xMsXPZUEJkLEfGQcdCJ9EYAbwH5bNOZ5A",
        "token_type": "bearer"
    }

@router.get("/users/me", response_model=Dict[str, Any])
async def read_users_me():
    """
    Get current user information
    """
    return {
        "username": "healthworker",
        "full_name": "Uganda Health Worker",
        "email": "health@example.com",
        "role": "health_worker"
    }

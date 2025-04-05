from fastapi import APIRouter, Depends, HTTPException
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache
from redis import asyncio as aioredis
import time
import psutil
import sqlite3
import os
from typing import Dict, Any

router = APIRouter()

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0"
    }

@router.get("/health/detailed")
async def detailed_health_check() -> Dict[str, Any]:
    """Detailed health check including system metrics"""
    try:
        # Check database connection
        db_path = os.getenv("DATABASE_URL", "sqlite:///./solarmed.db")
        if db_path.startswith("sqlite"):
            db_path = db_path.replace("sqlite:///", "")
            if not os.path.exists(db_path):
                raise HTTPException(status_code=500, detail="Database file not found")
            
            conn = sqlite3.connect(db_path)
            conn.close()

        # Get system metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')

        return {
            "status": "healthy",
            "timestamp": time.time(),
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "disk_percent": disk.percent,
                "memory_available": memory.available,
                "disk_free": disk.free
            },
            "services": {
                "database": "healthy",
                "cache": "healthy",
                "api": "healthy"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health/cache")
@cache(expire=60)
async def cache_health_check() -> Dict[str, Any]:
    """Check cache health with caching"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "cache": "working"
    }

async def init_cache():
    """Initialize cache backend"""
    redis = aioredis.from_url(
        "redis://localhost",
        encoding="utf8",
        decode_responses=True
    )
    FastAPICache.init(RedisBackend(redis))

# Cache configuration
CACHE_CONFIG = {
    "default": {
        "backend": "redis",
        "expire": 300,  # 5 minutes
        "prefix": "solarmed:"
    },
    "long_term": {
        "backend": "redis",
        "expire": 3600,  # 1 hour
        "prefix": "solarmed:long:"
    }
}

def get_cache_config(cache_type: str = "default") -> Dict[str, Any]:
    """Get cache configuration"""
    return CACHE_CONFIG.get(cache_type, CACHE_CONFIG["default"]) 
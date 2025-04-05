from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import time
import logging
from typing import Callable
import json
from functools import wraps

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 100, window: int = 60):
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.requests = {}

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = request.client.host
        current_time = time.time()

        # Clean up old entries
        self.requests = {
            ip: times for ip, times in self.requests.items()
            if current_time - times[-1] < self.window
        }

        if client_ip not in self.requests:
            self.requests[client_ip] = []

        # Check rate limit
        if len(self.requests[client_ip]) >= self.limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests"}
            )

        self.requests[client_ip].append(current_time)
        response = await call_next(request)
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time

        log_data = {
            "timestamp": datetime.now().isoformat(),
            "method": request.method,
            "url": str(request.url),
            "status_code": response.status_code,
            "process_time": process_time,
            "client_ip": request.client.host,
            "user_agent": request.headers.get("user-agent")
        }

        logger.info(json.dumps(log_data))
        return response

class RequestValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            # Validate content type
            content_type = request.headers.get("content-type", "")
            if request.method in ["POST", "PUT", "PATCH"]:
                if not content_type.startswith("application/json"):
                    return JSONResponse(
                        status_code=415,
                        content={"detail": "Unsupported media type"}
                    )

            # Validate request size
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Request entity too large"}
                )

            response = await call_next(request)
            return response

        except Exception as e:
            logger.error(f"Request validation error: {str(e)}")
            return JSONResponse(
                status_code=400,
                content={"detail": "Invalid request"}
            )

def validate_request(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Request validation error: {str(e)}")
            return JSONResponse(
                status_code=400,
                content={"detail": str(e)}
            )
    return wrapper 
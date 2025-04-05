# SolarMed AI API Documentation

## Overview

The SolarMed AI API provides a RESTful interface for managing patient data, diagnoses, and system settings. The API is built with FastAPI and includes OpenAPI/Swagger documentation.

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

## Patient Management

### Create Patient
```http
POST /api/patients
Content-Type: application/json

{
  "name": "string",
  "age": "integer",
  "gender": "string",
  "contact": "string",
  "medical_history": "string"
}
```

### Get Patient
```http
GET /api/patients/{patient_id}
```

### Update Patient
```http
PUT /api/patients/{patient_id}
Content-Type: application/json

{
  "name": "string",
  "age": "integer",
  "gender": "string",
  "contact": "string",
  "medical_history": "string"
}
```

### List Patients
```http
GET /api/patients
Query Parameters:
  - page: integer
  - limit: integer
  - search: string
```

## Diagnosis

### Create Diagnosis
```http
POST /api/diagnoses
Content-Type: application/json

{
  "patient_id": "string",
  "symptoms": ["string"],
  "observations": "string",
  "diagnosis": "string",
  "treatment": "string"
}
```

### Get Diagnosis
```http
GET /api/diagnoses/{diagnosis_id}
```

### Update Diagnosis
```http
PUT /api/diagnoses/{diagnosis_id}
Content-Type: application/json

{
  "symptoms": ["string"],
  "observations": "string",
  "diagnosis": "string",
  "treatment": "string"
}
```

### List Diagnoses
```http
GET /api/diagnoses
Query Parameters:
  - patient_id: string
  - page: integer
  - limit: integer
```

## Energy Monitoring

### Get Energy Status
```http
GET /api/energy/status
```

Response:
```json
{
  "battery_level": "float",
  "solar_power": "float",
  "power_consumption": "float",
  "estimated_runtime": "integer"
}
```

### Get Energy History
```http
GET /api/energy/history
Query Parameters:
  - start_date: string (ISO format)
  - end_date: string (ISO format)
  - interval: string (hourly/daily)
```

## Data Synchronization

### Sync Data
```http
POST /api/sync
Content-Type: application/json

{
  "patients": [
    {
      "id": "string",
      "action": "string",
      "data": "object"
    }
  ],
  "diagnoses": [
    {
      "id": "string",
      "action": "string",
      "data": "object"
    }
  ]
}
```

### Get Sync Status
```http
GET /api/sync/status
```

Response:
```json
{
  "last_sync": "string",
  "pending_changes": "integer",
  "sync_status": "string"
}
```

## Settings

### Get Settings
```http
GET /api/settings
```

### Update Settings
```http
PUT /api/settings
Content-Type: application/json

{
  "language": "string",
  "theme": "string",
  "notifications": "boolean",
  "sync_interval": "integer"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "string"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Versioning

The API is versioned through the URL path:
```
/api/v1/...
```

## OpenAPI Documentation

Interactive API documentation is available at:
```
/docs
```

## Offline Support

The API supports offline operations through:
- Background synchronization
- Conflict resolution
- Data versioning
- Cache management

For detailed information about offline functionality, see [OFFLINE.md](OFFLINE.md).

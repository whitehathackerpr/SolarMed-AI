# API Documentation

This document provides detailed information about the SolarMed AI API endpoints, request/response formats, and authentication.

## Base URL

The base URL for all API endpoints is: `http://localhost:8000`

## Authentication

SolarMed AI uses JWT (JSON Web Token) based authentication.

### Get Access Token

```
POST /auth/token
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

**Usage:**
Include the token in the Authorization header for protected endpoints:
```
Authorization: Bearer {access_token}
```

## Patients API

### List All Patients

```
GET /api/patients
```

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip
- `limit` (integer, optional): Maximum number of records to return

**Response:**
```json
[
  {
    "id": 1,
    "name": "string",
    "age": 0,
    "gender": "string",
    "location": "string",
    "contact": "string",
    "created_at": "2025-04-05T03:00:00.000Z",
    "updated_at": "2025-04-05T03:00:00.000Z"
  }
]
```

### Get Patient Details

```
GET /api/patients/{patient_id}
```

**Path Parameters:**
- `patient_id` (integer, required): ID of the patient

**Response:**
```json
{
  "id": 1,
  "name": "string",
  "age": 0,
  "gender": "string",
  "location": "string",
  "contact": "string",
  "created_at": "2025-04-05T03:00:00.000Z",
  "updated_at": "2025-04-05T03:00:00.000Z"
}
```

### Create New Patient

```
POST /api/patients
```

**Request Body:**
```json
{
  "name": "string",
  "age": 0,
  "gender": "string",
  "location": "string",
  "contact": "string"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "string",
  "age": 0,
  "gender": "string",
  "location": "string",
  "contact": "string",
  "created_at": "2025-04-05T03:00:00.000Z",
  "updated_at": "2025-04-05T03:00:00.000Z"
}
```

### Update Patient

```
PUT /api/patients/{patient_id}
```

**Path Parameters:**
- `patient_id` (integer, required): ID of the patient

**Request Body:**
```json
{
  "name": "string",
  "age": 0,
  "gender": "string",
  "location": "string",
  "contact": "string"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "string",
  "age": 0,
  "gender": "string",
  "location": "string",
  "contact": "string",
  "created_at": "2025-04-05T03:00:00.000Z",
  "updated_at": "2025-04-05T03:00:00.000Z"
}
```

### Delete Patient

```
DELETE /api/patients/{patient_id}
```

**Path Parameters:**
- `patient_id` (integer, required): ID of the patient

**Response:**
- Status: 204 No Content

### Get Patient Diagnoses

```
GET /api/patients/{patient_id}/diagnoses
```

**Path Parameters:**
- `patient_id` (integer, required): ID of the patient

**Response:**
```json
[
  {
    "id": 1,
    "patient_id": 1,
    "symptoms": "string",
    "diagnosis": "string",
    "confidence": 0.0,
    "image_path": "string",
    "voice_path": "string",
    "created_at": "2025-04-05T03:00:00.000Z",
    "synced": false
  }
]
```

## Diagnosis API

### List All Diagnoses

```
GET /api/diagnose
```

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip
- `limit` (integer, optional): Maximum number of records to return

**Response:**
```json
[
  {
    "id": 1,
    "patient_id": 1,
    "symptoms": "string",
    "diagnosis": "string",
    "confidence": 0.0,
    "image_path": "string",
    "voice_path": "string",
    "created_at": "2025-04-05T03:00:00.000Z",
    "synced": false
  }
]
```

### Get Diagnosis Details

```
GET /api/diagnose/{diagnosis_id}
```

**Path Parameters:**
- `diagnosis_id` (integer, required): ID of the diagnosis

**Response:**
```json
{
  "id": 1,
  "patient_id": 1,
  "symptoms": "string",
  "diagnosis": "string",
  "confidence": 0.0,
  "image_path": "string",
  "voice_path": "string",
  "created_at": "2025-04-05T03:00:00.000Z",
  "synced": false
}
```

### Create New Diagnosis

```
POST /api/diagnose
```

**Request Body (multipart/form-data):**
- `patient_id` (integer, required): ID of the patient
- `symptoms` (string, required): Comma-separated list of symptoms
- `image` (file, optional): Image file for diagnosis
- `voice` (file, optional): Voice recording file

**Response:**
```json
{
  "id": 1,
  "patient_id": 1,
  "symptoms": "string",
  "diagnosis": "string",
  "confidence": 0.0,
  "image_path": "string",
  "voice_path": "string",
  "created_at": "2025-04-05T03:00:00.000Z",
  "synced": false
}
```

### Get Patient Diagnoses

```
GET /api/diagnose/patient/{patient_id}
```

**Path Parameters:**
- `patient_id` (integer, required): ID of the patient

**Response:**
```json
[
  {
    "id": 1,
    "patient_id": 1,
    "symptoms": "string",
    "diagnosis": "string",
    "confidence": 0.0,
    "image_path": "string",
    "voice_path": "string",
    "created_at": "2025-04-05T03:00:00.000Z",
    "synced": false
  }
]
```

## Energy API

### List Energy Logs

```
GET /api/energy
```

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip
- `limit` (integer, optional): Maximum number of records to return

**Response:**
```json
[
  {
    "id": 1,
    "battery_level": 0.0,
    "solar_input": 0.0,
    "power_consumption": 0.0,
    "timestamp": "2025-04-05T03:00:00.000Z",
    "synced": false
  }
]
```

### Get Latest Energy Status

```
GET /api/energy/latest
```

**Response:**
```json
{
  "id": 1,
  "battery_level": 0.0,
  "solar_input": 0.0,
  "power_consumption": 0.0,
  "timestamp": "2025-04-05T03:00:00.000Z",
  "synced": false
}
```

### Create Energy Log

```
POST /api/energy
```

**Request Body:**
```json
{
  "battery_level": 0.0,
  "solar_input": 0.0,
  "power_consumption": 0.0
}
```

**Response:**
```json
{
  "id": 1,
  "battery_level": 0.0,
  "solar_input": 0.0,
  "power_consumption": 0.0,
  "timestamp": "2025-04-05T03:00:00.000Z",
  "synced": false
}
```

### Simulate Energy Reading

```
GET /api/energy/simulate
```

**Response:**
```json
{
  "id": 1,
  "battery_level": 0.0,
  "solar_input": 0.0,
  "power_consumption": 0.0,
  "timestamp": "2025-04-05T03:00:00.000Z",
  "synced": false
}
```

### Get Energy Statistics

```
GET /api/energy/stats
```

**Query Parameters:**
- `days` (integer, optional): Number of days to analyze, defaults to 1

**Response:**
```json
{
  "average_battery": 0.0,
  "average_solar": 0.0,
  "average_consumption": 0.0,
  "net_power": 0.0,
  "estimated_runtime": "string",
  "days_analyzed": 0
}
```

## Sync API

### Sync Data to Cloud

```
POST /api/sync
```

**Response:**
```json
{
  "success": true,
  "synced_diagnoses": 0,
  "synced_energy_logs": 0,
  "message": "string",
  "timestamp": "2025-04-05T03:00:00.000Z"
}
```

### Get Sync Status

```
GET /api/sync/status
```

**Response:**
```json
{
  "unsynced_diagnoses": 0,
  "unsynced_energy_logs": 0,
  "total_unsynced": 0,
  "last_sync": "2025-04-05T03:00:00.000Z"
}
```

### Pull Data from Cloud

```
POST /api/sync/pull
```

**Response:**
```json
{
  "success": true,
  "message": "string",
  "new_patients": 0,
  "new_diagnoses": 0,
  "timestamp": "2025-04-05T03:00:00.000Z"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
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

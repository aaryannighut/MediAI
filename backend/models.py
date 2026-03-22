from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    age: int
    gender: str

class UserLogin(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class SymptomAnalysisRequest(BaseModel):
    symptoms: List[str]
    age: int
    gender: str
    duration_days: int

class PredictionResult(BaseModel):
    disease: str
    probability: float

class DoctorRecommendation(BaseModel):
    specialty: str
    doctors: List[str]

class AnalysisResponse(BaseModel):
    predictions: List[PredictionResult]
    risk_level: str
    precautions: List[str]
    recommendations: DoctorRecommendation
    emergency: bool

class MedicineReminder(BaseModel):
    medicine_name: str
    dosage: str
    time: str

class HealthProfileCreate(BaseModel):
    name: str
    relation: str
    age: int
    gender: str
    blood_group: str
    medical_history: Optional[List[str]] = []

class AppointmentCreate(BaseModel):
    doctorName: str
    specialty: str
    hospital: str
    appointmentTime: str

class AppointmentUpdate(BaseModel):
    status: str

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime
from models import (UserCreate, UserLogin, Token, 
                    SymptomAnalysisRequest, AnalysisResponse,
                    PredictionResult, DoctorRecommendation, MedicineReminder,
                    HealthProfileCreate, ForgotPasswordRequest, ResetPasswordRequest,
                    AppointmentCreate, AppointmentUpdate)
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from database import users_collection, profiles_collection, history_collection, reminders_collection, appointments_collection
from ml_model import predict_symptoms

app = FastAPI(title="MediAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# --- AUTH ENDPOINTS ---

@app.post("/signup", response_model=Token)
def signup(user: UserCreate):
    print(f"Signup attempt for: {user.email}")
    if users_collection.find_one({"email": user.email}):
        print(f"Signup failed: Email {user.email} already registered")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = {
        "name": user.name,
        "email": user.email, 
        "password": hashed_password, 
        "age": user.age,
        "gender": user.gender,
        "created_at": datetime.utcnow()
    }
    users_collection.insert_one(new_user)
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
def login(user: UserLogin):
    print(f"Login attempt for: {user.email}")
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        print(f"Login failed: Invalid credentials for {user.email}")
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": db_user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    user = users_collection.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    # In a real app, send an email. Here we just return success.
    return {"message": "Password reset option verified. Please proceed to reset."}

@app.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    user = users_collection.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    hashed_password = get_password_hash(request.new_password)
    users_collection.update_one({"email": request.email}, {"$set": {"password": hashed_password}})
    return {"message": "Password updated successfully"}

@app.get("/user-profile")
def get_user_profile(current_user: dict = Depends(get_current_user)):
    user = users_collection.find_one({"email": current_user["email"]}, {"_id": 0, "password": 0})
    return user

# --- HEALTH HISTORY ENDPOINTS ---

@app.post("/analyze", response_model=AnalysisResponse)
def analyze_symptoms(request: SymptomAnalysisRequest, current_user: dict = Depends(get_current_user)):
    result = predict_symptoms(request.symptoms)
    
    # Save to history
    history_record = {
        "user_email": current_user["email"],
        "symptoms": request.symptoms,
        "predictions": result["predictions"],
        "risk_level": result["risk_level"],
        "recommendations": result["recommendations"],
        "emergency": result["emergency"],
        "date": datetime.utcnow()
    }
    history_collection.insert_one(history_record)
    
    return result

@app.post("/predict-disease", response_model=AnalysisResponse)
def predict_disease(request: SymptomAnalysisRequest, current_user: dict = Depends(get_current_user)):
    # Task 5: Prediction API
    return analyze_symptoms(request, current_user)

@app.get("/user-history")
def get_user_history(current_user: dict = Depends(get_current_user)):
    records = list(history_collection.find({"user_email": current_user["email"]}, {"_id": 0}))
    # Sort by date descending
    records.sort(key=lambda x: x["date"], reverse=True)
    return records

# --- OTHER ENDPOINTS ---

@app.post("/reminders")
def create_reminder(reminder: MedicineReminder, current_user: dict = Depends(get_current_user)):
    record = reminder.dict()
    record["user_email"] = current_user["email"]
    reminders_collection.insert_one(record)
    return {"status": "success"}

@app.get("/reminders")
def get_reminders(current_user: dict = Depends(get_current_user)):
    records = list(reminders_collection.find({"user_email": current_user["email"]}, {"_id": 0}))
    return records

@app.post("/profiles")
def create_profile(profile: HealthProfileCreate, current_user: dict = Depends(get_current_user)):
    record = profile.dict()
    record["user_email"] = current_user["email"]
    profiles_collection.insert_one(record)
    return {"status": "success"}

@app.get("/profiles")
def get_profiles(current_user: dict = Depends(get_current_user)):
    records = list(profiles_collection.find({"user_email": current_user["email"]}, {"_id": 0}))
    return records

from ml_model import generate_ai_response

@app.post("/chat")
def chatbot_interaction(query: dict, current_user: dict = Depends(get_current_user)):
    user_name = current_user.get("name", "User")
    text = query.get("text", "")
    response = generate_ai_response(text, user_name=user_name)
    return {"response": response}

# --- APPOINTMENT ENDPOINTS ---

@app.post("/appointments")
def create_appointment(appointment: AppointmentCreate, current_user: dict = Depends(get_current_user)):
    record = appointment.dict()
    record["user_email"] = current_user["email"]
    record["status"] = "booked"
    record["dateCreated"] = datetime.utcnow()
    appointments_collection.insert_one(record)
    return {"status": "success"}

@app.get("/appointments")
def get_appointments(current_user: dict = Depends(get_current_user)):
    records = list(appointments_collection.find({"user_email": current_user["email"]}, {"_id": 0}))
    return records

@app.patch("/appointments/{doctor_name}")
def update_appointment(doctor_name: str, update: AppointmentUpdate, current_user: dict = Depends(get_current_user)):
    # Using doctorName as per user requirement but filtering by user_email
    # status can be "booked", "cancelled", "completed"
    result = appointments_collection.update_one(
        {"user_email": current_user["email"], "doctorName": doctor_name, "status": "booked"},
        {"$set": {"status": update.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Recent booked appointment not found")
        
    return {"status": "success"}

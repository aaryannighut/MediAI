# Heavy imports are now lazy-loaded within functions to speed up server startup.
from typing import List, Dict, Any, Optional
import os

MODEL_PATH = "model.joblib"
DATA_PATH = "symptom_data.csv"

# Comprehensive medical knowledge mapping
MEDICAL_DATABASE: Dict[str, Dict[str, Any]] = {
    "Malaria": {
        "risk": "High Risk",
        "precautions": ["Blood test immediately", "Consult a physician", "Avoid mosquito exposure", "Complete prescribed medication"],
        "specialty": "Infectious Disease Specialist",
        "doctors": ["Dr. Adrian Smith", "Dr. Sarah Johnson"]
    },
    "Dengue": {
        "risk": "High Risk",
        "precautions": ["Stay hydrated", "Monitor platelet count", "Avoid aspirin/ibuprofen", "Use mosquito nets"],
        "specialty": "General Physician",
        "doctors": ["Dr. Michael Chen", "Dr. Emily Davis"]
    },
    "Typhoid": {
        "risk": "High Risk",
        "precautions": ["Drink boiled/purified water", "Consult a doctor", "Rest and hydrate", "Avoid street food"],
        "specialty": "Internal Medicine",
        "doctors": ["Dr. Robert Wilson", "Dr. Lisa Wong"]
    },
    "Flu": {
        "risk": "Medium Risk",
        "precautions": ["Rest and hydrate", "Take paracetamol for fever", "Steam inhalation", "Isolate if contagious"],
        "specialty": "General Physician",
        "doctors": ["Dr. Adrian Smith", "Dr. Jane Smith"]
    },
    "Common Cold": {
        "risk": "Low Risk",
        "precautions": ["Salt water gargle", "Drink warm fluids", "Rest", "Take Vitamin C"],
        "specialty": "General Physician",
        "doctors": ["Dr. Alex Walker", "Dr. Maria Garcia"]
    },
    "COVID-19": {
        "risk": "High Risk",
        "precautions": ["Isolate immediately", "Monitor oxygen levels", "Consult online doctor", "Wear mask"],
        "specialty": "Pulmonologist",
        "doctors": ["Dr. Elena Rossi", "Dr. David Miller"]
    },
    "Food Poisoning": {
        "risk": "High Risk",
        "precautions": ["ORS/Electrolytes", "Avoid solid food for a few hours", "Seek emergency if persistent", "Consult gastroenterologist"],
        "specialty": "Gastroenterologist",
        "doctors": ["Dr. Sanjay Patel", "Dr. Elena Rossi"]
    },
    "Allergic Reaction": {
        "risk": "Low Risk",
        "precautions": ["Identify and avoid allergen", "Take antihistamine", "Apply soothing lotion", "Consult dermatologist"],
        "specialty": "Dermatologist",
        "doctors": ["Dr. Amanda Green", "Dr. Elena Rossi"]
    },
    "Heart Attack": {
        "risk": "CRITICAL",
        "precautions": ["CALL 911 IMMEDIATELY", "Chew an aspirin if available", "Stay calm and sit down", "Do not drive yourself"],
        "specialty": "Cardiologist",
        "doctors": ["Dr. Robert Chen", "Emergency Room"]
    },
    "Pneumonia": {
        "risk": "High Risk",
        "precautions": ["Antibiotic treatment", "Rest and chest therapy", "Hospitalization if severe", "Oxygen support if needed"],
        "specialty": "Pulmonologist",
        "doctors": ["Dr. David Miller", "Dr. Alan Walker"]
    },
    "Migraine": {
        "risk": "Medium Risk",
        "precautions": ["Rest in a dark room", "Take pain relief medication", "Avoid triggers like light/noise", "Stay hydrated"],
        "specialty": "Neurologist",
        "doctors": ["Dr. Elena Rossi", "Dr. Robert Wilson"]
    },
    "Diabetes": {
        "risk": "High Risk",
        "precautions": ["Monitor blood sugar", "Strict diet control", "Regular exercise", "Follow insulin/medication plan"],
        "specialty": "Endocrinologist",
        "doctors": ["Dr. Lisa Wong", "Dr. Michael Chen"]
    },
    "Hyperthyroidism": {
        "risk": "Medium Risk",
        "precautions": ["Thyroid hormone test", "Prescribed medication", "Avoid excessive iodine", "Consult endocrinologist"],
        "specialty": "Endocrinologist",
        "doctors": ["Dr. Lisa Wong", "Dr. Sarah Johnson"]
    },
    "Jaundice": {
        "risk": "High Risk",
        "precautions": ["LFT (Liver function test)", "Complete bed rest", "Fat-free diet", "Consult gastroenterologist"],
        "specialty": "Gastroenterologist",
        "doctors": ["Dr. Sanjay Patel", "Dr. Robert Chen"]
    },
    "Chickenpox": {
        "risk": "Medium Risk",
        "precautions": ["Isolate for 2 weeks", "Apply calamine lotion", "Avoid scratching blisters", "Wait for scabs to fall off"],
        "specialty": "Dermatologist",
        "doctors": ["Dr. Amanda Green", "Dr. Alex Walker"]
    }
}

SYMPTOM_DICTIONARY = [
    "fever", "cough", "headache", "stomach pain", "nausea", "vomiting", 
    "chest pain", "shortness of breath", "rash", "itching", "joint pain", 
    "chills", "sweating", "fatigue", "dizziness", "sore throat", "diarrhea",
    "allergy", "back pain", "blurred vision", "congestion", "loss of taste",
    "loss of smell", "sneezing", "body ache", "runny nose", "eye pain",
    "yellow skin", "frequent urination", "excessive thirst", "shoulder pain"
]

def train_model() -> None:
    import pandas as pd
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.pipeline import Pipeline
    from sklearn.model_selection import train_test_split
    from sklearn.feature_extraction.text import TfidfVectorizer
    import joblib

    if not os.path.exists(DATA_PATH):
        print("Data file not found. Please run generate_dataset.py first.")
        return

    df = pd.read_csv(DATA_PATH)
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
        ('rf', RandomForestClassifier(n_estimators=200, random_state=42))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(df['text'], df['label'], test_size=0.2, random_state=42)
    pipeline.fit(X_train, y_train)
    joblib.dump(pipeline, MODEL_PATH)
    print("Model trained and saved with updated dataset.")

def load_model() -> Any:
    import joblib
    print(f"Loading model from {MODEL_PATH}...")
    if not os.path.exists(MODEL_PATH):
        print(f"Model not found, training new one...")
        train_model()
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully.")
    return model

def predict_symptoms(symptoms_list: List[str]) -> Dict[str, Any]:
    import numpy as np
    model = load_model()
    text = " ".join(symptoms_list).lower()
    
    # Predict probabilities
    probs = model.predict_proba([text])[0]
    classes = model.classes_
    
    top_indices = np.argsort(probs)[::-1][:3]
    predictions: List[Dict[str, Any]] = []
    
    for i in top_indices:
        confidence = float(probs[i]) * 100
        if confidence > 0:
            predictions.append({
                "disease": str(classes[i]), 
                "probability": round(confidence, 1)
            })
            
    if not predictions:
        return {
            "predictions": [],
            "risk_level": "Low Risk",
            "precautions": ["Consult a general physician for general advice."],
            "recommendations": {"specialty": "General Physician", "doctors": ["Dr. Adrian Smith"]},
            "emergency": False
        }

    top_result = predictions[0]
    top_disease = str(top_result["disease"])
    prob = float(top_result["probability"]) / 100.0
    
    if prob > 0.70:
        risk_level = "High Risk"
    elif prob > 0.40:
        risk_level = "Medium Risk"
    else:
        risk_level = "Low Risk"
        
    emergency = False
    if top_disease == "Heart Attack" or "chest pain" in text:
        risk_level = "CRITICAL"
        emergency = True
    elif top_disease in ["Pneumonia", "COVID-19", "Malaria", "Dengue"]:
        if prob > 0.5:
            risk_level = "High Risk"

    db_entry = MEDICAL_DATABASE.get(top_disease, {
        "precautions": ["Consult a doctor"],
        "specialty": "General Physician",
        "doctors": ["Dr. Adrian Smith"]
    })
    
    return {
        "predictions": predictions,
        "risk_level": risk_level,
        "precautions": db_entry["precautions"],
        "recommendations": {
            "specialty": db_entry["specialty"],
            "doctors": db_entry["doctors"]
        },
        "emergency": emergency
    }

def extract_symptoms(text: str) -> List[str]:
    from rapidfuzz import process, fuzz
    words = text.lower().replace(",", " ").split()
    detected = []
    for word in words:
        if len(word) < 3: continue
        match = process.extractOne(word, SYMPTOM_DICTIONARY, scorer=fuzz.WRatio, score_cutoff=85)
        if match:
            detected.append(str(match[0]))
            
    for symptom in SYMPTOM_DICTIONARY:
        if " " in symptom and symptom in text.lower():
            detected.append(symptom)
            
    return list(set(detected))

def generate_ai_response(text: str, user_name: str = "User") -> str:
    detected = extract_symptoms(text)
    if not detected:
        return f"Hello {user_name}, I couldn't identify specific symptoms from your message. Could you please describe how you're feeling (e.g., fever, cough, pain) so I can assist you better?"

    prediction_data = predict_symptoms(detected)
    
    preds = prediction_data.get("predictions", [])
    if isinstance(preds, list) and len(preds) > 0:
        top_disease = str(preds[0].get("disease", "a health condition"))
    else:
        top_disease = "a health condition"
        
    risk = str(prediction_data.get("risk_level", "Unknown Risk"))
    precautions_list = prediction_data.get("precautions", [])
    precautions = ", ".join(precautions_list) if isinstance(precautions_list, list) else str(precautions_list)
    
    response = f"Hello {user_name}, I've analyzed your symptoms: {', '.join(detected)}. Based on my AI analysis, this might indicate {top_disease} ({risk}).\n\n"
    if prediction_data.get("emergency"):
        response = f"URGENT: {user_name}, you mentioned critical symptoms. This may indicate {top_disease}. Please seek emergency care immediately!\n\n"
    
    response += f"Recommended actions: {precautions}. "
    
    recs = prediction_data.get("recommendations", {})
    specialty = "General Physician"
    if isinstance(recs, dict):
        specialty = str(recs.get("specialty", "General Physician"))
        
    response += f"It's best to consult a {specialty} for a proper diagnosis."
    return response

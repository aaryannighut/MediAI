import pandas as pd
import numpy as np

# Medical dataset based on common symptoms-disease associations
data = []

# Disease: [Symptoms]
diseases = {
    "Malaria": ["fever", "chills", "sweating", "headache", "nausea", "vomiting"],
    "Dengue": ["fever", "joint pain", "rash", "headache", "nausea", "vomiting", "eye pain"],
    "Typhoid": ["fever", "headache", "stomach pain", "diarrhea", "vomiting", "fatigue"],
    "Flu": ["fever", "cough", "chills", "fatigue", "sore throat", "runny nose", "body ache"],
    "Common Cold": ["cough", "runny nose", "sore throat", "sneezing", "congestion"],
    "COVID-19": ["fever", "cough", "fatigue", "loss of taste", "loss of smell", "shortness of breath"],
    "Food Poisoning": ["vomiting", "nausea", "diarrhea", "stomach pain", "fever"],
    "Allergic Reaction": ["rash", "itching", "sneezing", "watery eyes", "swelling"],
    "Heart Attack": ["chest pain", "shortness of breath", "nausea", "dizziness", "shoulder pain"],
    "Pneumonia": ["cough", "fever", "shortness of breath", "chest pain", "chills", "fatigue"],
    "Migraine": ["headache", "nausea", "blurred vision", "sensitivity to light", "dizziness"],
    "Diabetes": ["fatigue", "blurred vision", "frequent urination", "excessive thirst"],
    "Hyperthyroidism": ["sweating", "fatigue", "fast heart rate", "tremor", "weight loss"],
    "Jaundice": ["yellow skin", "fever", "stomach pain", "nausea", "fatigue"],
    "Chickenpox": ["fever", "rash", "itching", "fatigue", "headache"]
}

# Generate synthetic samples with noise
for disease, symptoms in diseases.items():
    for _ in range(50): # 50 samples per disease
        # Pick 3 to 6 symptoms from the list
        num_symptoms = np.random.randint(3, len(symptoms) + 1)
        selected = np.random.choice(symptoms, num_symptoms, replace=False)
        # Add some noise symptoms (randomly pick 0-1 unrelated symptoms)
        if np.random.rand() > 0.8:
            all_symptoms = [s for sublist in diseases.values() for s in sublist]
            noise = np.random.choice(all_symptoms)
            if noise not in selected:
                selected = np.append(selected, noise)
        
        data.append({"text": " ".join(selected), "label": disease})

df = pd.DataFrame(data)
df.to_csv("symptom_data.csv", index=False)
print(f"Dataset generated with {len(df)} samples")

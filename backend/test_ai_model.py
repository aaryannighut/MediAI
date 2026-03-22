import requests

def test_ai_diagnosis():
    base_url = "http://127.0.0.1:8000"
    
    # 0. Auth
    user_data = {"name": "AI Tester", "email": "ai_test@example.com", "password": "password123", "age": 25, "gender": "male"}
    requests.post(f"{base_url}/signup", json=user_data)
    login_data = {"email": "ai_test@example.com", "password": "password123"}
    res = requests.post(f"{base_url}/login", json=login_data)
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing Malaria symptoms (fever, chills, sweating)...")
    payload = {"symptoms": ["fever", "chills", "sweating"], "age": 25, "gender": "male", "duration_days": 1}
    res = requests.post(f"{base_url}/predict-disease", json=payload, headers=headers)
    if res.status_code != 200:
        print(f"Error {res.status_code}: {res.text}")
        return
    data = res.json()
    print(f"Top Disease: {data['predictions'][0]['disease']} ({data['predictions'][0]['probability']}%)")
    print(f"Risk Level: {data['risk_level']}")
    print(f"Recommended Specialist: {data['recommendations']['specialty']}")
    
    # 2. Test Heart Attack (critical)
    print("\nTesting Heart Attack symptoms (chest pain, shortness of breath)...")
    payload = {"symptoms": ["chest pain", "shortness of breath"], "age": 45, "gender": "male", "duration_days": 1}
    res = requests.post(f"{base_url}/predict-disease", json=payload, headers=headers)
    data = res.json()
    print(f"Top Disease: {data['predictions'][0]['disease']} ({data['predictions'][0]['probability']}%)")
    print(f"Risk Level: {data['risk_level']}")
    print(f"Emergency: {data['emergency']}")

if __name__ == "__main__":
    test_ai_diagnosis()

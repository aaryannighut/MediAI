import requests

url = "http://localhost:8000/signup"
data = {
    "name": "Test User",
    "email": "test4@example.com",
    "password": "password123",
    "age": 30,
    "gender": "male"
}

try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

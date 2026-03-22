import requests

url = "http://localhost:8000/login"
data = {
    "email": "aaryannighut07@gmail.com",
    "password": "password123" # Assuming this is the password, if not I'll try to check the db for common test passwords or hashes
}

try:
    print(f"Testing login at {url} for {data['email']}...")
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

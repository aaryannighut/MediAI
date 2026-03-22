import requests

def test_chat():
    # 1. Signup/Login to get token
    signup_url = "http://127.0.0.1:8000/signup"
    user_data = {
        "name": "Chat AI Tester",
        "email": f"tester_{hash('test')}@example.com",
        "password": "password123",
        "age": 30,
        "gender": "male"
    }
    
    try:
        res = requests.post(signup_url, json=user_data)
        if res.status_code != 200:
            # Try login if signup fails (already exists)
            res = requests.post("http://127.0.0.1:8000/login", json={"email": user_data["email"], "password": user_data["password"]})
        
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Test chat with various inputs
        chat_url = "http://127.0.0.1:8000/chat"
        tests = [
            "I have a terrible headech and feel tired",
            "My skin has a red rash and it itches",
            "I have severe chest pain",
            "I just feel dizzy",
            "how are you?"
        ]
        
        for t in tests:
            chat_res = requests.post(chat_url, json={"text": t}, headers=headers)
            print(f"\nInput: {t}")
            print(f"Response: {chat_res.json()['response']}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_chat()

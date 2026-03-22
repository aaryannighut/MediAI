from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
db = client["mediai_db"]

# Collections
users_collection = db["users"]
profiles_collection = db["profiles"]
history_collection = db["history"]
reminders_collection = db["reminders"]
appointments_collection = db["appointments"]

from flask import Flask, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from langchain_loader import generate_data_store
from query_data import get_answer
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Allow CORS for frontend at localhost:5173
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

load_dotenv()

password = os.getenv("MONGO_PASS")

MONGO_URI = f"mongodb+srv://Amogh_kal:{password}@demo.vy7ku.mongodb.net/?retryWrites=true&w=majority&appName=Demo"
DB_NAME = "Universe"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db["users"]

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    usn = data.get('usn')
    isAlumni = data.get('isAlumni')
    print(username, email, password, usn, isAlumni)
    if not username or not email or not password or not usn or not name:
        return jsonify({"error": "All fields are required"}), 400
    
    if users_collection.find_one({"username": username}) or users_collection.find_one({"email": email}) or users_collection.find_one({"usn": usn}):
        return jsonify({"error":"Username or email already exists"}), 400
    
    hashed_password = generate_password_hash(password)
    users_collection.insert_one({"name": name, "username":username, "email":email, "password": hashed_password, "usn": usn, "isAlumni": isAlumni})

    return jsonify({"message":"User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "All fields are required"}), 400
    
    user = users_collection.find_one({"username": username})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error":"Invalid username or password"}), 400
    
    return jsonify({"message":"Login Successful"}), 200

@app.route("/forgot_password", methods=["POST"])
def forgot_password():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    new_password = data.get("password")
    confirm_password = data.get("confirmPassword")

    print(username, email, new_password, confirm_password)

    if not username or not email or not new_password or not confirm_password:
        return jsonify({"error": "All fields are required"}), 401

    if new_password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 402

    user = users_collection.find_one({"username": username, "email": email})
    if not user:
        return jsonify({"error": "Invalid username or email"}), 404

    hashed_password = generate_password_hash(new_password)
    users_collection.update_one({"_id": user["_id"]}, {"$set": {"password": hashed_password}})

    return jsonify({"message": "Password updated successfully"}), 200

@app.route("/user/<username>", methods=["GET"])
def get_user_details(username):
    user = users_collection.find_one({"username":username}, {"_id":0, "password": 0})

    if not user:
        return jsonify({"error": "User not found"}), 400
    
    return jsonify({"user": user}), 200

@app.route("/<user>/upload", methods=["POST"])
def upload_files(username):
    if not request.files:
        return jsonify({"error": "No files uploaded"}), 400
    
    try:
        os.makedirs("./uploads", exist_ok=True)
        
        files = request.files

        for key in files:
            file = files[key]
            
            if file.filename:
                filename = secure_filename(file.filename)
                file.save(os.path.join(f"uploads_{username}", filename))

        generate_data_store()
        print("chunks generated")
        
        return jsonify({"message": "Files uploaded successfully"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/<username>/query", methods=["POST"])
def query_data(username):
    try:
        data = request.json
        query = data.get("query")
        result = get_answer(username, query, MONGO_URI)

        return jsonify({"answer":result})
    except Exception as e:
        return jsonify({"Error": str(e)}), 500

if __name__=="__main__":
    app.run(debug=True, port=5000)

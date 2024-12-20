from flask import Flask, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit, rooms
from datetime import datetime
from langchain_loader import generate_data_store
from query_data import get_answer
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Allow CORS for frontend at localhost:5173
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

load_dotenv()

# Configure SocketIO with additional settings
socketio = SocketIO(
    app,
    cors_allowed_origins="http://localhost:5173",
    ping_timeout=60,
    ping_interval=25
)

# Enhanced room structure
rooms = {
    # 'ROOM123': {
    #     'host': 'username',
    #     'users': ['username1', 'username2'],
    #     'quiz_title': 'Quiz Title',
    #     'created_at': datetime,
    #     'files': ['file1.pdf', 'file2.pptx'],
    #     'status': 'waiting'  # waiting, in_progress, completed
    # }
}

# Track socket connections
socket_connections = {}

password = os.getenv("MONGO_PASS")
MONGO_URI = f"mongodb+srv://Amogh_kal:{password}@demo.vy7ku.mongodb.net/?retryWrites=true&w=majority&appName=Demo"
DB_NAME = "Universe"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db["users"]
quiz_rooms_collection = db["quiz_rooms"]

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

@app.route("/upload", methods=["POST"])
def upload_files():
    if not request.files:
        return jsonify({"error": "No files uploaded"}), 400
    
    try:
        # Create uploads directory if it doesn't exist
        os.makedirs("./uploads", exist_ok=True)
        
        files = request.files
        for key in files:
            file = files[key]
            if file.filename:  # Check if a file was actually selected
                # Secure the filename to prevent directory traversal attacks
                from werkzeug.utils import secure_filename
                filename = secure_filename(file.filename)
                file.save(os.path.join("uploads", filename))
        
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

# Socket event handlers
@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")
    socket_connections[request.sid] = {
        'username': None,
        'room': None
    }
    emit('connection_success', {'message': 'Connected successfully'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")
    # Clean up user from room if they were in one
    connection_data = socket_connections.get(request.sid)
    if connection_data and connection_data['room']:
        handle_leave({
            'username': connection_data['username'],
            'roomCode': connection_data['room']
        })
    socket_connections.pop(request.sid, None)

@socketio.on('create_room')
def handle_create_room(data):
    room_code = data['roomCode']
    quiz_title = data['quizTitle']
    creator = data['creator']
    files = data.get('files', [])

    if room_code in rooms:
        emit('error', {'message': 'Room already exists'})
        return

    # Create room with enhanced structure
    rooms[room_code] = {
        'host': creator,
        'users': [creator],
        'quiz_title': quiz_title,
        'created_at': datetime.now(),
        'files': files,
        'status': 'waiting'
    }

    # Store room in database
    quiz_rooms_collection.insert_one({
        'room_code': room_code,
        'quiz_title': quiz_title,
        'host': creator,
        'created_at': datetime.now(),
        'files': files
    })

    # Add user to room
    join_room(room_code)
    socket_connections[request.sid] = {
        'username': creator,
        'room': room_code
    }

    emit('room_created', {
        'roomCode': room_code,
        'creator': creator,
        'quizTitle': quiz_title,
        'users': [creator]
    })

@socketio.on('join_room')
def handle_join_room(data):
    username = data['username']
    room_code = data['roomCode']

    if room_code not in rooms:
        emit('error', {'message': 'Room not found'})
        return

    # Add user to room
    if username not in rooms[room_code]['users']:
        rooms[room_code]['users'].append(username)
    
    # Update socket connection tracking
    socket_connections[request.sid] = {
        'username': username,
        'room': room_code
    }

    join_room(room_code)
    
    # Notify everyone in the room
    emit('user_joined', {
        'username': username,
        'users': rooms[room_code]['users']
    }, room=room_code)

    # Send room data to the joining user
    emit('room_joined', {
        'roomCode': room_code,
        'quizTitle': rooms[room_code]['quiz_title'],
        'users': rooms[room_code]['users'],
        'host': rooms[room_code]['host']
    })

@socketio.on('leave_room')
def handle_leave(data):
    username = data['username']
    room_code = data['roomCode']

    if room_code in rooms and username in rooms[room_code]['users']:
        rooms[room_code]['users'].remove(username)
        leave_room(room_code)
        
        # Update socket connection tracking
        if request.sid in socket_connections:
            socket_connections[request.sid]['room'] = None
            socket_connections[request.sid]['username'] = None

        # Notify others in the room
        emit('user_left', {
            'username': username,
            'users': rooms[room_code]['users']
        }, room=room_code)

        # Clean up empty rooms
        if len(rooms[room_code]['users']) == 0:
            rooms.pop(room_code)
            quiz_rooms_collection.update_one(
                {'room_code': room_code},
                {'$set': {'status': 'completed', 'completed_at': datetime.now()}}
            )

@socketio.on('start_game')
def handle_start_game(data):
    room_code = data['roomCode']
    # Broadcast to all users in the room
    socketio.emit('game_started', room=room_code)


@socketio.on('rejoin_room')
def handle_rejoin_room(data):
    username = data['username']
    room_code = data['roomCode']

    if room_code not in rooms:
        emit('error', {'message': 'Room no longer exists'})
        return

    # Re-add user to room if they're not already in it
    if username not in rooms[room_code]['users']:
        rooms[room_code]['users'].append(username)
    
    # Update socket connection tracking
    socket_connections[request.sid] = {
        'username': username,
        'room': room_code
    }

    join_room(room_code)
    
    emit('room_joined', {
        'roomCode': room_code,
        'quizTitle': rooms[room_code]['quiz_title'],
        'users': rooms[room_code]['users'],
        'host': rooms[room_code]['host']
    })

@socketio.on('ping_room')
def handle_ping(data):
    room_code = data['roomCode']
    if room_code in rooms:
        emit('room_active', {'roomCode': room_code})

# REST endpoints remain mostly the same, but add new endpoints for room management

@app.route('/rooms/<room_code>', methods=['GET'])
def get_room_info(room_code):
    room = rooms.get(room_code)
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    
    return jsonify({
        'room_code': room_code,
        'quiz_title': room['quiz_title'],
        'host': room['host'],
        'users': room['users'],
        'status': room['status'],
        'created_at': room['created_at'].isoformat()
    })

@app.route('/rooms/active', methods=['GET'])
def get_active_rooms():
    active_rooms = {
        code: {
            'quiz_title': room['quiz_title'],
            'host': room['host'],
            'user_count': len(room['users']),
            'status': room['status']
        }
        for code, room in rooms.items()
    }
    return jsonify(active_rooms)


if __name__=="__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)

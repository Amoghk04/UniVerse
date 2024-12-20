from flask import Flask, request, jsonify,render_template
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit, rooms
from bson import Binary
import base64

# from datetime import datetime
# from langchain_loader import generate_data_store
# from query_data import get_answer
# from werkzeug.utils import secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads/pics'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
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
places_collection = db["places"]
reviews_collection = db["reviews"]

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

@app.route("/<username>/upload", methods=["POST"])
def upload_files(username):
    if not request.files:
        return jsonify({"error": "No files uploaded"}), 400
    
    try:
        # Create uploads directory if it doesn't exist
        os.makedirs(f"./uploads_{username}", exist_ok=True)
        
        files = request.files
        for key in files:
            file = files[key]
            if file.filename:  # Check if a file was actually selected
                # Secure the filename to prevent directory traversal attacks
                from werkzeug.utils import secure_filename
                filename = secure_filename(file.filename)
                file.save(os.path.join(f"uploads_{username}", filename))
        
        generate_data_store(username)
        print("Generated chunks")

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
        print(e)
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


@app.route('/add_place', methods=['POST'])
def add_place():
    try:
        # Get data from the request
        name = request.form.get("placename")
        category = request.form.get("category")
        image = request.files["image"].read()  # Read the image file as binary data

        # Convert name to lowercase for case-insensitive comparison
        name_lower = name.lower()
        place = places_collection.find_one({"$expr": {"$eq": [{"$toLower": "$name"}, name_lower]}})

        if not place:
            # Insert new place into the collection
            places_collection.insert_one({
                "name": name,
                "image": Binary(image),  # Store image as binary
                "avg_rating": 0,
                "category": category
            })
            return jsonify({"success": True, "message": f"Place '{name}' added."}), 201
        else:
            return jsonify({"success": False, "message": f"Place '{name}' already exists."}), 409

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
        


def add_review(place_name, review, rating, username):
    place_lower = place_name.lower()
    place = places_collection.find_one({"$expr": {"$eq": [{"$toLower": "$name"}, place_lower]}})
    place_name=place["name"]
    reviews_collection.insert_one({
        "place_name": place_name,
        "review": review,
        "rating": rating,
        "username": username 
    })
    print(f"Review added for '{place_name}' by user '{username}'.")

    avg_rating = reviews_collection.aggregate([
        {"$match": {"place_name": place_name}},
        {"$group": {"_id": "$place_name", "avg_rating": {"$avg": "$rating"}}}
    ])

    avg_rating = list(avg_rating)
    if avg_rating:
        avg_rating = avg_rating[0]["avg_rating"]
        places_collection.update_one(
            {"name": place_name},
            {"$set": {"avg_rating": avg_rating}}
        )
        print(f"Avg rating for '{place_name}' updated to {avg_rating:.2f}.")
    else:
        print(f"Error calculating average rating for '{place_name}'.")


@app.route("/place", methods=["GET"])
def enter_place_name():
    place_name = request.args.get("place_name")  # Get place_name from query parameter

    if not place_name:
        return jsonify({"error": "Place name is required"}), 400  # Handle missing place_name

    place_name = place_name.lower()  # Convert to lowercase for comparison

    # Use $toLower in MongoDB query for case-insensitive comparison
    place = places_collection.find_one({"$expr": {"$eq": [{"$toLower": "$name"}, place_name]}})

    if place:
        return jsonify({"exists": True}), 200  
    else:
        return jsonify({"exists": False}), 200  




@app.route("/add_review", methods=["POST"])
def add_review_route():
    data = request.get_json()
    placename = data.get("placename").lower()  # Convert to lowercase for comparison
    review = data.get("review")
    rating = data.get("rating")
    username = data.get("username")

    if not placename or not review or not rating:
        return jsonify({"error": "Missing required fields"}), 400

    # Case-insensitive search for place name
    place = places_collection.find_one({"$expr": {"$eq": [{"$toLower": "$name"}, placename]}})

    if not place:
        print('Not found')
        return jsonify({"error": f"Place '{placename}' not found"}), 404

    # Add the review and update avg_rating
    add_review(placename, review, int(rating), username)

    return jsonify({"message": f"Review for '{placename}' added successfully"}), 200



@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the file to the uploads/pics directory
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    # Optionally, you can store the file path in a database
    return jsonify({'message': 'File uploaded successfully', 'file_path': file_path}), 200


@app.route('/top-rated-places', methods=['GET'])
def get_top_rated_places():
    try:
        print('in')
        # Fetch top 5 places sorted by avg_rating in descending order
        top_places = places_collection.find().sort("avg_rating", -1).limit(5)
        if top_places:
            print('yes')
        else:
            print('no')

        # Convert the cursor to a list of dictionaries
        result = [
            {
                "name": place.get("name"),
                "image": base64.b64encode(place["image"]).decode('utf-8') if "image" in place else None,
                "avg_rating": place.get("avg_rating"),
                "category": place.get("category")
            }
            for place in top_places
        ]


        return jsonify({
            "success": True,
            "data": result
        }), 200
    


    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/activities', methods=['GET'])
def get_activities():
    try:
        # Query to find all activities
        activities = places_collection.find({'category': 'activities'}, {})
        result = []
        for activity in activities:
            result.append({
                '_id': str(activity['_id']),
                'name': activity['name'],
                'image': activity['image'],
                'avg_rating': activity['avg_rating'],
                'category': activity['category']
            })
        return jsonify(result)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Failed to fetch activities'}), 500

if __name__=="__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)

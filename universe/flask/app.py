from flask import Flask, request, jsonify, render_template, make_response
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit, rooms
from bson import Binary
import base64
from datetime import datetime, timedelta
import re
from langchain_loader import generate_data_store
from query_data import get_answer, delete_memory
from werkzeug.utils import secure_filename
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from threading import Thread
from quiz.quiz_langchain_loader import generate_quiz_data_store
from quiz.quiz_query_data import get_quiz_questions

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads/pics'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
# Allow CORS for frontend at localhost:5173
CORS(app, supports_credentials=True)

load_dotenv()

questions = [
    {
        "question": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "answer": "Paris",
    },
    {
        "question": "What is 2 + 2?",
        "options": ["3", "4", "5", "6"],
        "answer": "4",
    },
    {
        "question": "Which programming language is known as 'Python'?",
        "options": ["Java", "C++", "Python", "Ruby"],
        "answer": "Python",
    },
]
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
notes_collection = db["notes"]
tickets_collection=db['tickets']
rants_collection = db["rants"]
games_collection = db["games"]

from flask import request, jsonify
from werkzeug.security import generate_password_hash
import base64

@app.route("/register", methods=["POST"])
def register():
    try:
        # Get form data
        name = request.form.get("name")
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        usn = request.form.get('usn')
        isAlumni = request.form.get('isAlumni') == 'true'  # Convert string to boolean
        
        # Get the image file
        profile_image = request.files.get('profileImage')

        # Validate required fields
        if not all([username, email, password, usn, name]):
            return jsonify({"error": "All fields are required"}), 400
        
        # Check for existing user
        if users_collection.find_one({"username": username}) or \
           users_collection.find_one({"email": email}) or \
           users_collection.find_one({"usn": usn}):
            return jsonify({"error": "Username or email already exists"}), 400
        
        # Process image if provided
        image_data = None
        if profile_image:
            # Read the image file
            image_binary = profile_image.read()
            # Convert to base64 for storing in MongoDB
            image_data = base64.b64encode(image_binary).decode('utf-8')
        
        # Hash password
        hashed_password = generate_password_hash(password)
        
        # Prepare user document
        user_doc = {
            "name": name,
            "username": username,
            "email": email,
            "password": hashed_password,
            "usn": usn,
            "isAlumni": isAlumni,
            "profileImage": image_data
        }
        
        # Insert user into database
        users_collection.insert_one(user_doc)

        return jsonify({"message": "User registered successfully"}), 201
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({"error": "An error occurred during registration"}), 500

@app.route("/alumni/register", methods=["POST"])
def register_alumni():
    data = request.json
    name = data.get("name")
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    year_pass_out = data.get('yearPassOut')
    isAlumni = data.get('isAlumni')
    companies = data.get('companies')  # A list of companies the alumni worked at
    skills = data.get('skills')  # A list of skills the alumni possesses

    # Debugging: Print the received data for verification
    print(username, email, password, year_pass_out, companies, skills)

    if isAlumni == 'true':
        isAlumni = True
    else:
        isAlumni = False

    # Check if all required fields are provided
    if not username or not email or not password or not name or not year_pass_out or not companies or not skills:
        return jsonify({"error": "All fields are required"}), 400

    # Hash the password before storing
    hashed_password = generate_password_hash(password)

    # Retrieve the profile image from an existing user (ChillGuy)
    chillGuy = users_collection.find_one({"name": name}, {"profileImage": 1, "_id": 0})

    # If ChillGuy exists and has a profile image, use it
    profileImage = chillGuy["profileImage"] if chillGuy and "profileImage" in chillGuy else None

    # Prepare alumni-specific data
    alumni_data = {
        "name": name,
        "username": username,
        "email": email,
        "password": hashed_password,
        "isAlumni": isAlumni,
        "yearPassOut": year_pass_out,
        "companies": companies,
        "skills": skills,
        "profileImage": profileImage,
    }

    # Insert alumni data into the collection
    users_collection.insert_one(alumni_data)

    return jsonify({"message": "Alumni registered successfully"}), 201


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
    # Get user data excluding _id and password
    user = users_collection.find_one(
        {"username": username}, 
        {"_id": 0, "password": 0}
    )

    if not user:
        return jsonify({"error": "User not found"}), 404

    # If there's a profile image, we can send it directly since it's already base64
    # If no profile image, we'll send a default value of None
    user_data = {
        "username": user.get("username"),
        "name": user.get("name"),
        "email": user.get("email"),
        "usn": user.get("usn"),
        "isAlumni": user.get("isAlumni"),
        "profileImage": user.get("profileImage")  # This will be the base64 string if it exists
    }

    return jsonify({
        "user": user_data
    }), 200

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

@app.route("/<username>/delete_memory", methods=["DELETE"])
def delete_mem(username):
    try:
        result = delete_memory(username, MONGO_URI)
        if result:
            return jsonify({"message": "Memory successfully deleted"}), 200
        else:
            return jsonify({"message": "No memory found for this user"}), 404
    except Exception as e:
        print(f"Error deleting memory: {e}")
        return jsonify({"error": str(e)}), 500
    
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
        avg_rating = round(avg_rating, 1)
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
        
        # Fetch top 5 places sorted by avg_rating in descending order
        top_places = places_collection.find().sort("avg_rating", -1).limit(9)
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
                'image': base64.b64encode(activity["image"]).decode('utf-8') if "image" in activity else None,
                'avg_rating': activity['avg_rating'],
                'category': activity['category']
            })
        return jsonify(result)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Failed to fetch activities'}), 500    
    
@app.route('/food', methods=['GET'])
def get_food():
    try:
        
        activities = places_collection.find({'category': 'food'}, {})
        result = []
        for activity in activities:
            result.append({
                '_id': str(activity['_id']),
                'name': activity['name'],
                'image': base64.b64encode(activity["image"]).decode('utf-8') if "image" in activity else None,
                'avg_rating': activity['avg_rating'],
                'category': activity['category']
            })
        return jsonify(result)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Failed to fetch activities'}), 500


@app.route('/nature', methods=['GET'])
def get_nature():
    try:
        
        natures = places_collection.find({'category': 'nature'}, {})
        result = []
        for nature in natures:
            result.append({
                '_id': str(nature['_id']),
                'name': nature['name'],
                'image': base64.b64encode(nature["image"]).decode('utf-8') if "image" in nature else None,
                'avg_rating': nature['avg_rating'],
                'category': nature['category']
            })
        return jsonify(result)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Failed to fetch nature'}), 500  

@app.route('/reviews/<place_name>', methods=['GET'])
def get_reviews(place_name):
    try:
        # Query to find reviews for the specific place
        reviews = reviews_collection.find({'place_name': place_name})
        result = []
        for review in reviews:
            result.append({
                '_id': str(review['_id']),
                'place_name': review['place_name'],
                'review': review['review'],
                'rating': review['rating'],
                'username': review.get('username', 'Anonymous')
            })
        return jsonify(result)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Failed to fetch reviews'}), 500

@app.route('/notes/upload', methods=["POST", "GET"])
def upload_or_list_notes():
    try:
        if request.method == "POST":
            # Handling file upload
            file = request.files['file']
            semester = request.form['semester']
            branch = request.form['branch']
            subject = request.form['subject']

            if not all([file, semester, branch, subject]):
                return jsonify({"message": "All fields (file, semester, branch, subject) are required"}), 400

            # Save file and metadata to MongoDB
            notes_collection.insert_one({
                "semester": semester,
                "branch": branch,
                "subject": subject,
                "filename": file.filename,
                "username": request.form['username'],
                "file_data": file.read()  # Store binary file data
            })

            return jsonify({"message": "File uploaded successfully"}), 200

        elif request.method == "GET":
            # Fetch all files with hierarchy
            all_notes = notes_collection.find()
            hierarchy = {}

            for note in all_notes:
                semester = note['semester']
                branch = note['branch']
                subject = note['subject']
                filename = note['filename']

                if semester not in hierarchy:
                    hierarchy[semester] = {}
                if branch not in hierarchy[semester]:
                    hierarchy[semester][branch] = {}
                if subject not in hierarchy[semester][branch]:
                    hierarchy[semester][branch][subject] = []

                hierarchy[semester][branch][subject].append(filename)

            return jsonify(hierarchy), 200

    except Exception as e:
        return jsonify({"Error": str(e)}), 500

@app.route('/notes/download/<filename>', methods=['GET'])
def download_file(filename):
    try:
        # Find the document with the matching filename
        file_doc = notes_collection.find_one({"filename": filename})
        
        if not file_doc:
            return jsonify({"message": "File not found"}), 404

        # Get the file data from the document
        file_data = file_doc['file_data']
        
        # Create a response with the file data
        response = make_response(file_data)
        
        # Set appropriate headers
        response.headers['Content-Type'] = 'application/octet-stream'
        response.headers['Content-Disposition'] = f'attachment; filename={filename}'
        
        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@app.route('/add_ticket', methods=['POST'])
def add_ticket():
    try:
        # Extract form data
        name = request.form.get("eventname")
        eventdate = request.form.get("eventdate")  # This will be a string in 'YYYY-MM-DD' format
        price = request.form.get("price")
        tnum = request.form.get("tnum")
        ctype = request.form.get("ctype")  # Ensure this matches the front-end form's name attribute
        contact = request.form.get("contact")
        category = request.form.get("category")
        image = request.files["image"].read()
        username = request.form.get("username")  # Get username from form

        # Convert the eventdate string (YYYY-MM-DD) to a datetime object
        event_date = datetime.strptime(eventdate, "%Y-%m-%d")  # Convert string to datetime

        # Calculate expiration time (24 hours after event date)
        expires_at = event_date + timedelta(hours=24)

        # Insert into MongoDB
        tickets_collection.insert_one({
            "eventname": name,
            "eventdate": event_date,
            "price": price,
            "image": Binary(image),  # Store image as binary
            "tnum": tnum,
            "ctype": ctype,
            "contact": contact,
            "category": category,
            "username": username,
            "expiresAt": expires_at  # Add expiresAt field
        })

        # Create the TTL index on the 'expiresAt' field to expire documents 24 hours after the event date
        tickets_collection.create_index([("expiresAt", 1)], expireAfterSeconds=0)

        return jsonify({"success": True, "message": f"Ticket '{name}' added."}), 201

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/tickets', methods=['GET'])
def get_tickets():
    try:
        tickets = tickets_collection.find()
        result = [
            {
                "name": ticket.get("eventname"),
                "price": ticket.get("price"),
                "date": ticket.get("eventdate").strftime('%Y-%m-%d') if ticket.get("eventdate") else None,
                "image": base64.b64encode(ticket["image"]).decode('utf-8') if "image" in ticket else None,
                "tnum": ticket.get("tnum"),
                "category": ticket.get("category"),
                "ctype": ticket.get("ctype"),
                "contact": ticket.get("contact")
            }
            for ticket in tickets
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


@app.route("/rants", methods=["GET", "POST"])
def handle_rants():
    try:
        if request.method == "POST":
            # Handle adding a new rant
            data = request.json
            rant = data.get("rant")
            rant_title = data.get("rantTitle")
            
            # Validate the input
            if not rant or not rant_title:
                return jsonify({"error": "Rant title and content are required"}), 400

            # Record the current time
            time = datetime.now()

            # Insert the rant into the database
            rants_collection.insert_one({
                "title": rant_title,
                "rant": rant,
                "time": time
            })

            return jsonify({"message": "Rant added successfully"}), 200

        elif request.method == "GET":
            # Get the total number of documents in the collection
            total_rants = rants_collection.count_documents({})

            # Fetch all rants in random order using $sample with the total size
            rants = list(rants_collection.aggregate([{"$sample": {"size": total_rants}}]))

            # Remove the MongoDB object ID from each rant
            for rant in rants:
                rant.pop("_id", None)

            return jsonify(rants), 200

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

    
@app.route("/<username>/games", methods=["POST", "GET"])
def handle_gaming(username):
    try:
        if request.method == "POST":
            # Retrieve data from the request
            game_name = request.json.get("gamename")
            link = request.json.get("gamelink")
            game_code = request.json.get("gamecode")
            max_players = request.json.get("maxplayers")

            # Validate required fields (game_name and max_players)
            if not game_name or not max_players:
                return jsonify({"Error": "Please enter all the required fields"}), 400

            # Insert the game into the database
            game_data = {
                "game_name": game_name,
                "game_link": link if link else None,  # Optional field, if not provided, set to None
                "game_code": game_code if game_code else None,  # Optional field, if not provided, set to None
                "username": username,
                "max_players": max_players
            }

            games_collection.insert_one(game_data)

            return jsonify({"message": "Added game successfully"}), 200

        elif request.method == "GET":
            # Retrieve all games from the database
            games = list(games_collection.find({}, {"_id": 0}))
            # Map fields to match React expectations
            for game in games:
                game["name"] = game.pop("game_name")
                game["link"] = game.pop("game_link")
                game["code"] = game.pop("game_code") if game.get("game_code") else None
                game["maxPlayers"] = game.pop("max_players")
            return jsonify(games), 200

    except Exception as e:
        print(e)
        return jsonify({"Error": str(e)}), 500

@app.route('/search', methods=['GET'])
def search_places():
    query = request.args.get('query')

    if not query:
        return jsonify({"success": False, "message": "No search query provided"}), 400

    try:
        # Create a case-insensitive regex pattern for the search query
        regex=re.compile(re.escape(query), re.IGNORECASE)

        # Query MongoDB for places that match the query (search in the 'name' field)
        places = list(places_collection.find({"name": regex}))

        if places:
            # Prepare the response data
            response = []
            for place in places:
                # Convert the image to Base64 (only if it exists)
                if 'image' in place:
                    encoded_image = base64.b64encode(place["image"]).decode('utf-8')
                else:
                    encoded_image = None

                response.append({
                    "name": place["name"],
                    "image": encoded_image,  # Include Base64-encoded image
                    "avg_rating": place["avg_rating"]
                })

            return jsonify({"success": True, "data": response})
        else:
            response=[]

        return jsonify({"success": False, "message": "No places found"}), 404

    except Exception as e:
        # Log the error for debugging
        print(f"Error fetching places: {e}")
        return jsonify({"success": False, "message": f"Internal server error: {str(e)}"}), 500


from flask import jsonify, request

@app.route('/alumniFetchAll', methods=['GET'])
def get_alumni():
    try:
        search_keywords = request.args.get('search', '').strip()
        
        if not search_keywords:
            # Base query ensuring isAlumni is true and companies field exists
            query = {
                'isAlumni': True,
                'companies': {'$exists': True}
            }
        else:
            # Query with search and ensuring companies field exists
            query = {
                'isAlumni': True,
                'companies': {'$exists': True},
                '$or': [
                    {'name': {'$regex': f'.*{search_keywords}.*', '$options': 'i'}},
                    {'yearPassOut': int(search_keywords) if search_keywords.isdigit() else None},
                    {'skills': {'$regex': f'.*{search_keywords}.*', '$options': 'i'}},
                    {'companies': {'$regex': f'.*{search_keywords}.*', '$options': 'i'}}
                ]
            }

        # Project only the specified fields
        projection = {
            'name': 1,
            'email': 1,
            'yearPassOut': 1,  # Corrected here
            'companies': 1,
            'skills': 1,
            'profileImage':1,
            '_id': 0
        }

        # Perform the query and convert cursor to list
        alumni_list = list(users_collection.find(query, projection))
        
        # Process the results to ensure all fields exist
        processed_alumni = []
        for alumnus in alumni_list:
            processed_alumni.append({
                'name': str(alumnus.get('name', '')),
                'email': str(alumnus.get('email', '')),
                'yearPassOut': str(alumnus.get('yearPassOut', '')),  # Corrected here
                'companies': list(alumnus.get('companies', [])),
                'skills': list(alumnus.get('skills', [])),
                'profileImage': alumnus.get('profileImage'),
            })

        return jsonify(processed_alumni), 200

    except Exception as e:
        print(f"Error in get_alumni: {str(e)}")  # Log the error
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

    
@app.route('/fetchallplaces', methods=['GET'])
def fetch_places():
    try:
        # Query MongoDB to fetch all places (no filter)
        places = list(places_collection.find())

        if places:
            # Prepare the response data
            response = []
            for place in places:
                # Convert the image to Base64 (only if it exists)
                if 'image' in place:
                    encoded_image = base64.b64encode(place["image"]).decode('utf-8')
                else:
                    encoded_image = None

                response.append({
                    "name": place["name"],
                    "image": encoded_image,  # Include Base64-encoded image
                    "avg_rating": place["avg_rating"],
                    "category": place["category"]
                })

            return jsonify({"success": True, "data": response})
        else:
            return jsonify({"success": False, "message": "No places found"}), 404

    except Exception as e:
        # Log the error for debugging
        print(f"Error fetching places: {e}")
        return jsonify({"success": False, "message": f"Internal server error: {str(e)}"}), 500

clubs_collection=db['clubs']
@app.route('/api/clublogin', methods=['POST'])
def clublogin():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "All fields are required"}), 400
    
    user = users_collection.find_one({"username": username})
    if not user or not check_password_hash(user['password'], password) or not user['clubadmin']:
        return jsonify({"error":"Invalid username or password"}), 400
    
    return jsonify({"message":"Login Successful"}), 200

@app.route('/api/clubs', methods=['GET'])
def get_clubs():
    clubs = list(clubs_collection.find())
    
    # Convert ObjectId to string
    for club in clubs:
        club['_id'] = str(club['_id'])

    # Return a structured response with success status
    return jsonify({
        'success': True,
        'data': clubs  # Include the clubs data
    })

events_collection=db['events']
@app.route('/api/events/<club_name>', methods=['GET'])
def get_club_events(club_name):
    try:
        # Fetch events for the specified club from MongoDB
        events = list(events_collection.find({'clubName': club_name}))
        
        # Convert ObjectIds to strings and handle image data
        for event in events:
            event['_id'] = str(event['_id'])
            # Convert image data to proper format for frontend
            if event.get('image'):
                event['image'] = f"data:image/jpeg;base64,{event['image']}"
        
        return jsonify({
            'success': True,
            'data': events
        }), 200
    
    except Exception as e:
        print(f"Error fetching events: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Internal server error occurred'
        }), 500

@app.route('/api/events', methods=['POST'])
def add_event():
    try:
        data = request.json
        required_fields = ['title', 'description', 'date', 'time', 'location', 'clubName']
        
        # Check for missing required fields (image is optional)
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'success': False, 
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        new_event = {
            'title': data['title'],
            'description': data['description'],
            'date': data['date'],
            'time': data['time'],
            'location': data['location'],
            'image': data.get('image'),  # Use get() to handle missing image
            'attendees': [],
            'clubName': data['clubName']
        }
        
        # Insert into MongoDB
        result = events_collection.insert_one(new_event)
        
        # Get the inserted document with _id
        inserted_event = events_collection.find_one({'_id': result.inserted_id})
        
        # Convert ObjectId to string for JSON serialization
        inserted_event['_id'] = str(inserted_event['_id'])
        
        return jsonify({'success': True, 'data': inserted_event}), 201
        
    except Exception as e:
        print(f"Error adding event: {str(e)}")  # Log the error
        return jsonify({
            'success': False,
            'message': 'Internal server error occurred'
        }), 500


@app.route('/api/events', methods=['DELETE'])
def delete_event():
    try:
        data = request.get_json()
        club_name = data.get('clubName')
        event_title = data.get('eventTitle')

        if not club_name or not event_title:
            return jsonify({
                'success': False,
                'message': 'Club name and event title are required'
            }), 400

        result = events_collection.delete_one({
            'clubName': club_name,
            'title': event_title
        })

        if result.deleted_count == 0:
            return jsonify({
                'success': False,
                'message': f'Event "{event_title}" not found in club "{club_name}"'
            }), 404

        return jsonify({
            'success': True,
            'message': 'Event deleted successfully'
        }), 200

    except Exception as e:
        print(f"Error deleting event: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Internal server error occurred: {str(e)}'
        }), 500
def send_async_email(sender_email, app_password, recipient_email, subject, html_content):
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = sender_email
        msg['To'] = recipient_email

        # Add HTML content
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)

        # Create SMTP session
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(sender_email, app_password)
            server.send_message(msg)

        return True
    except Exception as e:
        print(f"Error sending email to {recipient_email}: {str(e)}")
        return False

@app.route('/send_bulk_email', methods=['POST'])
def send_bulk_email():
    try:
        data = request.json
        if not data:
            return jsonify({"status": "error", "message": "No game data provided"}), 400

        # Email configuration
        sender_email = "collegeuniverse12@gmail.com"
        app_password = "ixcl tacx djgd yagg"
        print(data.get('gamename', 'N/A'))
        # Fetch unique emails
        unique_emails = users_collection.distinct("email")
        if not unique_emails:
            return jsonify({"status": "error", "message": "No recipient emails found"}), 404
        
        # Create HTML content
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">New Game Added!</h2>
                    <p>A new game has been added to our platform:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                        <p><strong>Game Name:</strong> {data.get('gamename', 'N/A')}</p>
                        <p><strong>Added By:</strong> {data.get('username', 'N/A')}</p>
                        <p><strong>Maximum Players:</strong> {data.get('maxplayers', 'N/A')}</p>
                    </div>
                    <p>Click <a href="{data.get('gamelink', '#')}">here</a> to check it out!</p>
                    <p style="color: #666; font-size: 12px;">
                        You received this email because you're subscribed to game notifications.
                    </p>
                </div>
            </body>
        </html>
        """

        # Send emails asynchronously
        success_count = 0
        for recipient_email in unique_emails:
            # Create a new thread for each email
            thread = Thread(
                target=send_async_email,
                args=(sender_email, app_password, recipient_email, 
                      f"New Game Added: {data.get('gamename', 'N/A')}", 
                      html_content)
            )
            thread.start()
            success_count += 1

        return jsonify({
            "status": "success",
            "message": f"Email sending initiated for {success_count} recipients"
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route("/quiz/<username>/uploads", methods=["POST", "OPTIONS"])
def quiz_upload(username):
    if request.method == "OPTIONS":
        # Respond to preflight request
        return '', 200
    
    if not request.files:
        return jsonify({"error": "No files uploaded"}), 400

    try:

        upload_folder = f"./uploads_{username}_quiz"
        os.makedirs(upload_folder, exist_ok=True)
        generate_quiz_data_store(username)
        uploaded_files = []
        for key in request.files:
            file = request.files[key]
            if file.filename:
                filename = secure_filename(file.filename)
                filepath = os.path.join(upload_folder, filename)
                file.save(filepath)
                uploaded_files.append(filename)

        generate_quiz_data_store(username)
        print("Generated vector embeddings")

        return jsonify({"message": "Files uploaded successfully", "files": uploaded_files}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/questions', methods=['GET'])
def get_questions():
    return jsonify(questions)

if __name__=="__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)

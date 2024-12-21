from flask import Flask, request, jsonify, render_template, make_response
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit, rooms
from bson import Binary
import base64
import requests
from datetime import datetime
from langchain_loader import generate_data_store
from query_data import get_answer, delete_memory
from werkzeug.utils import secure_filename

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
notes_collection = db["notes"]
tickets_collection=db['tickets']
rants_collection = db["rants"]
games_collection = db["games"]

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

    if(isAlumni == 'true'):
        isAlumni = True
    else:
        isAlumni = False

    # Check if all required fields are provided
    if not username or not email or not password or not name or not year_pass_out or not companies or not skills:
        return jsonify({"error": "All fields are required"}), 400
    
    # Hash the password before storing
    hashed_password = generate_password_hash(password)

    # Prepare alumni-specific data
    alumni_data = {
        "name": name,
        "username": username,
        "email": email,
        "password": hashed_password,
        "isAlumni": isAlumni,
        "yearPassOut": year_pass_out,
        "companies": companies,
        "skills": skills
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
    

GOOGLE_API_KEY = 'AIzaSyAKviKaoNilF2G3P5jdQuA4aecoe5g3WYg'
MSRIT_COORDS = {'lat': 13.03297, 'lng': 77.56496}  # MSRIT, Bengaluru

@app.route('/nearby-places', methods=['GET'])
def get_nearby_places():
    
    try:
        url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={MSRIT_COORDS['lat']},{MSRIT_COORDS['lng']}&radius=5000&type=restaurant&key={GOOGLE_API_KEY}"
        response = requests.get(url)
        print(response.json())
        # Check if the response is successful
        response.raise_for_status() 
        # Raises an exception for 4xx/5xx HTTP status codes
        return jsonify(response.json())  # Return the data to the frontend

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")  # Print HTTP error details
        return jsonify({'error': 'HTTP error occurred', 'details': str(http_err)}), 500
    except requests.exceptions.RequestException as req_err:
        print(f"Request error occurred: {req_err}")  # Print request error details
        return jsonify({'error': 'Request error occurred', 'details': str(req_err)}), 500
    except Exception as err:
        print(f"Other error occurred: {err}")  # Print any other errors
        return jsonify({'error': 'An error occurred', 'details': str(err)}), 500


@app.route('/add_ticket', methods=['POST'])
def add_ticket():
    try:
        # Extract form data
        name = request.form.get("eventname")
        tnum = request.form.get("tnum")
        message = request.form.get("message")
        category = request.form.get("category")
        image = request.files["image"].read()
        username = request.form.get("username")  # Get username from form

        # Insert into MongoDB
        tickets_collection.insert_one({
            "eventname": name,
            "image": Binary(image),  # Store image as binary
            "tnum": tnum,
            "message": message,
            "category": category,
            "username": username
        })

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
                "image": base64.b64encode(ticket["image"]).decode('utf-8') if "image" in ticket else None,
                "tnum": ticket.get("tnum"),
                "category": ticket.get("category"),
                "message": ticket.get("message")
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
            # Handle fetching all rants
            rants = list(rants_collection.find({}, {"_id": 0}))  # Exclude the MongoDB object ID
            return jsonify(rants), 200

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
    
@app.route("/<username>/games", methods=["POST","GET"])
def handle_gaming(username):
    try:
        if request.method == "POST":
            game_name = request.json.get("gamename")
            link = request.json.get("gamelink")
            max_players = request.json.get("maxplayers")

            if not game_name or not link or not max_players:
                return jsonify({"Error":"Please enter all the fields"}), 400

            games_collection.insert_one({
                "game_name":game_name,
                "game_link":link,
                "username": username,
                "max_players":max_players
            })

            return jsonify({"message":"Added games successfully"}), 200
        
        elif request.method == "GET":
            games = list(games_collection.find({}, {"_id": 0}))
            # Map fields to match React expectations
            for game in games:
                game["name"] = game.pop("game_name")
                game["link"] = game.pop("game_link")
                game["maxPlayers"] = game.pop("max_players")
            return jsonify(games), 200


    except Exception as e:
        print(e)
        return jsonify({"Error": str(e)}), 500


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
                    {'skills': {'$regex': f'.*{search_keywords}.*', '$options': 'i'}},
                    {'companies': {'$regex': f'.*{search_keywords}.*', '$options': 'i'}}
                ]
            }

        # Project only the specified fields
        projection = {
            'name': 1,
            'email': 1,
            'yearPassout': 1,
            'companies': 1,
            'skills': 1,
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
                'yearPassout': str(alumnus.get('yearPassout', '')),
                'companies': list(alumnus.get('companies', [])),
                'skills': list(alumnus.get('skills', []))
            })

        return jsonify(processed_alumni), 200

    except Exception as e:
        print(f"Error in get_alumni: {str(e)}")  # Log the error
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

    
if __name__=="__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)

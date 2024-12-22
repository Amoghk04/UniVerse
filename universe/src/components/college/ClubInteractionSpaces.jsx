import React, { useState, useEffect, useRef } from 'react';
import {
    PlusIcon,
    MessageCircleIcon,
    CalendarIcon,
    UserIcon,
    SearchIcon,
    BellIcon,
    TrashIcon,
    EditIcon,
    SendIcon,
    UploadIcon,
} from 'lucide-react';
import axios from 'axios';

// Reusable components
const Card = ({ children, className }) => (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => (
    <div className="border-b border-gray-300 dark:border-gray-700 pb-2 mb-4">{children}</div>
);

const CardTitle = ({ children }) => (
    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200">{children}</h3>
);

const CardContent = ({ children }) => <div>{children}</div>;

const Alert = ({ variant, children }) => (
    <div
        className={`p-4 rounded-md ${
            variant === 'destructive' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
        }`}
    >
        {children}
    </div>
);

const AlertDescription = ({ children }) => <p>{children}</p>;

const Avatar = ({ children }) => (
    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {children}
    </div>
);

const AvatarImage = ({ src, alt }) => (
    <img src={src} alt={alt} className="w-full h-full object-cover" />
);

const AvatarFallback = ({ children }) => (
    <span className="text-gray-500 dark:text-gray-300">{children}</span>
);

const ClubInteractionSpaces = () => {
    const [user, setUser] = useState(() => {
    });

    const [filteredClubs, setfilteredClubs] = useState([]);
    
    const handleAuth = async (e) => {
        e.preventDefault();
    
        try {
            // Send login request to Flask club login API
            const response = await axios.post('http://localhost:5000/api/clublogin', {
                username: authForm.username,
                password: authForm.password,
            });
    
            // Handle successful response
            console.log(response.data);  // { message: "Login Successful", user: {username: "clubadmin", role: "admin"} }
    
            // Store the logged-in club user information in localStorage
            localStorage.setItem('clubUser', JSON.stringify({
                username: authForm.username,
                role: 'admin' // or any role retrieved from the API response
            }));
    
            // Set the clubUser state
            setUser({
                username: authForm.username,
                role: 'admin'
            });
    
            // Hide the modal on success
            setAuthModalVisible(false);
    
        } catch (error) {
            // Handle error response from backend
            if (error.response) {
                setError(error.response.data.error);  // Show error from the server
            } else {
                setError("An error occurred while logging in");
            }
        }
    };

    useEffect(() => {
        const storedClubUser = localStorage.getItem('clubUser');
        if (storedClubUser) {
            setUser(JSON.parse(storedClubUser));
        }
    }, []);
    

    
    const [selectedClub, setSelectedClub] = useState(null);
    const [clubs, setClubs] = useState([
    ]);

    const [events, setEvents] = useState({});
    const [messages, setMessages] = useState({});
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [showEventForm, setShowEventForm] = useState(false);
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark" || false
      );
    const [membersList, setMembersList] = useState({});
    const [showMembers, setShowMembers] = useState(false);
    const [error, setError] = useState(null);

    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Authentication modal state
    const [authModalVisible, setAuthModalVisible] = useState(!user);
    const [authForm, setAuthForm] = useState({
        username: '',
        password: '',
        role: '',
    });

    // Event form state
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        link: '',
        image: null
    });

    useEffect(() => {
        const fetchEvents = async () => {
            if (selectedClub) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/events/${selectedClubId}`); // Make sure to pass the correct ID
                    if (response.data.success) {
                        setEvents((prev) => ({
                            ...prev,
                            [selectedClub]: response.data.data,
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching events:', error);
                }
            }
        };
    
        fetchEvents();
    }, [selectedClub]);
    

    // Effects
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);


    const handleDeleteEvent = async (event) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                const response = await axios.delete(`http://localhost:5000/api/events/${event._id}`);
                
                if (response.data.success) {
                    setEvents((prev) => ({
                        ...prev,
                        [selectedClub]: prev[selectedClub].filter(
                            (e) => e._id !== event._id
                        ),
                    }));
                    addNotification(`Event "${event.title}" deleted`);
                } else {
                    addNotification(`Failed to delete event: ${response.data.message}`, 'error');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Error deleting event';
                console.error('Error deleting event:', error);
                addNotification(errorMessage, 'error');
            }
        }
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedClub) {
            console.error('No club selected');
            return;
        }
        
        // Create the event object with proper image handling
        const newEvent = {
            ...eventForm,
            clubName: selectedClub,
            attendees: [],
            // Make sure image is already base64 encoded from the file input handler
            image: eventForm.image || null
        };
        
        try {
            const response = await axios.post('http://localhost:5000/api/events', newEvent);
            
            if (response.data.success) {
                setEvents((prev) => ({
                    ...prev,
                    [selectedClub]: [...(prev[selectedClub] || []), response.data.data],
                }));
                
                addNotification(`New event "${eventForm.title}" created for ${selectedClub}`);
                setShowEventForm(false);
                
                // Reset form fields
                setEventForm({
                    title: '',
                    description: '',
                    date: '',
                    time: '',
                    location: '',
                    link: '',
                    image: null,
                    maxAttendees: 0
                });
            } else {
                console.error('Failed to add event:', response.data.message);
                addNotification(`Failed to create event: ${response.data.message}`, 'error');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error adding event';
            console.error('Error adding event:', error);
            addNotification(errorMessage, 'error');
        }
    };
    
    
    
    
    const [isAdmin, setIsAdmin] = useState([]);
    const handleSendMessage = () => {
        if (!newMessage.trim() || !user) return;

        const message = {
            id: Date.now(),
            text: newMessage,
            sender: user.username,
            timestamp: new Date().toISOString(),
            isAdmin: isAdmin,
            attachments: [],
        };

        setMessages((prev) => ({
            ...prev,
            [selectedClub]: [...(prev[selectedClub] || []), message],
        }));
        setNewMessage("");
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (newMessage.trim()) {
                    handleSendMessage();
                }
                addNotification(`File "${file.name}" uploaded successfully`);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleJoinEvent = (eventId) => {
        if (!user) return;

        setEvents((prev) => {
            const clubEvents = [...(prev[selectedClub] || [])];
            const eventIndex = clubEvents.findIndex((e) => e.id === eventId);

            if (eventIndex !== -1) {
                const event = clubEvents[eventIndex];
                if (!event.attendees.includes(user.id)) {
                    event.attendees.push(user.id);
                    addNotification(`You've joined "${event.title}"`);
                }
            }

            return {
                ...prev,
                [selectedClub]: clubEvents,
            };
        });
    };

    const addNotification = (message) => {
        const notification = {
            id: Date.now(),
            message,
            read: false,
        };
        setNotifications((prev) => [notification, ...prev]);
    };

     
    const fetchClubs = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/clubs');
            if (response.data.success) {
                const mappedClubs = response.data.data.map(club => ({
                    id: club._id,
                    name: club.clubname,     // Mapping 'clubname' to 'name'
                    description: club.descp, // Mapping 'descp' to 'description'
                    tags: club.tags
                }));
                setClubs(mappedClubs);
                setfilteredClubs(mappedClubs);
                console.log('Fetched Clubs:', clubs);
console.log('Filtered Clubs:', filteredClubs);

            }
            else{console.log('no')}
        } catch (error) {
            console.error('Error fetching clubs:', error);
        }
    };
    
    

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setfilteredClubs(clubs); // Reset to all clubs if search term is empty
        } else {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            setfilteredClubs(clubs.filter(club => 
                club.name && club.name.toLowerCase().includes(lowercasedSearchTerm) // Check for undefined club.name
            ));
        }
    }, [searchTerm, clubs]);

      useEffect (() => {
        fetchClubs();
      }, [])

    return (
        <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white`}>
            {/* Authentication Modal */}
            {authModalVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <Card className="w-96">
                        <CardHeader>
                            <CardTitle>Login</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAuth} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className="w-full p-2 border rounded dark:bg-gray-800"
                                    value={authForm.username}
                                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full p-2 border rounded dark:bg-gray-800"
                                    value={authForm.password}
                                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                                />
                                <select
                                    className="w-full p-2 border rounded dark:bg-gray-800"
                                    value={authForm.role}
                                    onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                                >
                                    <option value="">Select Role</option>
                                    <option value="admin">Admin</option>
                                    <option value="student">Student</option>
                                </select>
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <button
                                    type="submit"
                                    className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Login
                                </button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Layout */}
            <div className="flex">
                {/* Sidebar */}
                <div className="w-1/4 h-screen bg-gray-200 dark:bg-gray-800 p-4 space-y-4 overflow-y-auto">
                    {user && (
                        <div className="flex items-center space-x-2 mb-6">
                            <Avatar>
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
                                <AvatarFallback>{user.username[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{user.username}</p>
                                <p className="text-sm text-gray-500">{user.role}</p>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search clubs..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:bg-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Clubs List */}
                    <div className="space-y-2">
                        {filteredClubs.map((club) => (
                            <div
                                key={club.id}
                                onClick={() => setSelectedClub(club.name)}
                                className={`p-3 rounded-lg cursor-pointer transition-all ${
                                    selectedClub === club.name
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                            >
                                <div className="font-medium">{club.name}</div>
                                <div className="text-sm opacity-75">{club.description}</div>
                                <div className="flex mt-2 space-x-2">
                                    {club.tags.map((tag) => (
                                        <span key={tag} className="text-xs px-2 py-1 bg-black bg-opacity-20 rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Admin Controls */}
                    {isAdmin && (
    <div className="space-y-2">
        {selectedClub && (
                    <button onClick={() => setShowEventForm(true)} className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 flex items-center justify-center space-x-2">
                        <PlusIcon size={16} />
                        <span>Add Event</span>
                    </button>
                )}
            </div>
)}
</div>




                                {/* Main Content */}
                                <div className="flex-1 p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">{selectedClub || 'Welcome to Club Spaces'}</h1>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                <BellIcon />
                                {notifications.some((n) => !n.read) && (
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-4 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50">
                            <div className="p-4">
                                <h3 className="font-medium mb-2">Notifications</h3>
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-2 ${notification.read ? 'opacity-50' : ''}`}
                                        >
                                            {notification.message}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No notifications</p>
                                )}
                            </div>
                        </div>
                    )}

{selectedClub ? (
    <div className="space-y-6">
        {/* Events Section */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Events</span>
                    <button
                        onClick={() => setShowMembers(!showMembers)}
                        className="flex items-center space-x-2 text-sm font-normal"
                    >
                        <UserIcon size={16} />
                        <span>{membersList[selectedClub]?.length || 0} members</span>
                    </button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events[selectedClub]?.map((event) => (
                        <Card key={event._id}>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold">{event.title}</h3>
                                    {isAdmin && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setEditingEvent(event)}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                            >
                                                <EditIcon size={16} />
                                            </button>
                                            <button
    onClick={() => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            handleDeleteEvent(event);
        }
    }}
    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"
>
    <TrashIcon size={16} />
</button>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 space-y-2">
                                    <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <CalendarIcon size={14} />
                                        <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        <span>Location: {event.location}</span>
                                    </div>
                                    {event.image && (
                                        <img
                                            src={event.image}
                                            alt="Event Poster"
                                            className="w-full h-48 object-cover rounded-lg mt-2"
                                        />
                                    )}
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-sm">
                                            {event.attendees?.length || 0}/{event.maxAttendees} attendees
                                        </span>
                                        <button
                                            onClick={() => handleJoinEvent(event._id)} // Use _id for joining
                                            disabled={event.attendees?.includes(user?.id)}
                                            className={`px-4 py-2 rounded-lg ${
                                                event.attendees?.includes(user?.id)
                                                    ? 'bg-gray-300 cursor-not-allowed'
                                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                            }`}
                                        >
                                            {event.attendees?.includes(user?.id) ? 'Joined' : 'Join Event'}
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>


                            {/* Chat Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Club Chat</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-96 flex flex-col">
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {messages[selectedClub]?.map((message) => (
                                                <div
                                                    key={message.id}
                                                    className={`flex items-start space-x-2 ${
                                                        message.sender === user?.username ? 'justify-end' : ''
                                                    }`}
                                                >
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage
                                                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.sender}`}
                                                        />
                                                        <AvatarFallback>{message.sender[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div
                                                        className={`max-w-[70%] rounded-lg p-3 ${
                                                            message.sender === user?.username
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-200 dark:bg-gray-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium">{message.sender}</span>
                                                            <span className="text-xs opacity-75">
                                                                {new Date(message.timestamp).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                        <p>{message.text}</p>
                                                        {message.attachments?.map((attachment, index) => (
                                                            <div key={index} className="mt-2">
                                                                <a
                                                                    href={attachment.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm underline"
                                                                >
                                                                    {attachment.name}
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={chatEndRef} />
                                        </div>
                                        <div className="p-4 border-t dark:border-gray-700">
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                    placeholder="Type a message..."
                                                    className="flex-1 p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <UploadIcon size={20} />
                                                </button>
                                                <button
                                                    onClick={handleSendMessage}
                                                    disabled={!newMessage.trim()}
                                                    className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <SendIcon size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold mb-4">Welcome to Club Spaces!</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Select a club from the sidebar to view events and join discussions.
                            </p>
                        </div>
                    )}
                </div>
            </div>

           {/* Event Form Modal */}
{showEventForm && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <Card className="w-[600px]">
            <CardHeader>
                <CardTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleEventSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Event Title"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        className="w-full p-2 border rounded dark:bg-gray-800"
                        required
                    />
                    <textarea
                        placeholder="Event Description"
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        className="w-full p-2 border rounded dark:bg-gray-800 h-32"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="date"
                            value={eventForm.date}
                            onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-gray-800"
                            required
                        />
                        <input
                            type="time"
                            value={eventForm.time}
                            onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                            className="w-full p-2 border rounded dark:bg-gray-800"
                            required
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Location"
                        value={eventForm.location}
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                        className="w-full p-2 border rounded dark:bg-gray-800"
                        required
                    />
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Event Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        const base64String = reader.result
                                            .replace('data:', '')
                                            .replace(/^.+,/, '');
                                        setEventForm(prev => ({
                                            ...prev,
                                            image: base64String
                                        }));
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                            className="w-full p-2 border rounded dark:bg-gray-800"
                        />
                        {eventForm.image && (
                            <div className="mt-2">
                                <img
                                    src={`data:image/jpeg;base64,${eventForm.image}`}
                                    alt="Event preview"
                                    className="w-full h-32 object-cover rounded"
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowEventForm(false);
                                setEditingEvent(null);
                                setEventForm({
                                    title: '',
                                    description: '',
                                    date: '',
                                    time: '',
                                    location: '',
                                    link: '',
                                    image: null,
                                   
                                });
                            }}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            {editingEvent ? 'Update Event' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
)}
        </div>
    );
};

export default ClubInteractionSpaces;



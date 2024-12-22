import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpenIcon, UsersIcon, UniversityIcon, SunIcon, MoonIcon, UserIcon, HeartIcon, MessageCircleIcon, PlusIcon, XIcon } from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import logo from "../assets/UniVerse.png";

const HomePage = () => {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);
    const [feed, setFeed] = useState([]);
    const [likes, setLikes] = useState({});
    const [comments, setComments] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostImage, setNewPostImage] = useState("");
    const [newPostDescription, setNewPostDescription] = useState("");

    // Load theme and sample posts on first mount
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setDarkMode(savedTheme === "dark");
            document.documentElement.classList.toggle("dark", savedTheme === "dark");
        }
        const initialPosts = [
            {
                id: 1,
                title: "CodeRIT Hackathon",
                image: "https://via.placeholder.com/600x300?text=Hackathon",
                description: "Join us for an intense 24-hour coding challenge!",
                link: "https://coderit-hackathon.com",
                likes: 0,
                timestamp: moment().subtract(2, "hours").toISOString(),
            },
            {
                id: 2,
                title: "STARDUST Antenna Workshop",
                image: "https://via.placeholder.com/600x300?text=Antenna+Workshop",
                description: "Learn to build antennas with industry experts.",
                link: "https://stardust-workshop.com",
                likes: 0,
                timestamp: moment().subtract(1, "day").toISOString(),
            },
            {
                id: 3,
                title: "IEEE CS Guest Lecture",
                image: "https://via.placeholder.com/600x300?text=Guest+Lecture",
                description: "Explore AI and ML trends in the industry.",
                link: "https://ieee-cs-guest-lecture.com",
                likes: 0,
                timestamp: moment().subtract(3, "days").toISOString(),
            },
        ];
        setFeed(initialPosts);
        const initialComments = initialPosts.reduce((obj, post) => {
            obj[post.id] = [];
            return obj;
        }, {});
        setComments(initialComments);
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("theme", newMode ? "dark" : "light");
        document.documentElement.classList.toggle("dark", newMode);
    };

    const handleLike = (postId) => {
        setFeed((prevFeed) =>
            prevFeed.map((post) => {
                if (post.id === postId) {
                    return { ...post, likes: post.likes + 1 };
                }
                return post;
            })
        );
        setLikes((prevLikes) => ({ ...prevLikes, [postId]: true }));
    };

    const handleAddComment = (postId, commentText) => {
        if (!commentText) return;
        setComments((prevComments) => ({
            ...prevComments,
            [postId]: [
                ...prevComments[postId],
                { id: Date.now(), text: commentText, timestamp: moment().toISOString() },
            ],
        }));
    };

    const handleCreatePost = () => {
        if (!newPostTitle || !newPostDescription) return;
        const nextId = feed.length ? Math.max(...feed.map((p) => p.id)) + 1 : 1;
        const newPost = {
            id: nextId,
            title: newPostTitle,
            image: newPostImage || "https://via.placeholder.com/600x300?text=New+Post",
            description: newPostDescription,
            link: "#",
            likes: 0,
            timestamp: moment().toISOString(),
        };
        setFeed((prevFeed) => [newPost, ...prevFeed]);
        
        // Clear form and close modal
        setNewPostTitle("");
        setNewPostDescription("");
        setNewPostImage("");
        setIsModalOpen(false);
    };

    return (
        <div className={`min-h-screen ${darkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <img src={logo} alt="UniVerse Logo" className="w-40 h-auto rounded-2xl border-2 border-white/10" />
                    <div className="flex items-center space-x-4">
                        <motion.button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none" aria-label="Toggle Dark Mode">
                            {darkMode ? <SunIcon className="text-yellow-500" /> : <MoonIcon className="text-blue-600" />}
                        </motion.button>
                        <motion.button onClick={() => navigate("/profile")} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none" aria-label="Go to Profile">
                            <UserIcon className="text-gray-800 dark:text-gray-200" />
                        </motion.button>
                        <motion.button onClick={() => setIsModalOpen(true)} className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none" aria-label="Create New Post">
                            <PlusIcon size={20} />
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* Navigation Section Above Feed */}
            <div className="container mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.button
        onClick={() => navigate("/education")}
        className="flex items-center justify-center bg-blue-500 text-white rounded-xl p-4 shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl"
        whileHover={{ scale: 1.05 }}
    >
        <BookOpenIcon className="mr-2" /> {/* Icon for Education */}
        Education
    </motion.button>
    <motion.button
        onClick={() => navigate("/socials")}
        className="flex items-center justify-center bg-green-500 text-white rounded-xl p-4 shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl"
        whileHover={{ scale: 1.05 }}
    >
        <UsersIcon className="mr-2" /> {/* Icon for Socials */}
        Socials
    </motion.button>
    <motion.button
        onClick={() => navigate("/college-life")}
        className="flex items-center justify-center bg-pink-500 text-white rounded-xl p-4 shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl"
        whileHover={{ scale: 1.05 }}
    >
        <UniversityIcon className="mr-2" /> {/* Icon for College Life */}
        College Life
    </motion.button>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-center">
                    <div className="max-w-2xl w-full space-y-6">
                        {feed.map((post) => (
                            <div key={post.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                                <img src={post.image} alt={post.description} className="w-full object-cover max-h-60 cursor-pointer" />
                                <div className="p-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-lg font-bold dark:text-gray-100">{post.title}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{moment(post.timestamp).fromNow()}</p>
                                    </div>
                                    <p className="mt-2 dark:text-gray-200">{post.description}</p>
                                    {post.link && post.link !== "#" && (
                                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="block mt-4 text-blue-500 dark:text-blue-400 hover:underline">More Details</a>
                                    )}
                                    <div className="flex items-center justify-between mt-4">
                                        <button onClick={() => handleLike(post.id)} className={`flex items-center text-sm font-medium ${likes[post.id] ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-300"}`}>
                                            <HeartIcon className="mr-1 w-5 h-5" />{post.likes} Likes
                                        </button>
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {
                                            const commentText = prompt("Enter your comment:");
                                            handleAddComment(post.id, commentText);
                                        }} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray300 dark:hover:text-gray200 focus:outline-none" aria-label="Add Comment">
                                            <MessageCircleIcon className="mr -1 w -5 h -5" /> Comments ({comments[post.id]?.length || 0})
                                        </motion.button>
                                    </div>
                                    {comments[post.id] && comments[post.id].length > 0 && (
                                        <div className="mt -4 space-y -2">
                                            {comments[post.id].map((c) => (
                                                <div key={c.id} className="text-sm p -2 bg-gray -100 dark:bg-gray -700 rounded dark:textgray -200">
                                                    <p>{c.text}</p>
                                                    <p className="text-xs text-gray -500 dark:textgray -400 mt -1">{moment(c.timestamp).fromNow()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray -100 dark:bggray -800 py -6 mt -8 text-center">
                <p className="text-sm textgray -500 dark:textgray -400">© {new Date().getFullYear()} Ramaiah Institute of Technology Social Platform</p>
            </footer>

            {/* New Post Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            className="fixed inset -0 bg-black bg-opacity -50 z -50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            aria-hidden="true"
                        />
                        {/* Modal Content */}
                        <motion.div
                            className="fixed inset -0 flex items-center justify-center z -50"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            aria-modal="true"
                            role="dialog"
                        >
                            <div className="bg-white dark:bggray -800 rounded-lg shadow-lg w -11/12 max-w-md p -6 relative">
                                {/* Close Button */}
                                <button onClick={() => setIsModalOpen(false)} className="absolute top -3 right -3 textgray -500 dark:textgray -300 hover:textgray -700 dark:hover:textgray -100 focus:outline-none" aria-label="Close Modal">
                                    <XIcon size={20} />
                                </button>
                                <h2 className="text-xl font-bold mb -4 dark:textgray -100">Create a New Post</h2>
                                <div className="space-y -4">
                                    <input
                                        className="w-full p -2 rounded border bordergray -200 dark:bordergray -700 bggray -50 dark:bggray -700 dark:textgray -200 focus:outline-none"
                                        placeholder="Post Title"
                                        value={newPostTitle}
                                        onChange={(e) => setNewPostTitle(e.target.value)}
                                    />
                                    <input
                                        className="w-full p -2 rounded border bordergray -200 dark:bordergray -700 bggray -50 dark:bggray -700 dark:textgray -200 focus:outline-none"
                                        placeholder="Image URL (optional)"
                                        value={newPostImage}
                                        onChange={(e) => setNewPostImage(e.target.value)}
                                    />
                                    <textarea
                                        className="w-full p -2 rounded border bordergray -200 dark:bordergray -700 bggray -50 dark:bggray -700 dark:textgray -200 focus:outline-none"
                                        placeholder="Post Description"
                                        rows={3}
                                        value={newPostDescription}
                                        onChange={(e) => setNewPostDescription(e.target.value)}
                                    />
                                    <button
                                        onClick={handleCreatePost}
                                        className="
                                            w-full px -
                                            4 py -
                                            2 bg-blue -
                                            600 text-white font-semibold rounded hover:bg-blue -
                                            700 transition-colors
                                          "
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HomePage;

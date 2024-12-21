// HomePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpenIcon,
  UsersIcon,
  UniversityIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  HeartIcon,
  MessageCircleIcon,
  PlusIcon,
  XIcon,
  SearchIcon,
} from "lucide-react"; // Ensure all icons used are available in lucide-react
import Confetti from "react-confetti";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import logo from "../assets/UniVerse.png"; // Adjust the path based on your file structure

const HomePage = () => {
  const navigate = useNavigate();

  // Dark Mode
  const [darkMode, setDarkMode] = useState(false);

  // Feed & Posts
  const [feed, setFeed] = useState([]);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [confetti, setConfetti] = useState({ id: null, active: false });

  // New Post Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [newPostDescription, setNewPostDescription] = useState("");
  const [newPostTags, setNewPostTags] = useState("");

  // Removed Insights Modal States

  // Used for measuring confetti size
  const confettiRef = useRef(null);

  const sections = [
    {
      id: "education",
      title: "Education",
      icon: BookOpenIcon,
      description: "Collaborative learning ecosystem with AI-powered tools",
      color: "bg-gradient-to-br from-blue-500 to-indigo-600",
    },
    {
      id: "socials",
      title: "Socials",
      icon: UsersIcon,
      description: "Connect, discover, and engage with your community",
      color: "bg-gradient-to-br from-green-500 to-teal-600",
    },
    {
      id: "college-life",
      title: "College Life",
      icon: UniversityIcon,
      description: "Dynamic platform for campus experiences",
      color: "bg-gradient-to-br from-pink-500 to-purple-600",
    },
    {
      id: "insights",
      title: "Insights",
      icon: HeartIcon,
      description: "Discover and validate the best academic and professional resources",
      color: "bg-gradient-to-br from-yellow-500 to-orange-600",
      external: true, // Custom flag to indicate external link
      url: "https://insights.surf/", // External URL
    },
  ];

  // Load theme and sample posts on first mount
  useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }

    // Load sample feed
    const initialPosts = [
      {
        id: 1,
        title: "CodeRIT Hackathon",
        image: "https://via.placeholder.com/600x300?text=Hackathon",
        description: "Join us for an intense 24-hour coding challenge!",
        link: "https://coderit-hackathon.com",
        likes: 0,
        tags: ["Hackathon", "Coding"],
        timestamp: moment().subtract(2, "hours").toISOString(),
      },
      {
        id: 2,
        title: "STARDUST Antenna Workshop",
        image: "https://via.placeholder.com/600x300?text=Antenna+Workshop",
        description: "Learn to build antennas with industry experts.",
        link: "https://stardust-workshop.com",
        likes: 0,
        tags: ["Workshop", "Space"],
        timestamp: moment().subtract(1, "day").toISOString(),
      },
      {
        id: 3,
        title: "IEEE CS Guest Lecture",
        image: "https://via.placeholder.com/600x300?text=Guest+Lecture",
        description: "Explore AI and ML trends in the industry.",
        link: "https://ieee-cs-guest-lecture.com",
        likes: 0,
        tags: ["AI", "Machine Learning", "Lecture"],
        timestamp: moment().subtract(3, "days").toISOString(),
      },
    ];
    setFeed(initialPosts);

    // Initialize comments
    const initialComments = initialPosts.reduce((obj, post) => {
      obj[post.id] = [];
      return obj;
    }, {});
    setComments(initialComments);
  }, []);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newMode);
  };

  // Handle Like
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

  // Handle Add Comment
  const handleAddComment = (postId, commentText) => {
    if (!commentText) return;
    setComments((prevComments) => ({
      ...prevComments,
      [postId]: [
        ...prevComments[postId],
        {
          id: Date.now(),
          text: commentText,
          timestamp: moment().toISOString(),
        },
      ],
    }));
  };

  // Handle Create Post
  const handleCreatePost = () => {
    if (!newPostTitle || !newPostDescription) return; // Basic validation

    const nextId = feed.length ? Math.max(...feed.map((p) => p.id)) + 1 : 1;
    const postTags = newPostTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const newPost = {
      id: nextId,
      title: newPostTitle,
      image: newPostImage || "https://via.placeholder.com/600x300?text=New+Post",
      description: newPostDescription,
      link: "#",
      likes: 0,
      tags: postTags,
      timestamp: moment().toISOString(),
    };

    setFeed((prevFeed) => [newPost, ...prevFeed]);
    setLikes((prevLikes) => ({ ...prevLikes, [nextId]: false }));
    setComments((prevComments) => ({ ...prevComments, [nextId]: [] }));

    // Clear form and close modal
    setNewPostTitle("");
    setNewPostDescription("");
    setNewPostImage("");
    setNewPostTags("");
    setIsModalOpen(false);
  };

  return (
    <div
      ref={confettiRef}
      className={`min-h-screen ${
        darkMode ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt="UniVerse Logo"
              className="w-40 h-auto rounded-2xl border-2 border-white/10"
            />
          </div>

          {/* Navigation Links with Styled Buttons */}
          <nav className="hidden lg:flex space-x-4">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => {
                  if (section.external && section.url) {
                    window.open(section.url, "_blank", "noopener,noreferrer");
                  } else {
                    navigate(`/${section.id}`);
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${section.color} text-white rounded-xl p-2 flex items-center space-x-2 shadow-lg transition-transform focus:outline-none`}
              >
                <section.icon size={20} />
                <span className="font-semibold">{section.title}</span>
              </motion.button>
            ))}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <motion.button
              onClick={toggleDarkMode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 
                        hover:bg-gray-200 dark:hover:bg-gray-700 
                        transition-colors focus:outline-none"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                <SunIcon className="text-yellow-500" />
              ) : (
                <MoonIcon className="text-blue-600" />
              )}
            </motion.button>

            {/* Profile Button */}
            <motion.button
              onClick={() => navigate("/profile")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 
                        hover:bg-gray-200 dark:hover:bg-gray-700 
                        transition-colors focus:outline-none"
              aria-label="Go to Profile"
            >
              <UserIcon className="text-gray-800 dark:text-gray-200" />
            </motion.button>

            {/* "+" Button to Open Modal */}
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-blue-600 text-white 
                        hover:bg-blue-700 transition-colors focus:outline-none"
              aria-label="Create New Post"
            >
              <PlusIcon size={20} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="rounded-xl shadow p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <img
                  src="https://via.placeholder.com/64?text=User"
                  alt="User"
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-lg font-bold dark:text-gray-100">
                    Abhay Bhandarkar
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    @absbhandarkar
                  </p>
                </div>
              </div>
              <hr className="my-4 border-gray-200 dark:border-gray-700" />
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>Major: Computer Science</p>
                <p>Year: Senior</p>
                <p>Member of: IEEE CS, STARDUST</p>
              </div>
            </div>

            {/* Announcements */}
            <div className="rounded-xl shadow p-4 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                Announcements
              </h2>
              <ul className="space-y-2 text-sm dark:text-gray-300">
                <li>• Mid-Term Exams start next Monday.</li>
                <li>• Tech Fest registrations open (Jan 20).</li>
                <li>• AI Workshop by visiting alumni (Jan 25).</li>
              </ul>
            </div>
          </aside>

          {/* CENTER CONTENT */}
          <div className="col-span-1 lg:col-span-2">
            {/* Feed */}
            <div className="max-w-2xl mx-auto space-y-6">
              {feed.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
                  onDoubleClick={() => {
                    if (!likes[post.id]) handleLike(post.id);
                    setConfetti({ id: post.id, active: true });
                    setTimeout(
                      () => setConfetti({ id: null, active: false }),
                      1500
                    );
                  }}
                >
                  {confetti.id === post.id && confetti.active && (
                    <Confetti
                      recycle={false}
                      numberOfPieces={200}
                      width={confettiRef.current?.clientWidth}
                      height={confettiRef.current?.clientHeight}
                    />
                  )}
                  {/* Post Image */}
                  <img
                    src={post.image}
                    alt={post.description}
                    className="w-full object-cover max-h-60 cursor-pointer"
                  />
                  {/* Post Content */}
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold dark:text-gray-100">
                        {post.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {moment(post.timestamp).fromNow()}
                      </p>
                    </div>
                    <p className="mt-2 dark:text-gray-200">{post.description}</p>
                    {/* Tags */}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.map((tag, index) => (
                          <span
                            key={`${post.id}-tag-${index}`}
                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full dark:bg-blue-900/30"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Link */}
                    {post.link && post.link !== "#" && (
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-4 text-blue-500 dark:text-blue-400 hover:underline"
                      >
                        More Details
                      </a>
                    )}
                    {/* Like & Comment */}
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={() => {
                          if (!likes[post.id]) handleLike(post.id);
                        }}
                        className={`flex items-center text-sm font-medium ${
                          likes[post.id]
                            ? "text-red-500 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-300"
                        }`}
                      >
                        <HeartIcon className="mr-1 w-5 h-5" />
                        {post.likes} Likes
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const commentText = prompt("Enter your comment:");
                          handleAddComment(post.id, commentText);
                        }}
                        className="flex items-center text-sm font-medium text-gray-500 
                                   hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none"
                        aria-label="Add Comment"
                      >
                        <MessageCircleIcon className="mr-1 w-5 h-5" />
                        Comments ({comments[post.id]?.length || 0})
                      </motion.button>
                    </div>
                    {/* Display Comments */}
                    {comments[post.id] && comments[post.id].length > 0 && (
                      <div className="mt-4 space-y-2">
                        {comments[post.id].map((c) => (
                          <div
                            key={c.id}
                            className="text-sm p-2 bg-gray-100 dark:bg-gray-700 
                                       rounded dark:text-gray-200"
                          >
                            <p>{c.text}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {moment(c.timestamp).fromNow()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden lg:block col-span-1 space-y-6">
            {/* Trending Topics */}
            <div className="rounded-xl shadow p-4 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                Trending Topics
              </h2>
              <div className="space-y-2 text-sm dark:text-gray-300">
                <p>• #AIRevolution</p>
                <p>• #CampusFest2024</p>
                <p>• #HackTheFuture</p>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="rounded-xl shadow p-4 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                Upcoming Events
              </h2>
              <ul className="space-y-2 text-sm dark:text-gray-300">
                <li>• Jan 5: Python Bootcamp</li>
                <li>• Jan 12: Industrial Visit</li>
                <li>• Jan 20: RIT Cultural Night</li>
                <li>• Feb 1: Job Fair & Internship Drive</li>
              </ul>
            </div>

            {/* Quick Links / Ads / Etc. */}
            {/* Quick Links / Ads / Etc. */}
<div className="rounded-xl shadow p-4 bg-white dark:bg-gray-800">
  <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
    Quick Links
  </h2>
  <ul className="space-y-2 text-sm dark:text-gray-300">
    <li>
      <a
        href="https://www.msritlibrary.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-blue-500 dark:hover:text-blue-400"
      >
        Library Portal
      </a>
    </li>
    <li>
      <a
        href="https://exam.msrit.edu/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-blue-500 dark:hover:text-blue-400"
      >
        Exam Results
      </a>
    </li>
    <li>
      <a
        href="https://msrit.edu/placement.html"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-blue-500 dark:hover:text-blue-400"
      >
        Placement Cell
      </a>
    </li>
    <li>
      <a
        href="https://www.msrit.edu/support/cocurricular.html"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-blue-500 dark:hover:text-blue-400"
      >
        Clubs & Societies
      </a>
    </li>
  </ul>
</div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-6 mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Ramaiah Institute of Technology Social
          Platform
        </p>
      </footer>

      {/* New Post Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              aria-hidden="true"
            />

            {/* Modal Content */}
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              aria-modal="true"
              role="dialog"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 max-w-md p-6 relative">
                {/* Close Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 focus:outline-none"
                  aria-label="Close Modal"
                >
                  <XIcon size={20} />
                </button>

                <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
                  Create a New Post
                </h2>
                <div className="space-y-4">
                  <input
                    className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 
                               bg-gray-50 dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
                    placeholder="Post Title"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                  <input
                    className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 
                               bg-gray-50 dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
                    placeholder="Image URL (optional)"
                    value={newPostImage}
                    onChange={(e) => setNewPostImage(e.target.value)}
                  />
                  <textarea
                    className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 
                               bg-gray-50 dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
                    placeholder="Post Description"
                    rows={3}
                    value={newPostDescription}
                    onChange={(e) => setNewPostDescription(e.target.value)}
                  />
                  <input
                    className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 
                               bg-gray-50 dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
                    placeholder="Tags (comma-separated)"
                    value={newPostTags}
                    onChange={(e) => setNewPostTags(e.target.value)}
                  />
                  <button
                    onClick={handleCreatePost}
                    className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded 
                               hover:bg-blue-700 transition-colors"
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

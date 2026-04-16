import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Heart, MessageCircle, Share2, X, LogOut, Camera, UserPlus, UserCircle, CheckCircle, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import image from './image.png'
import Notifications from "../Notification/Notifications";

const StudentDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [addingUserId, setAddingUserId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [filter, setFilter] = useState("all"); // all, enrolled
  const profileDropdownRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const openEventDetailsModal = (event) => {
    setSelectedEventDetails(event);
    setEventDetailsOpen(true);
  };

  const closeEventDetailsModal = () => {
    setSelectedEventDetails(null);
    setEventDetailsOpen(false);
  };

  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    photoUrl: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showMoreSuggestions, setShowMoreSuggestions] = useState(false);
  const observer = useRef();
  const eventIds = useRef(new Set());
  const navigate = useNavigate();

  // Fetch Events
  const fetchEvents = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.get( `${API_BASE_URL}/api/event/getevent?page=${page}`, {
        headers: { "x-auth-token": localStorage.getItem("token") },
      });
      if (res.data.length === 0) {
        setHasMore(false);
      } else {
        const uniqueEvents = res.data.filter((event) => !eventIds.current.has(event._id));
        uniqueEvents.forEach((event) => eventIds.current.add(event._id));
        setEvents((prevEvents) => [...prevEvents, ...uniqueEvents]);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Suggestions
  const fetchSuggestions = async () => {
  try {
    const res = await axios.get( `${API_BASE_URL}/api/user/suggestions`, { // Use relative path for Vercel
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    const currentUserId = localStorage.getItem("userId");
    // Map photo to photoUrl to match frontend expectation
    const filteredUsers = res.data
      .filter(user => user._id !== currentUserId)
      .map(user => ({
        ...user,
        photoUrl: user.photo?.replace('via.placeholder.com', 'placehold.co') || user.photo, // Replace via.placeholder.com with placehold.co
      }));
    console.log("📌 Fetched suggestions:", filteredUsers); // Debug log
    setSuggestions(filteredUsers);
  } catch (err) {
    console.error("Error fetching suggestions:", err);
  }
};
  useEffect(() => {
    fetchEvents();
    fetchSuggestions();
  }, [page]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const observerCallback = (entries) => {
      if (entries[0].isIntersecting) {
        setPage((prevPage) => prevPage + 1);
      }
    };
    observer.current = new IntersectionObserver(observerCallback, { threshold: 0.5 });
    return () => observer.current && observer.current.disconnect();
  }, [loading, hasMore]);

  // Like Handler
  const handleLike = async (eventId) => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId || !token) return;
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event._id === eventId
          ? {
              ...event,
              likes: event.likes.includes(userId)
                ? event.likes.filter((id) => id !== userId)
                : [...event.likes, userId],
            }
          : event
      )
    );
    try {
      await axios.post(
         `${API_BASE_URL}/api/stat/like/${eventId}`,
        { userId },
        { headers: { "x-auth-token": token } }
      );
    } catch (err) {
      console.error("Error liking event:", err);
    }
  };

  // Enroll Handler
  const handleEnroll = async (eventId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/event/${eventId}/enroll`,
        {},
        { headers: { "x-auth-token": token } }
      );
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId ? res.data : event
        )
      );
    } catch (err) {
      console.error("Error enrolling in event:", err);
      console.error("Error response:", err.response?.data);
      alert(err.response?.data?.msg || "Failed to enroll");
    }
  };

  // Unenroll Handler
  const handleUnenroll = async (eventId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      console.log("Unenrolling from event:", eventId);
      const res = await axios.post(
        `${API_BASE_URL}/api/event/${eventId}/unenroll`,
        {},
        { headers: { "x-auth-token": token } }
      );
      console.log("Unenroll response:", res.data);
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId ? res.data : event
        )
      );
    } catch (err) {
      console.error("Error unenrolling from event:", err);
      console.error("Error response:", err.response?.data);
      alert(err.response?.data?.msg || "Failed to unenroll");
    }
  };

  // Comment Handler
  const handleComment = async (eventId) => {
    const text = commentInputs[eventId]?.trim();
    if (!text) return;
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId || !token) return;
    const photoUrl = userProfile.photoUrl || "";
    const newComment = {
      userId,
      text,
      date: new Date(),
      photo: photoUrl,
    };
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event._id === eventId
          ? { ...event, comments: [...event.comments, newComment] }
          : event
      )
    );
    setCommentInputs((prev) => ({ ...prev, [eventId]: "" }));
    try {
      await axios.post(
        `${API_BASE_URL}/api/stat/comment/${eventId}`,
        { userId, text, photo: photoUrl },
        { headers: { "x-auth-token": token } }
      );
    } catch (err) {
      console.error("Error commenting on event:", err);
    }
  };

  // Open Comment Modal
  const openCommentsModal = (event) => {
    setSelectedEvent(event);
    setCommentsModalOpen(true);
  };

  // Close Comment Modal
  const closeCommentsModal = () => {
    setCommentsModalOpen(false);
    setSelectedEvent(null);
  };

  // Toggle Profile Dropdown
  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Edit Profile Modal Toggle
  const toggleEditProfileModal = () => {
    setIsEditProfileOpen(!isEditProfileOpen);
  };

  // Fetch User Profile Info
  const fetchUserProfile = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId || !token) return;
    try {
      const res = await axios.get( `${API_BASE_URL}/api/user/details`, {
        headers: { "x-auth-token": token },
      });
      setUserProfile(res.data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logout Handler
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Handle Profile Update
  const handleProfileUpdate = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setProfileLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/user/details`,
        {
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
        },
        { headers: { "x-auth-token": token } }
      );
      setUserProfile(res.data);
      toggleEditProfileModal();
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Profile Photo Upload
  const handleProfilePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("photo", file);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/user/update-photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUserProfile((prev) => ({ ...prev, photoUrl: res.data.user.photo }));
    } catch (err) {
      console.error("Error updating profile photo:", err);
    }
  };


  // Add User to Connections
  const handleAddUser = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }
    setAddingUserId(userId);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/user/add-connection/${userId}`,
        {},
        { headers: { "x-auth-token": token } }
      );
      setSuccessMessage("User added successfully!");
      fetchSuggestions();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error adding user:", err);
      alert("Failed to add user. Please try again.");
    } finally {
      setAddingUserId(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-xl border-b border-purple-100 shadow-sm flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            AKEvent
          </span>
        </div>

        <div className="hidden md:flex flex-1 justify-center mx-4 lg:mx-6">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search events..."
              className="w-full px-4 py-2 pl-10 bg-gray-200 border border-gray-200 rounded-full placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all shadow-sm hover:bg-gray-100 text-sm text-gray-700 "
            />
            <svg
              className="absolute left-3 top-2.5 text-gray-400 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Notifications userId={localStorage.getItem("userId")} />
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center gap-2 hover:bg-gray-200 p-2 rounded-full transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 overflow-hidden shadow-md">
                {userProfile.photoUrl ? (
                  <img src={userProfile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="flex items-center justify-center h-full text-lg font-bold text-white-800">
                    {userProfile.firstName[0]}{userProfile.lastName[0]}
                  </span>
                )}
              </div>
              <span className="hidden md:inline-block font-semibold text-gray-200 ">
                {userProfile.firstName}
              </span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 shadow-xl rounded-lg text-gray-800 z-[100]">
                <button
                  onClick={toggleEditProfileModal}
                  className="block w-full px-4 py-2 hover:bg-gray-100 text-left transition-all"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 hover:bg-gray-100 text-left transition-all flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN FEED */}
      <main className="pt-20 pb-8 flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 lg:pr-80 xl:pr-96">
        <div className="max-w-3xl mx-auto">
          {successMessage && (
            <div className="fixed top-24 right-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg shadow-lg z-50 flex items-center animate-fade-in">
              <CheckCircle size={20} className="mr-2" /> {successMessage}
            </div>
          )}

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter("enrolled")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "enrolled"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Enrolled Events
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {events
            .filter((event) => {
              const userId = localStorage.getItem("userId");
              if (filter === "enrolled") {
                return event.enrolled && event.enrolled.includes(userId);
              }
              return true;
            })
            .map((event, index) => (
            <div
              key={event._id}
              ref={index === events.length - 1 ? observer : null}
              onClick={() => openEventDetailsModal(event)}
              className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5"
            >
              <img
                src={event.thumbnail || "https://placehold.co/500x300?text=Event+Image"}
                alt={event.title}
                className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover rounded-lg mb-4"
              />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{event.title}</h2>
              <p className="text-gray-600 mt-2 line-clamp-2 text-sm sm:text-base">{event.description}</p>

              <div className="mt-4 flex justify-between text-gray-600 text-sm sm:text-base">
                <button
                  onClick={(e) => { e.stopPropagation(); handleLike(event._id); }}
                  className={`flex items-center gap-1 hover:text-red-500 transition-colors ${event.likes.includes(localStorage.getItem("userId")) ? "text-red-500" : ""}`}
                >
                  <Heart size={18} className="sm:w-5 sm:h-5" /> {event.likes.length}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); openCommentsModal(event); }}
                  className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                >
                  <MessageCircle size={18} className="sm:w-5 sm:h-5" /> {event.comments.length}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (event.enrolled && event.enrolled.includes(localStorage.getItem("userId"))) {
                      handleUnenroll(event._id);
                    } else {
                      handleEnroll(event._id);
                    }
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md hover:bg-purple-100 transition-colors ${event.enrolled && event.enrolled.includes(localStorage.getItem("userId")) ? "bg-purple-100 text-purple-600" : ""}`}
                >
                  <UserCheck size={18} className="sm:w-5 sm:h-5" /> {event.enrolled ? event.enrolled.length : 0}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                    setShareUrl(`${window.location.origin}/event/${event._id}`);
                    setShareModalOpen(true);
                  }}
                  className="flex items-center gap-1 hover:text-green-500 transition-colors"
                >
                  <Share2 size={18} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          ))}
          {loading && <p className="text-gray-500 text-center">Loading more events...</p>}
          {!hasMore && !loading && (
            <p className="text-gray-500 text-center">No more events available.</p>
          )}
          </div>
        </div>

        {/* Event Details Modal */}
        {eventDetailsOpen && selectedEventDetails && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-2xl w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto relative">
              <button
                onClick={closeEventDetailsModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Event Details</h3>
              <img
                src={selectedEventDetails.thumbnail || "https://placehold.co/500x300?text=Event+Image"}
                alt={selectedEventDetails.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{selectedEventDetails.title}</h2>
              <p className="text-gray-600 mb-4">{selectedEventDetails.description}</p>
              <p className="text-gray-700 mb-2"><span className="font-semibold">Date:</span> {selectedEventDetails.date || "N/A"}</p>
              <p className="text-gray-700 mb-2"><span className="font-semibold">Time:</span> {selectedEventDetails.time || "N/A"}</p>
              <p className="text-gray-700 mb-2"><span className="font-semibold">Location:</span> {selectedEventDetails.location || "N/A"}</p>
            </div>
          </div>
        )}
      </main>

      {/* SUGGESTIONS SIDEBAR */}
      <aside className="hidden lg:block fixed top-20 right-0 w-72 xl:w-80 h-[calc(100vh-5rem)] bg-white border-l border-gray-200 p-4 xl:p-6 shadow-sm overflow-y-auto">
      <h2 className="text-lg xl:text-xl font-semibold text-gray-800 mb-4">Suggestions</h2>
      <div className="space-y-4">
        {suggestions.slice(0, showMoreSuggestions ? suggestions.length : 5).map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shadow-md flex items-center justify-center">
                {user.photoUrl && user.photoUrl.trim() !== "" ? (
                  <img
                    src={user.photoUrl}
                    alt={`Profile photo of ${user.firstName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle size={28} className="text-gray-500" />
                )}
              </div>
              <div>
                <p className="text-md font-medium text-gray-700">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={() => handleAddUser(user._id)}
              disabled={addingUserId === user._id}
              className={`text-purple-500 hover:text-purple-700 transition-colors ${addingUserId === user._id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {addingUserId === user._id ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <UserPlus size={20} />
              )}
            </button>
          </div>
        ))}
      </div>
      {suggestions.length > 5 && (
        <button
          onClick={() => setShowMoreSuggestions(!showMoreSuggestions)}
          className="w-full mt-4 text-purple-500 hover:text-purple-700 transition-colors font-medium"
        >
          {showMoreSuggestions ? "Show Less" : "See More"}
        </button>
      )}
    </aside>
    

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-2xl w-11/12 max-w-lg relative">
            <button
              onClick={toggleEditProfileModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={userProfile.firstName}
                onChange={(e) => setUserProfile({ ...userProfile, firstName: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all"
                placeholder="First Name"
              />
              <input
                type="text"
                value={userProfile.lastName}
                onChange={(e) => setUserProfile({ ...userProfile, lastName: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all"
                placeholder="Last Name"
              />
              <input
                type="email"
                value={userProfile.email}
                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all cursor-not-allowed"
                placeholder="Email"
                disabled
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  onChange={handleProfilePhotoChange}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                />
                <Camera size={20} className="text-gray-500" />
              </div>
              <button
                onClick={handleProfileUpdate}
                disabled={profileLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-3 rounded-lg font-semibold text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {profileLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Update Profile"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMENTS MODAL */}
      {commentsModalOpen && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-2xl w-11/12 max-w-lg max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={closeCommentsModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Comments</h3>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={commentInputs[selectedEvent._id] || ""}
                onChange={(e) =>
                  setCommentInputs((prev) => ({ ...prev, [selectedEvent._id]: e.target.value }))
                }
                className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                placeholder="Write a comment..."
              />
              <button
                onClick={() => handleComment(selectedEvent._id)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-lg text-white hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Comment
              </button>
            </div>
            <div className="space-y-4">
              {selectedEvent.comments.map((comment, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 overflow-hidden">
                    {comment.photo ? (
                      <img src={comment.photo} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <span className="flex items-center justify-center h-full text-sm font-bold text-white">
                        {comment.userId?.firstName?.charAt(0) || "N"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    {comment.userId && (
                      <p className="text-purple-600 font-semibold">
                        {comment.userId.firstName} {comment.userId.lastName}
                      </p>
                    )}
                    <p className="text-gray-600">{comment.text}</p>
                    <p className="text-xs text-gray-400">{new Date(comment.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {shareModalOpen && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-2xl w-11/12 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Share this Event</h3>
              <button onClick={() => setShareModalOpen(false)}>
                <X size={24} className="text-gray-500 hover:text-gray-800" />
              </button>
            </div>
            <div className="space-y-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
              >
                <img src="/image.png" alt="Facebook" className="w-6 h-6" />
                <span className="text-sm text-gray-700">Share on Facebook</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
              >
                <img src="/twitter-icon.svg" alt="Twitter" className="w-6 h-6" />
                <span className="text-sm text-gray-700">Share on Twitter</span>
              </a>
            </div>
            <hr className="my-4 border-gray-200" />
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">Or copy the full event details:</p>
              <button
                onClick={() => {
                  const textToCopy = `Event Details:
Title: ${selectedEvent.title}
Date: ${selectedEvent.date || "N/A"}
Time: ${selectedEvent.time || "N/A"}
Location: ${selectedEvent.location || "N/A"}
Description: ${selectedEvent.description || "N/A"}`;
                  navigator.clipboard.writeText(textToCopy);
                  alert("Event details copied to clipboard!");
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-2 rounded-lg text-white hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Copy Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

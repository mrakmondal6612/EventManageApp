// src/Event/EventForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const EventForm = ({ onEventCreated, onEventUpdate, eventToEdit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    date: "",
    time: "",
    schedule: "",
    _id: "", // include _id in state so that update requests have it
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title || "",
        description: eventToEdit.description || "",
        thumbnail: eventToEdit.thumbnail || "",
        // Format the date as yyyy-mm-dd for input (if available)
        date: eventToEdit.date ? eventToEdit.date.substring(0, 10) : "",
        time: eventToEdit.time || "",
        schedule: eventToEdit.schedule || "",
        _id: eventToEdit._id || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        thumbnail: "",
        date: "",
        time: "",
        schedule: "",
        _id: "",
      });
    }
  }, [eventToEdit]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setThumbnailFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("time", formData.time);
      formDataToSend.append("schedule", formData.schedule);

      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile);
      } else if (formData.thumbnail) {
        formDataToSend.append("thumbnail", formData.thumbnail);
      }

      console.log("Submitting event data:", Object.fromEntries(formDataToSend));

      if (eventToEdit) {
        formDataToSend.append("_id", formData._id);
        await onEventUpdate(formDataToSend);
        setNotification("Event updated successfully!");
      } else {
        await onEventCreated(formDataToSend);
        setNotification("Event created successfully!");
      }

      // Reset form only if creating a new event
      if (!eventToEdit) {
        setFormData({
          title: "",
          description: "",
          thumbnail: "",
          date: "",
          time: "",
          schedule: "",
          _id: "",
        });
        setThumbnailFile(null);
      }

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error submitting event:", error);
      setNotification("Error: Failed to save event - " + (error.message || "Unknown error"));
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-4 sm:p-6 rounded-xl shadow-md w-full max-w-2xl mx-auto">
      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-3 rounded-lg ${notification.includes('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
          {notification}
        </div>
      )}
      {/* Hidden _id input to ensure it is submitted on update */}
      {eventToEdit && (
        <input type="hidden" name="_id" value={formData._id} readOnly />
      )}
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-800"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-800"
          required
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="thumbnailFile" className="block text-gray-700 font-medium mb-2">
          Upload Thumbnail Image
        </label>
        <input
          type="file"
          id="thumbnailFile"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-800 bg-white cursor-pointer"
        />
        {thumbnailFile && (
          <div className="mt-3">
            <p className="text-sm text-purple-600 font-medium mb-2">✓ Selected: {thumbnailFile.name}</p>
            <img
              src={URL.createObjectURL(thumbnailFile)}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-gray-300"
            />
          </div>
        )}
        {formData.thumbnail && !thumbnailFile && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Current thumbnail:</p>
            <img
              src={formData.thumbnail}
              alt="Current thumbnail"
              className="w-full h-48 object-cover rounded-lg border border-gray-300"
            />
          </div>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="thumbnail" className="block text-gray-700 font-medium mb-2">
          Or Enter Thumbnail URL
        </label>
        <input
          type="text"
          name="thumbnail"
          id="thumbnail"
          value={formData.thumbnail}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-800 bg-white"
          disabled={!!thumbnailFile}
        />
      </div>
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
            Date
          </label>
          <input
            type="date"
            name="date"
            id="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-800 bg-white"
            required
          />
        </div>
        <div className="flex-1">
          <label htmlFor="time" className="block text-gray-700 font-medium mb-2">
            Time
          </label>
          <input
            type="time"
            name="time"
            id="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-800 bg-white"
            required
          />
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="schedule" className="block text-gray-700 font-medium mb-2">
          Schedule
        </label>
        <input
          type="text"
          name="schedule"
          id="schedule"
          value={formData.schedule}
          onChange={handleChange}
          placeholder="Enter schedule details"
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-800"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={uploading}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 py-3 px-6 rounded-lg font-semibold text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {eventToEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            eventToEdit ? "Update Event" : "Create Event"
          )}
        </button>
      </div>
    </form>
  );
};

export default EventForm;

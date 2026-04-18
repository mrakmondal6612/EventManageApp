import { Mail, Key, User, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Auth.css";

export default function SignupPage() {
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    type: "student",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input fields
    if (!data.password || !data.confirmPassword || !data.email) {
      setError("All fields are required.");
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const url = `${API_BASE_URL}/api/auth/register`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      // Handle response
      if (!response.ok) {
        const errorMessage = await parseError(response);
        throw new Error(errorMessage);
      }

      const res = await response.json();
      console.log("Signup response:", res);

      if (res.token) {
        localStorage.setItem("token", res.token);
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/"), 2000); 
      } else {
        setError(res.msg || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError(error.message || "Something went wrong. Please try again later.");
    }
  };

  // Helper function to parse error responses
  const parseError = async (response) => {
    const contentType = response.headers.get("Content-Type");
    let errorMessage = `API Error: ${response.status}`;

    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      errorMessage += ` - ${errorData.message || JSON.stringify(errorData)}`;
    } else {
      const errorText = await response.text();
      errorMessage += ` - ${errorText}`;
    }

    return errorMessage;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.15),transparent_50%)]" />

      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl p-6 relative z-10">
        {/* Left Side - Welcome Text */}
        <div className="hidden md:flex flex-col text-left mr-12 text-white drop-shadow-lg">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            AKEvent
          </h1>
          <p className="text-xl mt-4 text-purple-200 font-light">
            Join the community and start creating amazing events.
          </p>
        </div>

        {/* Right Side - Signup Form */}
        <div className="bg-white/95 backdrop-blur-xl border border-purple-200 p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Create Account
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="relative group">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                  <User size={20} />
                </div>
                <input
                  className="w-full p-3 pl-12 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 hover:bg-gray-100"
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  onChange={handleChange}
                  value={data.firstName}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="relative group">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                  <User size={20} />
                </div>
                <input
                  className="w-full p-3 pl-12 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 hover:bg-gray-100"
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  onChange={handleChange}
                  value={data.lastName}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                <Mail size={20} />
              </div>
              <input
                className="w-full p-3 pl-12 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 hover:bg-gray-100"
                type="email"
                name="email"
                placeholder="Enter your email"
                onChange={handleChange}
                value={data.email}
                required
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                <Key size={20} />
              </div>
              <input
                className="w-full p-3 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 hover:bg-gray-100"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                onChange={handleChange}
                value={data.password}
                required
              />
              <div
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 cursor-pointer transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                <Key size={20} />
              </div>
              <input
                className="w-full p-3 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 hover:bg-gray-100"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                onChange={handleChange}
                value={data.confirmPassword}
                required
              />
              <div
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 cursor-pointer transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            {/* User Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Type
              </label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 hover:bg-gray-100"
                name="type"
                value={data.type}
                onChange={handleChange}
              >
                <option value="student">
                  Student
                </option>
                <option value="organizer">
                  Organizer
                </option>
              </select>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-3 rounded-lg font-semibold text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
            >
              Sign Up
            </button>

            {/* Link to Login */}
            <div className="text-center text-sm mt-4 text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-600 hover:text-purple-800 transition-colors duration-200 font-medium"
              >
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

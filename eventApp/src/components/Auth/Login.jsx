import "./Auth.css"; 
import { Mail, Key } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const url = `${API_BASE_URL}/api/auth/login`;
      const { data: res } = await axios.post(url, data);

      console.log("Login response: ", res);

      if (res?.token && res?.user) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("userType", res.user.type);
        localStorage.setItem("userId", res.user._id);
        localStorage.setItem("userName", `${res.user.firstName} ${res.user.lastName}`);

        setSuccess("Login successful! Redirecting...");

        if (res.user.type === "student") {
          navigate("/student-dashboard");
        } else if (res.user.type === "organizer") {
          navigate("/organizer-dashboard");
        }
      } else {
        setError("Invalid login response. Please try again.");
      }
    } catch (error) {
      console.error("Login error: ", error);
      setError(
        error.response?.data?.msg ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.15),transparent_50%)]" />

      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl p-6 relative z-10">
        {/* Left Side */}
        <div className="hidden md:flex flex-col text-left mr-12 text-white drop-shadow-lg">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            AKEvent
          </h1>
          <p className="text-xl mt-4 text-purple-200 font-light">
            Create, manage, and organize events seamlessly. Connect with your community.
          </p>
        </div>

        {/* Right Side (Login Form) */}
        <div className="bg-white/95 backdrop-blur-xl border border-purple-200 p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Welcome Back
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

            <div className="relative group">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
                <Key size={20} />
              </div>
              <input
                className="w-full p-3 pl-12 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 hover:bg-gray-100"
                type="password"
                name="password"
                placeholder="Enter your password"
                onChange={handleChange}
                value={data.password}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-3 rounded-lg font-semibold text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
            >
              Log In
            </button>

            <div className="flex justify-between items-center text-sm mt-4 text-gray-600">
              <Link
                to="/signup"
                className="text-purple-600 hover:text-purple-800 transition-colors duration-200 font-medium"
              >
                Create new account
              </Link>
              <Link
                to="/forgot-password"
                className="text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium"
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

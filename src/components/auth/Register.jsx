import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FieldsetInputField from "../common/FieldsetInputField";
import { login } from "../../store/Slices/auth/authenticationSlice";
import { enableButton } from "../../store/Slices/buttonSlice";
import { axiosInstance } from "../../utils/axiosInstance";
import { updateInput } from "../../store/actions";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff } from "lucide-react"; // Import eye icons

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to track password visibility
  
  const isAuthenticated = useSelector(
    (state) => state.authentication.isAuthenticated
  );
  
  const formData = useSelector((state) => ({
    username: state.inputs.username || "",
    password: state.inputs.password || "",
    email: state.inputs.email || "",
    firstName: state.inputs.firstName || "",
    lastName: state.inputs.lastName || "",
  }));
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateInput({ name, value }));
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
  
    if (!formData.username || !formData.password || !formData.email) {
      setError("Username, email, and password are required.");
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await axiosInstance.post("user/api/register/", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      // localStorage
      if (response.data.access) {
        localStorage.setItem("access_token", response.data.access);
      }
  
      if (response.status === 200) {
        dispatch(login());
        dispatch(enableButton());
        
        toast.success("Registration Successful", {
          position: "top-center",
          autoClose: 3000, 
          onClose: () => navigate("/login"), // Redirect after toast disappears
        });
      }
    } catch (error) {
      if (error.response) {
        setError(
          error.response.status === 401
            ? "Invalid credentials"
            : error.response.data.detail || "An error occurred. Please try again later."
        );
      } else if (error.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full">
      <header className="text-center pb-6 px-4">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Register To NxDesk</h1>
        <p className="text-lg md:text-xl text-blue-900 font-semibold">The Ultimate Ticketing Tool for all your issues</p>
      </header>
      <div className="bg-blue-50 p-6 md:p-12 rounded-3xl shadow-2xl w-full sm:w-10/12 md:w-7/12 lg:w-10/12 xl:w-8/12 mb-4 md:mb-6 mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldsetInputField
            id="userName"
            label="User Name"
            type="text"
            name="username"
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          <div className="flex space-x-4">
            <FieldsetInputField
              id="firstName"
              label="First Name"
              type="text"
              name="firstName" // Fixed name to match state
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <FieldsetInputField
              id="lastName"
              label="Last Name"
              type="text"
              name="lastName" // Fixed name to match state
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>
          <FieldsetInputField
            id="email"
            label="Email Address"
            type="email" // Changed to email type for better validation
            name="email"
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          
              <div className="relative">
              <FieldsetInputField
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full outline-none bg-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
          
          <div className="flex justify-between text-left">
            <a
              href="/forgot-password"
              className="text-gray-600 hover:text-gray-800 underline transition-colors"
            >
              Forgot your password?
            </a>
            <a
              href="/login" // Fixed lowercase for consistency
              className="text-gray-600 hover:text-gray-800 underline transition-colors"
            >
              Already registered? Login Here
            </a>
          </div>
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 text-white bg-blue-500 rounded-md transition-colors
              ${isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "hover:bg-blue-600"
                }`}
            >
              {isLoading ? "Registering..." : "Register"} {/* Updated button text to match form purpose */}
            </button>
          </div>
          {error && (
            <div
              className="text-red-500 text-center p-2 bg-red-50 rounded-md"
              role="alert"
            >
              {error}
            </div>
          )}
        </form>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default Register;
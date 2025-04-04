// LoginForm.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FieldsetInputField from "../common/FieldsetInputField";
import { login } from "../../store/Slices/auth/authenticationSlice";
import { enableButton } from "../../store/Slices/buttonSlice";
import { axiosInstance } from "../../utils/axiosInstance";
import { updateInput } from "../../store/actions";
import { Eye, EyeOff } from "lucide-react";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to track password visibility
  

  const isAuthenticated = useSelector(
    (state) => state.authentication.isAuthenticated
  );
  const formData = useSelector((state) => ({
    username: state.inputs.username || "",
    password: state.inputs.password || "",
    email: state.inputs.email || "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.username || !formData.password || !formData.email) {
      setError("Username and password cannot be empty.");
      setIsLoading(false);
      return;
    }

    console.log("username", formData.username);
    console.log("Password", formData.password);
    console.log("Email", formData.email);

    try {
      const response = await axiosInstance.post("user/api/login/", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Login response:", response);
      if(response.status === 200) {
        console.log("Login successful");
        localStorage.setItem("authToken", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
      }

      //  localStorage
      if (response.data.access) {
        localStorage.setItem("access_token", response.data.access);
      }

      if (response.status === 200) {
        dispatch(login());
        dispatch(enableButton());
        navigate("/");
      }
    } catch (error) {
      if (error.response) {
        setError(
          error.response.status === 401
            ? "Invalid username or password"
            : "An error occurred. Please try again later."
        );
      } else if (error.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className=" w-full">
      <header className="text-center   px-4">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">WELCOME TO NxDesk</h1>
        <p className="text-lg md:text-xl text-blue-900 font-semibold">The Ultimate Ticketing Tool for all your issues</p>
      </header>
      <div className=" bg-blue-50 p-6 md:p-12 rounded-3xl shadow-2xl w-full sm:w-10/12 md:w-7/12 lg:w-10/12 xl:w-8/12 mb-4 md:mb-6 mx-auto">
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
          <FieldsetInputField
            id="email"
            label="Email Address"
            type="text"
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
            <br />
            <a
              href="/register"
              className="text-gray-600 hover:text-gray-800 underline transition-colors"
            >
              New User? Register Here
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
              {isLoading ? "Logging in..." : "Log in"}
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
    </div>

  );
};

export default LoginForm;

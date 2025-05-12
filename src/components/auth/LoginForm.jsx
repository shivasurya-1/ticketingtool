import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FieldsetInputField from "../common/FieldsetInputField";
import { login } from "../../store/Slices/auth/authenticationSlice";
import { enableButton } from "../../store/Slices/buttonSlice";
import { axiosInstance } from "../../utils/axiosInstance";
import { updateInput } from "../../store/actions";
import { Eye, EyeOff } from "lucide-react";
import { fetchUserDetails } from "../../store/actions/userActions";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to track password visibility

  const formData = useSelector((state) => ({
    password: state.inputs.password || "test@gmail.com",
    email: state.inputs.email || "test123",
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateInput({ name, value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    let missingFields = [];
    let invalidFields = [];

    if (!formData.email) {
      missingFields.push("email");
    } else {
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        invalidFields.push("email");
      }
    }
    if (!formData.password) {
      missingFields.push("password");
    }

    if (missingFields.length > 0) {
      const message =
        missingFields.length === 1
          ? `${missingFields[0]} cannot be empty`
          : `${missingFields.slice(0, -1).join(", ")} and ${missingFields.at(
              -1
            )} cannot be empty`;

      setError(message);
      setIsLoading(false);
      console.log(error);
      return;
    }

    if (invalidFields.length > 0) {
      let message =
        invalidFields.length === 1
          ? `Enter a valid ${invalidFields[0]}`
          : `${invalidFields.slice(0, -1).join(", ")} and ${invalidFields.at(
              -1
            )} are not valid.`;

      setError(message);
      setIsLoading(false);
      return;
    }

    const userLoginAPI = process.env.REACT_APP_LOGIN_API;
    console.log("API: ", userLoginAPI);
    console.log("FormDATA", formData);
    try {
      const response = await axiosInstance.post(userLoginAPI, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Login response:", response);
      if (response.status === 200) {
        console.log("Login successful");
        const accessToken = response.data.access;
        const refreshToken = response.data.refresh;
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        dispatch(fetchUserDetails(accessToken));
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
        if (error.response.status === 404) {
          setError("Invalid Email");
        } else if (error.response.status >= 500) {
          setError("server issue please try again later");
        } else if (error.response.data && error.response.data.error) {
          setError(error.response.data.error);
        } else {
          setError("An error occurred. Please try again later.");
        }
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
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
          WELCOME TO NxDesk
        </h1>
        <p className="text-lg md:text-xl text-blue-900 font-semibold">
          The Ultimate Ticketing Tool for all your issues
        </p>
      </header>
      <div className=" bg-blue-50 p-6 md:p-12 rounded-3xl shadow-2xl w-full sm:w-10/12 md:w-7/12 lg:w-10/12 xl:w-8/12 mb-4 md:mb-6 mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
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
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 text-white bg-blue-500 rounded-md transition-colors
              ${
                isLoading
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

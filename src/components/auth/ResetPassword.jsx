import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FieldsetInputField from "../common/FieldsetInputField";
import { enableButton } from "../../store/Slices/buttonSlice";
import { axiosInstance } from "../../utils/axiosInstance";
import { updateInput } from "../../store/actions";
import { toast, ToastContainer } from "react-toastify";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = useSelector(
    (state) => state.authentication.isAuthenticated
  );

  const formData = useSelector((state) => ({
    username: state.inputs.username || "",
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
    console.log("Register Page Form", formData);
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.username || !formData.email) {
      setError("Username and email are required.");
      setIsLoading(false);
      return;
    }

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Access token is missing. Please login.");
      setIsLoading(false);
      return;
    }

    const registerAPI = process.env.REACT_APP_REGISTER_API;

    try {
      const response = await axiosInstance.post(registerAPI, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Registration response:", response.data);
      if (response.status === 201) {
        toast.success("Registration Successful", {
          autoClose: 3000,
          onClose: () => navigate("/login"),
        });

        dispatch(enableButton());
      }
    } catch (error) {
      if (error.response) {
        setError(
          error.response.status === 401
            ? "Invalid credentials"
            : error.response.data.detail ||
                "An error occurred. Please try again later."
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
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
          Reset Password
        </h1>
        <p className="text-lg md:text-xl text-blue-900 font-semibold">
          The Ultimate Ticketing Tool for all your issues
        </p>
      </header>
      <div className="bg-blue-50 p-6 md:p-12 rounded-3xl shadow-2xl w-full sm:w-10/12 md:w-7/12 lg:w-10/12 xl:w-8/12 mb-4 md:mb-6 mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldsetInputField
            id="email"
            label="Email Address"
            type="email" // Changed to email type for better validation
            name="email"
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          <FieldsetInputField
            id="oldPassword"
            label="Old Password"
            type="text"
            name="oldPassword"
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          <FieldsetInputField
            id="newPassword"
            label="New Password"
            type="text"
            name="newPassword"
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          <div className="relative">
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            ></button>
          </div>

          <a
            href="/login" // Fixed lowercase for consistency
            className="text-gray-600 hover:text-gray-800 underline transition-colors"
          >
            Login Here
          </a>

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
              {isLoading ? "resetting..." : "Reset"}{" "}
              {/* Updated button text to match form purpose */}
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
      <ToastContainer />
    </div>
  );
};

export default ResetPassword;

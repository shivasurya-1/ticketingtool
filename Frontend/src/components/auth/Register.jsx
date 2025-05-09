import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FieldsetInputField from "../common/FieldsetInputField";
import { enableButton } from "../../store/Slices/buttonSlice";
import { axiosInstance } from "../../utils/axiosInstance";
import { updateInput } from "../../store/actions";
import { toast, ToastContainer } from "react-toastify";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formData = useSelector((state) => ({
    username: state.inputs.username || "",
    email: state.inputs.email || "",
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateInput({ name, value }));
  };

  const handleSubmit = async (e) => {
    console.log("Register Page Form", formData);
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // if (!formData.username || !formData.email) {
    //   setError("Username and email are required.");
    //   setIsLoading(false);
    //   return;
    // }

    let missingFields = [];
    const usernameRegex = /^(?!.*__)[a-zA-Z0-9_]{3,}$/;
    if (!formData.username) {
      missingFields.push("username");
    }
    if (!formData.email) {
      missingFields.push("email");
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
    // if (formData.username.length < 3) {
    //   setError("Username should contain a minimum of 3 letters.");
    //   setIsLoading(false);
    //   return;
    // }

    if (!usernameRegex.test(formData.username)) {
      setError(
        "Username must be at least 3 characters and can contain only letters, numbers, and one underscore."
      );
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
    console.log("Form Data Register Page", formData)

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
          onClose: () => navigate("/register"),
        });

        dispatch(enableButton());
      }
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;

        if (errorData) {
          if (errorData.username) {
            setError(errorData.username[0]);
          } else if (errorData.email) {
            setError(errorData.email[0]);
          }
        } else if (error.response.status === 500) {
          setError("Server error. Please try again later.");
        }
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
          Register To NxDesk
        </h1>
        <p className="text-lg md:text-xl text-blue-900 font-semibold">
          The Ultimate Ticketing Tool for all your issues
        </p>
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
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            ></button>
          </div>

          <a
            href="/login" // Fixed lowercase for consistency
            className="text-gray-600 hover:text-gray-800 underline transition-colors"
          >
            Already registered? Login Here
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
              {isLoading ? "Registering..." : "Register"}{" "}
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
      <ToastContainer
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Register;

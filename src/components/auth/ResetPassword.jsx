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
    email: state.inputs.email || "",
    oldPassword: state.inputs.oldPassword || "",
    newPassword: state.inputs.newPassword || "",
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

    if (!formData.email || !formData.oldPassword || !formData.newPassword) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Access token is missing. Please login.");
      setIsLoading(false);
      return;
    }

    const resetPasswordAPI = "user/resetpassword/"; // Correct API for password reset

    try {
      const response = await axiosInstance.post(resetPasswordAPI, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Password reset response:", response.data);
      if (response.status === 200) {
        toast.success("Password reset successful!", {
          autoClose: 3000,
          onClose: () => navigate("/login"),
        });

        dispatch(enableButton());
      }
    } catch (error) {
      if (error.response) {
        setError(
          error.response.status === 401
            ? "Old password is incorrect"
            : error.response.data.detail ||
                "An error occurred. Please try again later."
        );
      } else if (error.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Password reset error:", error);
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
            type="email"
            name="email"
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          <FieldsetInputField
            id="oldPassword"
            label="Old Password"
            type="password"
            name="oldPassword"
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          <FieldsetInputField
            id="newPassword"
            label="New Password"
            type="password"
            name="newPassword"
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />

          <a
            href="/login"
            className="text-gray-600 hover:text-gray-800 underline transition-colors"
          >
            Login Here
          </a>

          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 text-white bg-blue-500 rounded-md transition-colors ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "hover:bg-blue-600"
              }`}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
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

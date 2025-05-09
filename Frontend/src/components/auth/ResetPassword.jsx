import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FieldsetInputField from "../common/FieldsetInputField";
import { enableButton } from "../../store/Slices/buttonSlice";
import { axiosInstance } from "../../utils/axiosInstance";
import { updateInput } from "../../store/actions";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const userProfile = useSelector((state) => state.userProfile.user);

  const formData = useSelector((state) => ({
    oldPassword: state.inputs.oldPassword || "",
    newPassword: state.inputs.newPassword || "",
    confirmNewPassword: state.inputs.confirmNewPassword || "",
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateInput({ name, value }));
  };

  const convertFormDataToSnakeCase = (data) => ({
    old_password: data.oldPassword,
    new_password: data.newPassword,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    console.log(formData);
    const formDataInSnakeCase = convertFormDataToSnakeCase(formData);

    let missingFields = [];
    let passswordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!formData.oldPassword) {
      missingFields.push("old passsword");
    }
    if (!formData.newPassword) {
      missingFields.push("new password");
    }
    if (!formData.confirmNewPassword) {
      missingFields.push("confirm new password");
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
    if (!passswordRegex.test(formData.newPassword)) {
      setError(
        "Password must be at least 8 characters long, contain at least one letter, one number, and one special character (e.g., @, $, %, &, etc.)."
      );
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("New password and confirm new password should be same.");
      setIsLoading(false);
      return;
    }
    if (formData.oldPassword === formData.confirmNewPassword) {
      setError("Old password and confirm new password should not be same.");
      setIsLoading(false);
      return;
    }
    if (formData.newPassword === formData.oldPassword) {
      setError("New password and old password should not be same.");
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
      const response = await axiosInstance.post(
        resetPasswordAPI,
        formDataInSnakeCase,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
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
        if (error.response.data) {
          setError(error.response.data.error);
        }
      } else if (error.response.status === 500) {
        setError("Server error. Please try again later.");
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
  const toggleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
  };
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
            value={userProfile?.email || ""}
            disabled
          />
          <div className="relative">
            <FieldsetInputField
              id="oldPassword"
              label="Old Password"
              type={showOldPassword ? "text" : "password"}
              name="oldPassword"
              onChange={handleInputChange}
              required
              value={formData.oldPassword}
              disabled={isLoading}
               className="w-full outline-none bg-transparent pr-10"
            />
            <button
              type="button"
              onClick={toggleOldPasswordVisibility}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showOldPassword ? "Hide password" : "Show password"}
            >
              {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="relative">
            <FieldsetInputField
              id="newPassword"
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              onChange={handleInputChange}
              required
              value={formData.newPassword}
              disabled={isLoading}
               className="w-full outline-none bg-transparent pr-10"
            />
            <button
              type="button"
              onClick={toggleNewPasswordVisibility}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="relative">
            <FieldsetInputField
              id="confirmNewPassword" 
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmNewPassword"
              onChange={handleInputChange}
              required
              value={formData.confirmNewPassword}
              disabled={isLoading}
               className="w-full outline-none bg-transparent pr-10"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
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

export default ResetPassword;

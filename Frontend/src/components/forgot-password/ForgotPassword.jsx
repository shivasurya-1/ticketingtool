import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import FieldsetInputField from "../common/FieldsetInputField";
import Button from "../common/Button";
import { enableButton } from "../../store/Slices/buttonSlice";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import { ToastContainer, toast } from "react-toastify";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const email = useSelector((state) => state.inputs.email || "");
  const otp = useSelector((state) => state.inputs.otp || "");
  const new_password = useSelector((state) => state.inputs.new_password || "");

  const [isSubmitButtonVisible, setIsSubmitButtonVisible] = useState(true);
  const [isSubmitOTPButtonVisible, setIsSubmitOTPButtonVisible] =
    useState(true);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpVisible, setOtpVisible] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const forgotpassword_url = process.env.REACT_APP_FORGOT_PASSWORD_API;
  const verifyotp_url = process.env.REACT_APP_VERIFY_OTP_API;
  const resetpassword_url = process.env.REACT_APP_RESET_PASSWORD_API;

  // Handle email submission
  const handleEmailSubmit = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post(forgotpassword_url, { email });
      if (response.status === 200) {
        setIsSubmitButtonVisible(false);
        setIsOtpSent(true);
        setResendEnabled(false);
        setResendTimer(30);
        const successMessage =
          response?.data?.message || "OTP sent to your email";
        toast.success(successMessage);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Error in sending OTP";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      dispatch(enableButton());
    }
  };

  // Handle OTP submission
  const handleOtpSubmit = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post(verifyotp_url, { otp, email });
      if (response.status === 200) {
        setIsSubmitOTPButtonVisible(false);
        setOtpVerified(true);
        const successMessage =
          response?.data?.message || "OTP verified successfully";
        toast.success(successMessage);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Error in Verifying OTP";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      dispatch(enableButton());
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post(resetpassword_url, {
        email,
        new_password,
      });
      if (response.status === 200) {
        const successMessage =
          response?.data?.message ||
          "Password reset successfully. Redirecting to login...";
        toast.success(successMessage);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        "There was an issue while changing your password. Please try again later.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      dispatch(enableButton());
    }
  };

  // Resend timer logic
  useEffect(() => {
    let interval;
    if (isOtpSent && !resendEnabled && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setResendEnabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, resendEnabled, resendTimer]);

  return (
    <div className="mt-6 bg-blue-50 p-8 md:p-12 rounded-3xl shadow-2xl w-full sm:w-10/12 md:w-8/12 lg:w-6/12 mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Reset Your Password
      </h2>

      <div className="mb-6">
        <FieldsetInputField
          label="Enter your email"
          type="email"
          name="email"
          className="w-full border-gray-300 rounded-lg"
        />
        {isSubmitButtonVisible && (
          <Button
            label={isLoading ? "Sending..." : "Submit"}
            onClick={handleEmailSubmit}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 transition-colors"
            disabled={isLoading}
          />
        )}
      </div>

      {isOtpSent && (
        <div className="mb-6">
          <FieldsetInputField
            label="Enter OTP"
            type="text"
            name="otp"
            className="w-full border-gray-300 rounded-lg"
          />
          {isSubmitOTPButtonVisible && (
            <Button
              label={isLoading ? "Verifying..." : "Submit OTP"}
              onClick={handleOtpSubmit}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 transition-colors"
              disabled={isLoading}
            />
          )}
          <p className="text-gray-600 mt-3 text-sm text-center">
            OTP sent to your email. Please check your inbox or spam folder.
          </p>
          <div className="mt-4 flex justify-center items-center">
            <Button
              label={resendEnabled ? "Resend OTP" : `Resend in ${resendTimer}s`}
              onClick={resendEnabled ? handleEmailSubmit : null}
              className={`relative w-full md:w-1/2 py-2 rounded-lg text-sm transition-all duration-300 ${
                resendEnabled && !isLoading
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed opacity-70"
              }`}
              disabled={!resendEnabled || isLoading}
            >
              {!resendEnabled && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="animate-spin h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              )}
            </Button>
          </div>
        </div>
      )}

      {otpVerified && (
        <div className="mb-6">
          <FieldsetInputField
            label="Enter new password"
            type="password"
            name="new_password"
            className="w-full border-gray-300 rounded-lg"
          />
          <Button
            label={isLoading ? "Resetting..." : "Reset Password"}
            onClick={handlePasswordReset}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 transition-colors"
            disabled={isLoading}
          />
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
      )}
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

export default ForgotPassword;

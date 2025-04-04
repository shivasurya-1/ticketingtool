import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    submitEmail,
    submitEmailSuccess,
    submitEmailFailure,
    verifyOTP,
    verifyOTPSuccess,
    verifyOTPFailure,
    resetPassword,
    resetPasswordSuccess,
} from '../../store/Slices/forgotpasswordSlice';
import FieldsetInputField from '../common/FieldsetInputField';
import Button from '../common/Button';
import OTPModal from '../common/Modal';
import axios from 'axios';
import { enableButton } from '../../store/Slices/buttonSlice';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../utils/axiosInstance';

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const email = useSelector((state) => state.inputs.email || '');
    const otp = useSelector((state) => state.inputs.otp || '');
    const new_password = useSelector((state) => state.inputs.new_password || '');
    const { otpVerified, loading, error } = useSelector((state) => state.forgotPassword);
    
    // State to control button visibility
    const [isSubmitButtonVisible, setIsSubmitButtonVisible] = useState(true);
    const [isSubmitOTPButtonVisible, setIsSubmitOTPButtonVisible] = useState(true);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpMessage, setOtpMessage] = useState('');
    const [otpVisible, setOtpVisible] = useState(false);

    const forgotpassword_url = process.env.REACT_APP_FORGOT_PASSWORD_API;
    const verifyotp_url = process.env.REACT_APP_VERIFY_OTP_API;
    const resetpassword_url = process.env.REACT_APP_RESET_PASSWORD_API;

    // Handle email submission
    const handleEmailSubmit = async () => {
        try {
            dispatch(submitEmail());
            console.log(email, 'email');

            // Make API call to send OTP to email
            const response = await axiosInstance.post(forgotpassword_url, { email });
            console.log('response', response);

            // Set the message from the API response
            const message = response.data.message || 'OTP Sent';
            if (message === "OTP sent.") {
                setOtpVisible(true);
                console.log(otpVisible, "otp visibility");
            }

            dispatch(submitEmailSuccess());
            setOtpMessage(message);
            setShowOtpModal(true);
            setIsSubmitButtonVisible(false); 
            
        } catch (error) {
            console.log('Entered Error page');
            console.log(error);
            const errorMessage = error.response?.data?.message || 'Failed to send OTP';
            console.log(errorMessage);
            dispatch(submitEmailFailure(errorMessage));
            setOtpMessage(errorMessage);
            setShowOtpModal(true);
            setIsSubmitButtonVisible(true);
        }
        dispatch(enableButton());
        console.log("72");
    };

    const handleOtpSubmit = async () => {
        try {
            dispatch(verifyOTP());
            console.log(otp, 'otp');
            const response = await axios.post(verifyotp_url, { otp, email });
            console.log('response', response);
            const message = response.data.message || 'Successfully OTP Verified';
            dispatch(verifyOTPSuccess());

            if (message === "create New password") {
                dispatch(verifyOTPSuccess());
            }
            dispatch(enableButton());
            setIsSubmitOTPButtonVisible(false);
        } catch (error) {
            console.log('Entered Error page');
            console.log(error);
            const errorMessage = error.response?.data?.message || 'Error in Verifying OTP';
            console.log(errorMessage);
            dispatch(verifyOTPFailure(errorMessage));
            setOtpMessage(errorMessage);
            setShowOtpModal(true);
        }
        dispatch(enableButton());
    };

    const handlePasswordReset = async () => {
        try {
            dispatch(resetPassword());

            const response = await axios.post(resetpassword_url, { email, new_password });
            console.log('response', response);
            const message = response.data.message || 'Password Reset successfully. You can Login now';
            dispatch(resetPasswordSuccess());
            console.log(message);
            if (message === "Password updated successfully.") {
                navigate('/your-work');
            }
            dispatch(enableButton());
        } catch (error) {
            console.log('Entered Error page');
            console.log(error);
            const errorMessage = error.response?.data?.message || 'Issue in Changing the Password';
            console.log(errorMessage);
        }
        dispatch(enableButton());
    };

    const handleModalConfirm = () => {
        setShowOtpModal(false);
        if (otpMessage === 'OTP Sent') {
            setOtpVisible(true); 
        }
    };

    return (
        <div className="mt-4 bg-blue-50 p-6 md:p-12 rounded-3xl shadow-2xl w-full sm:w-10/12 md:w-7/12 lg:w-10/12 xl:w-8/12 mb-4 md:mb-6 md:mt-6 mx-auto">

            <div className="mb-4">
                <FieldsetInputField
                    label="Enter your email"
                    type="email"
                    name="email"
                    className="w-full"
                />
                {isSubmitButtonVisible && (
                    <Button
                        label="Submit"
                        onClick={handleEmailSubmit}
                        className="mt-4 w-full md:w-auto"
                    />
                )}
            </div>

            {showOtpModal && (
                <OTPModal
                    message={otpMessage}
                    onClose={() => setShowOtpModal(false)}
                    onConfirm={handleModalConfirm}
                />
            )}

            {otpVisible && (
                <div className="mb-4">
                    <FieldsetInputField
                        label="Enter OTP"
                        type="text"
                        name="otp"
                        className="w-full"
                    />
                    {isSubmitOTPButtonVisible && (<Button
                        label="Submit OTP"
                        onClick={handleOtpSubmit}
                        isDisabled={!otp || loading}
                        className="mt-4 w-full md:w-auto"
                    />)}
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
            )}

            {otpVerified && (
                <div className="mb-4">
                    <FieldsetInputField
                        label="Enter new password"
                        type="password"
                        name="new_password"
                        className="w-full"
                    />
                    <Button
                        label="Reset Password"
                        onClick={handlePasswordReset}
                        isDisabled={!new_password || loading}
                        className="mt-4 w-full md:w-auto"
                    />
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;
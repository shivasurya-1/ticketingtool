// src/hooks/useFetchUserDetails.js

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import {axiosInstance} from "../utils/axiosInstance";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../store/Slices/userProfileSlice";


const useFetchUserDetails = (authToken) => {
  const [decodedTokenData, setDecodedTokenData] = useState(null);
  const dispatch = useDispatch();

  // Decode JWT token when it becomes available
  useEffect(() => {
    if (authToken) {
      try {
        const decoded = jwtDecode(authToken);
        setDecodedTokenData(decoded);
      } catch (error) {
        console.error("Invalid token provided:", error);
      }
    }
  }, [authToken]);

  // Fetch user details from backend once token is decoded
  useEffect(() => {
    const getUserDetailsFromAPI = async () => {
      if (decodedTokenData?.user_id) {
        try {
          const response = await axiosInstance.get(
            `/details/personal_details/${decodedTokenData.user_id}/`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          const userData = response.data[0];
          dispatch(setUserProfile(userData));
        } catch (error) {
          console.error("Failed to fetch user details:", error);
        }
      }
    };

    getUserDetailsFromAPI();
  }, [decodedTokenData, authToken, dispatch]);
};

export default useFetchUserDetails;

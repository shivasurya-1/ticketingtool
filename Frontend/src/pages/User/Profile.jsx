import { useState, useEffect } from "react";
import ChatbotPopup from "../../components/ChatBot";
import { User, Mail, MapPin, Calendar, FileText, Phone, Save, X, Upload, Edit2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { updateUserProfile } from "../../store/actions/userActions";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const userProfile = useSelector((state) => state.userProfile.user);
  const authToken = localStorage.getItem("access_token");
  const dispatch = useDispatch();

  useEffect(() => {
    if (userProfile) {
      setEditedProfile({ ...userProfile });
      setImagePreview(userProfile.profile_pic);
    }
  }, [userProfile]);

  if (!userProfile) {
    return <div className="flex justify-center items-center h-screen">Loading profile data...</div>;
  }

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditedProfile({ ...userProfile });
      setImagePreview(userProfile.profile_pic);
      setProfileImage(null);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      
      // Add all profile fields to formData
      Object.keys(editedProfile).forEach(key => {
        if (key !== 'profile_pic' && editedProfile[key] !== null) {
          formData.append(key, editedProfile[key]);
        }
      });
      
      // Add profile image if changed
      if (profileImage) {
        formData.append('profile_pic', profileImage);
      }
      
      // Use the new thunk action instead of direct API call
      const resultAction = await dispatch(updateUserProfile({
        formData,
        accessToken: authToken
      }));
      
      if (updateUserProfile.fulfilled.match(resultAction)) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        // Handle the error from the thunk
        const errorMessage = resultAction.payload?.message || 'Failed to update profile';
        toast.error(errorMessage);
      }
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow h-full flex flex-col">
            {/* Profile Header */}
            <div className="bg-[#093D80] p-4 text-white">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white">
                    <img
                      src={isEditing ? imagePreview : userProfile.profile_pic || "/api/placeholder/150/150"}
                      alt="Profile"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md text-blue-600 cursor-pointer hover:bg-blue-50">
                      <Upload size={12} />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="first_name"
                          value={editedProfile.first_name || ""}
                          onChange={handleInputChange}
                          className="text-white bg-blue-700 border border-blue-400 rounded px-2 py-1 w-24 text-sm"
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          name="last_name"
                          value={editedProfile.last_name || ""}
                          onChange={handleInputChange}
                          className="text-white bg-blue-700 border border-blue-400 rounded px-2 py-1 w-24 text-sm"
                          placeholder="Last Name"
                        />
                      </div>
                    ) : (
                      `${userProfile.first_name} ${userProfile.last_name}`
                    )}
                  </h2>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={isLoading}
                          className={`bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-50"
                          }`}
                        >
                          <Save size={12} /> {isLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleEditToggle}
                          disabled={isLoading}
                          className="bg-transparent border border-white text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-white/10 flex items-center gap-1"
                        >
                          <X size={12} /> Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEditToggle}
                        className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-50 flex items-center gap-1"
                      >
                        <Edit2 size={12} /> Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content - Unified Layout */}
            <div className="flex-1 p-4 overflow-auto">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold mb-3 text-gray-800 flex items-center">
                  Profile Information
                  {isEditing && <span className="ml-2 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Editing</span>}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Account Information Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded text-blue-600">
                        <User size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Employee ID</p>
                        <p className="text-sm font-medium">{userProfile.emp_id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-100 rounded text-purple-600">
                        <Mail size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Email Address</p>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={editedProfile.email || ""}
                            onChange={handleInputChange}
                            className="w-full text-sm bg-white border border-blue-300 rounded px-2 py-1"
                            placeholder="Email Address"
                          />
                        ) : (
                          <p className="text-sm font-medium break-all">{userProfile.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-green-100 rounded text-green-600">
                        <Phone size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Phone Number</p>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone_number"
                            value={editedProfile.phone_number || ""}
                            onChange={handleInputChange}
                            className="w-full text-sm bg-white border border-blue-300 rounded px-2 py-1"
                            placeholder="Phone Number"
                          />
                        ) : (
                          <p className="text-sm font-medium">{userProfile.phone_number}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-100 rounded text-indigo-600">
                        <FileText size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="text-sm font-medium">{userProfile.department || "Not specified"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Details Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-yellow-100 rounded text-yellow-600">
                        <MapPin size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Address</p>
                        {isEditing ? (
                          <input
                            type="text"
                            name="address"
                            value={editedProfile.address || ""}
                            onChange={handleInputChange}
                            className="w-full text-sm bg-white border border-blue-300 rounded px-2 py-1"
                            placeholder="Address"
                          />
                        ) : (
                          <p className="text-sm font-medium">{userProfile.address}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">City</p>
                        {isEditing ? (
                          <input
                            type="text"
                            name="city"
                            value={editedProfile.city || ""}
                            onChange={handleInputChange}
                            className="w-full text-sm bg-white border border-blue-300 rounded px-2 py-1"
                            placeholder="City"
                          />
                        ) : (
                          <p className="text-sm font-medium">{userProfile.city}</p>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">State</p>
                        {isEditing ? (
                          <input
                            type="text"
                            name="state"
                            value={editedProfile.state || ""}
                            onChange={handleInputChange}
                            className="w-full text-sm bg-white border border-blue-300 rounded px-2 py-1"
                            placeholder="State"
                          />
                        ) : (
                          <p className="text-sm font-medium">{userProfile.state}</p>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Country</p>
                        {isEditing ? (
                          <input
                            type="text"
                            name="country"
                            value={editedProfile.country || ""}
                            onChange={handleInputChange}
                            className="w-full text-sm bg-white border border-blue-300 rounded px-2 py-1"
                            placeholder="Country"
                          />
                        ) : (
                          <p className="text-sm font-medium">{userProfile.country}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-red-100 rounded text-red-600">
                        <Calendar size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Date of Birth</p>
                        {isEditing ? (
                          <input
                            type="date"
                            name="dob"
                            value={editedProfile.dob || ""}
                            onChange={handleInputChange}
                            className="w-full text-sm bg-white border border-blue-300 rounded px-2 py-1"
                            placeholder="Date of Birth"
                          />
                        ) : (
                          <p className="text-sm font-medium">{userProfile.dob || "Not specified"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <ChatbotPopup />
      </div>
    </div>
  );
}
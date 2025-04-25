import { useState, useEffect } from "react";
import ChatbotPopup from "../../components/ChatBot";
import { User, Mail, MapPin, Calendar, FileText, Award, Edit, Phone, Save, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-hot-toast"; // Assuming you use a toast library for notifications

export default function Profile() {
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const userProfile = useSelector((state) => state.userProfile.user);
  const authToken = localStorage.getItem("access_token");// Get auth token from Redux
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize editedProfile when userProfile changes
    if (userProfile) {
      setEditedProfile({ ...userProfile });
    }
  }, [userProfile]);

  if (!userProfile) {
    return <div className="flex justify-center items-center min-h-screen">Loading profile data...</div>;
  }

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditedProfile({ ...userProfile });
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

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Configure headers with authentication token
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        "Content-Type": "multipart/form-data",};
      
      // Send updated profile data to the backend with auth headers
      const response = await axiosInstance.put('/details/my_profile/', editedProfile, { headers });
      
      // Update Redux store with the updated profile
      dispatch({
        type: 'UPDATE_USER_PROFILE',
        payload: response.data
      });
      
      // Show success message
      toast.success('Profile updated successfully');
      
      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Handle different error scenarios
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          toast.error('Authentication failed. Please login again.');
          // You might want to redirect to login page or refresh token here
        } else if (error.response.status === 403) {
          toast.error('You do not have permission to update this profile.');
        } else {
          toast.error(error.response.data?.message || 'Failed to update profile');
        }
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('Network error. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error('An error occurred while updating your profile.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex w-full min-h-screen px-16">
      <main className="flex-1 p-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-[#093D80] p-6 text-white">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white">
                  <img
                    src={userProfile.profile_pic || "/api/placeholder/150/150"}
                    alt="Profile"
                    className="object-contain w-full h-full"
                  />
                </div>
                <button className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md text-blue-600">
                  <Edit size={14} />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        name="first_name"
                        value={editedProfile.first_name}
                        onChange={handleInputChange}
                        className="text-white bg-transparent border-b border-white mr-2 w-24"
                      />
                      <input
                        type="text"
                        name="last_name"
                        value={editedProfile.last_name}
                        onChange={handleInputChange}
                        className="text-white bg-transparent border-b border-white w-24"
                      />
                    </>
                  ) : (
                    `${userProfile.first_name} ${userProfile.last_name}`
                  )}
                </h2>
                <p className="flex items-center gap-1 text-blue-100">
                  <Award size={16} />
                  <span>{userProfile.job_title || "Job Title"}</span>
                </p>
                <div className="flex gap-4 mt-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className={`bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                          isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-50"
                        }`}
                      >
                        {isLoading ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save size={16} className="inline mr-1" /> Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleEditToggle}
                        disabled={isLoading}
                        className="bg-transparent border border-white text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
                      >
                        <X size={16} className="inline mr-1" /> Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEditToggle}
                      className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                  <button className="bg-transparent border border-white text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-white/10 transition-colors">
                    View Activity
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex px-6">
              {["personal", "work", "skills", "documents"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {activeTab === "personal" && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Account Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Employee Number</p>
                          <p className="font-medium">{userProfile.emp_id}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email Address</p>
                          {isEditing ? (
                            <input
                              type="email"
                              name="email"
                              value={editedProfile.email}
                              onChange={handleInputChange}
                              className="font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            <p className="font-medium">{userProfile.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                          <Phone size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          {isEditing ? (
                            <input
                              type="tel"
                              name="phone_number"
                              value={editedProfile.phone_number}
                              onChange={handleInputChange}
                              className="font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            <p className="font-medium">{userProfile.phone_number}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                name="address"
                                value={editedProfile.address}
                                onChange={handleInputChange}
                                className="font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  name="city"
                                  value={editedProfile.city}
                                  onChange={handleInputChange}
                                  className="font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500 w-1/3"
                                />
                                <input
                                  type="text"
                                  name="state"
                                  value={editedProfile.state}
                                  onChange={handleInputChange}
                                  className="font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500 w-1/3"
                                />
                                <input
                                  type="text"
                                  name="country"
                                  value={editedProfile.country}
                                  onChange={handleInputChange}
                                  className="font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500 w-1/3"
                                />
                              </div>
                            </div>
                          ) : (
                            <p className="font-medium">{userProfile.address}, {userProfile.city}, {userProfile.state}, {userProfile.country}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date of Birth</p>
                          <p className="font-medium">{userProfile.dob}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Department</p>
                          <p className="font-medium">{userProfile.department}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                      <button className="text-blue-600 text-sm font-medium">View All</button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { action: "Updated profile picture", time: "2 hours ago" },
                        { action: "Completed project milestone", time: "Yesterday" },
                        { action: "Submitted expense report", time: "3 days ago" }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                          <p>{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== "personal" && (
              <div className="text-center py-8 text-gray-500">
                <p>Content for {activeTab} tab will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <ChatbotPopup />
    </div>
  );
}
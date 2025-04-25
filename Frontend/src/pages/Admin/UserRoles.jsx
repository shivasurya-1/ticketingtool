import { useState, useEffect, useRef } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import Sidebar from "../../components/Sidebar";
import ChatbotPopup from "../../components/ChatBot";
import { ToastContainer, toast } from "react-toastify";

export default function UserRoles() {
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  
  const dropdownRef = useRef(null);
  useEffect(() => {
    const checkAuthentication = () => {
      const accessToken = localStorage.getItem("access_token");
      
      if (!accessToken) {
        toast.error("Please log in to access this page.");
        setLoading(false);
        return false;
      }
      return true;
    };
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    const fetchPermissions = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await axiosInstance.get("/roles/user_role/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setPermissions(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        toast.error("Failed to fetch permissions data");
        setLoading(false);
      }
    };

    if (checkAuthentication()) {
      fetchPermissions();
    }
  }, [dropdownOpen]);

  // Function to format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <main className="flex-1">
        <div className="p-8">
          <ToastContainer position="top-right" autoClose={3000} />
          
          <div className="bg-white rounded-xl shadow-lg p-6">
   

            {/* Permissions Table */}
            <div className="mt-6">
              <div className="flex justify-between">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Roles</h2>
                <button
                  onClick={toggleDropdown}
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <span>Action</span>
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          User
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Role
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Assigned At
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {permissions.length > 0 ? (
                        permissions.map((permission) => (
                          <tr key={permission.user_role_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {permission.user}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {permission.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(permission.assigned_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  permission.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {permission.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-indigo-600 hover:text-indigo-900 mr-2">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No permissions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ChatbotPopup />
    </div>
  );
}
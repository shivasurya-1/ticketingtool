import { useState, useEffect } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import Sidebar from "../../components/Sidebar";
import ChatbotPopup from "../../components/ChatBot";
import { ToastContainer, toast } from "react-toastify";

export default function Permissions() {
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

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

    const fetchPermissions = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await axiosInstance.get("/roles/permissions/", {
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
  }, []);

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
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">All Permissions</h2>

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
                          Permission ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>

                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {permissions.length > 0 ? (
                        permissions.map((permission) => (
                          <tr key={permission.permission_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {permission.permission_id}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {permission.name}
                              </div>
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
                            colSpan="3"
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
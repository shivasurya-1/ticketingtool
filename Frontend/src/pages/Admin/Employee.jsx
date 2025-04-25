import { useState, useEffect } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import Sidebar from "../../components/Sidebar";
import ChatbotPopup from "../../components/ChatBot";
import { ToastContainer, toast } from "react-toastify";

export default function Employee() {
  const [loading, setLoading] = useState(true);
  const [organisations, setOrganisations] = useState([]);
  const [employees, setEmployees] = useState([]);

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

    const fetchEmployees = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        // Use your custom axiosInstance instead of the direct axios import
      const response = await axiosInstance.get("/org/employee/", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        setEmployees(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to fetch employees data");
        setLoading(false);
      }
    };
    if (checkAuthentication()) {
      fetchEmployees();
    }
  }, []);

  // Function to format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Function to determine role label based on user_role
  const getRoleLabel = (roleId) => {
    const roles = {
      1: "Admin",
      2: "Manager",
      3: "Employee"
    };
    return roles[roleId] || "Unknown";
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <main className="flex-1">
        <div className="p-8">
          <div className="mb-6">

          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* <OrgChart /> */}

            {/* Employee Table */}
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Employee Directory</h2>
              
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employees.length > 0 ? (
                        employees.map((employee) => (
                          <tr key={employee.employee_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.employee_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{employee.username}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.organisation_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {getRoleLabel(employee.user_role)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.level}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.parent || "None"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(employee.created_at)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                              <button className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                            No employees found
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
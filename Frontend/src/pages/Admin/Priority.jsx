import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import ChatbotPopup from "../../components/ChatBot";
import Button from "../../components/common/Button";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";

export default function Priority() {
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(5);
  const [priorities, setPriorities] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState({
    urgencyName: "",
    description: "",
    responseTargetTime: "",
    isActive: true
  });
  const [addPriority, setAddPriority] = useState(false);
  const [editPriority, setEditPriority] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentEntries, setCurrentEntries] = useState({
    start: 0,
    end: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef(null);
  const formRef = useRef(null);

  // Filter priorities based on search term - real-time filtering
  const filteredPriorities = priorities.filter(priority => {
    return (
      priority.urgency_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (priority.description && priority.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      priority.priority_id.toString().includes(searchTerm) ||
      (priority.response_target_time && priority.response_target_time.toString().includes(searchTerm))
    );
  });

  // Calculate pagination values - safeguard against empty data
  const pageCount = Math.max(1, Math.ceil(filteredPriorities.length / pageSize));
  
  // Calculate offset once after currentPage and pageSize are set
  const offset = currentPage * pageSize;
  
  // Get current items for display
  const currentItems = filteredPriorities.slice(offset, offset + pageSize);

  // Fetch priorities on component mount only
  useEffect(() => {
    fetchPriorities();
  }, []);

  // Update current entries information and total entries when filteredPriorities, offset, or pageSize changes
  useEffect(() => {
    const start = filteredPriorities.length > 0 ? offset + 1 : 0;
    const end = Math.min(offset + pageSize, filteredPriorities.length);
    setCurrentEntries({ start, end });
    setTotalEntries(filteredPriorities.length);
  }, [filteredPriorities.length, offset, pageSize]);

  // Ensure currentPage is never out of bounds - only run this when pageCount or filteredPriorities change
  useEffect(() => {
    if (currentPage >= pageCount && pageCount > 0 && filteredPriorities.length > 0) {
      setCurrentPage(Math.max(0, pageCount - 1));
    }
  }, [filteredPriorities.length, pageCount, currentPage]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // Scroll to top when changing to the last page with fewer items
  useEffect(() => {
    if (currentPage === pageCount - 1 && currentItems.length < pageSize) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);
    }
  }, [currentPage, pageCount, currentItems.length, pageSize]);

  const fetchPriorities = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to access this page.");
      setLoading(false);
      return;
    }
    try {
      const response = await axiosInstance.get("/priority/priority/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 200) {
        setPriorities(response.data);
        // Reset to first page when data changes significantly
        setCurrentPage(0);
      }
    } catch (error) {
      console.error("Error fetching priorities:", error);
      toast.error("Failed to load priorities");
      setPriorities([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle checkbox separately
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Function to handle edit button click
  const handleEditClick = (priority) => {
    setSelectedPriority(priority);
    
    // Fill form with current priority data
    setFormData({
      urgencyName: priority.urgency_name,
      description: priority.description || "",
      // Store the raw backend format for the edit form
      responseTargetTime: priority.response_target_time || "",
      isActive: priority.is_active
    });
    
    setEditPriority(true);
  };

  // Handle status toggle
  const handleStatusToggle = async (priority) => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to update priorities.");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.put(
        `/priority/priority/${priority.priority_id}/`,
        {
          urgency_name: priority.urgency_name,
          description: priority.description,
          input_response_target_time: priority.response_target_time,
          is_active: !priority.is_active
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success(`Priority status ${!priority.is_active ? 'activated' : 'deactivated'} successfully`);
        await fetchPriorities();
      }
    } catch (error) {
      console.error("Error updating priority status:", error);
      toast.error(error.response?.data?.message || "Failed to update priority status");
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes in real-time
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Time conversion functions
  const isBackendFormat = (timeStr) => {
    if (!timeStr) return false;
    // Match pattern like: "4 20:10:20" (days hours:minutes:seconds) or "0days 02:00:00" 
    const backendFormatRegex = /^(\d+)(?:\s|\s?days\s)(\d{1,2}:\d{1,2}:\d{1,2})$/;
    return backendFormatRegex.test(timeStr);
  };

  const normalizeBackendFormat = (timeStr) => {
    if (!timeStr) return "0 00:00:00";
    
    // If it's in the format "0days 02:00:00", convert to "0 02:00:00"
    if (timeStr.includes("days")) {
      const match = timeStr.match(/^(\d+)days\s+(\d{2}:\d{2}:\d{2})$/);
      if (match) {
        return `${match[1]} ${match[2]}`;
      }
    }
    
    // Return as is if already in correct format
    if (isBackendFormat(timeStr)) {
      return timeStr;
    }
    
    return timeStr;
  };

  const convertTimeToBackendFormat = (timeStr) => {
    if (!timeStr || timeStr.trim() === "") return "0 00:00:00";
    
    // Normalize the format if it's already in backend format
    if (isBackendFormat(timeStr) || timeStr.includes("days")) {
      return normalizeBackendFormat(timeStr);
    }
    
    // Handle direct numeric input (assume hours)
    if (!isNaN(timeStr) && timeStr !== "") {
      const hours = parseFloat(timeStr);
      const days = Math.floor(hours / 24);
      const remainingHours = Math.floor(hours % 24);
      const minutes = Math.floor((hours * 60) % 60);
      const seconds = Math.floor((hours * 3600) % 60);
      
      return `${days} ${String(remainingHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    // Handle HH:MM:SS format (assume hours:minutes:seconds, no days)
    if (timeStr.includes(":")) {
      const parts = timeStr.split(":");
      
      // If we have exactly three parts, assume it's HH:MM:SS (no days)
      if (parts.length === 3) {
        const hours = parseInt(parts[0]) || 0;
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        
        return `${days} ${String(remainingHours).padStart(2, '0')}:${String(parseInt(parts[1]) || 0).padStart(2, '0')}:${String(parseInt(parts[2]) || 0).padStart(2, '0')}`;
      } 
      // If we have two parts, assume it's HH:MM (no days, no seconds)
      else if (parts.length === 2) {
        const hours = parseInt(parts[0]) || 0;
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        
        return `${days} ${String(remainingHours).padStart(2, '0')}:${String(parseInt(parts[1]) || 0).padStart(2, '0')}:00`;
      }
    }
    
    // Handle "X hours" format
    if (timeStr.toLowerCase().includes("hour")) {
      const match = timeStr.match(/(\d+(\.\d+)?)/);
      if (match) {
        const hours = parseFloat(match[1]);
        const days = Math.floor(hours / 24);
        const remainingHours = Math.floor(hours % 24);
        const minutes = Math.floor((hours * 60) % 60);
        const seconds = Math.floor((hours * 3600) % 60);
        
        return `${days} ${String(remainingHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
    }
    
    return "0 00:00:00"; // Default if cannot parse
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.urgencyName) {
      toast.error("Please fill in the required fields");
      return;
    }

    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to add priorities.");
      setLoading(false);
      return;
    }

    // Convert the target time to the backend format
    const formattedTargetTime = convertTimeToBackendFormat(formData.responseTargetTime);

    const parseFormData = (data) => ({
      urgency_name: data.urgencyName,
      description: data.description,
      input_response_target_time: formattedTargetTime,
      is_active: data.isActive
    });

    try {
      const parsedData = parseFormData(formData);
      const response = await axiosInstance.post(
        "/priority/priority/",
        parsedData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("Priority added successfully");
        setAddPriority(false);
        setFormData({
          urgencyName: "",
          description: "",
          responseTargetTime: "",
          isActive: true
        });
        // Refresh the data after adding new priority
        await fetchPriorities();
      }
    } catch (error) {
      console.error("Error adding priority:", error);
      toast.error(
        error.response?.data?.message || "Failed to add priority"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle update/edit submit
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!formData.urgencyName) {
      toast.error("Please fill in the required fields");
      return;
    }

    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to update priorities.");
      setLoading(false);
      return;
    }

    // Always convert the target time to the backend format
    const formattedTargetTime = convertTimeToBackendFormat(formData.responseTargetTime);

    const parseFormData = (data) => ({
      urgency_name: data.urgencyName,
      description: data.description,
      input_response_target_time: formattedTargetTime,
      is_active: data.isActive
    });

    try {
      const parsedData = parseFormData(formData);
      const response = await axiosInstance.put(
        `/priority/priority/${selectedPriority.priority_id}/`,
        parsedData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Priority updated successfully");
        setEditPriority(false);
        setSelectedPriority(null);
        setFormData({
          urgencyName: "",
          description: "",
          responseTargetTime: "",
          isActive: true
        });
        // Refresh the data after updating priority
        await fetchPriorities();
      }
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error(
        error.response?.data?.message || "Failed to update priority"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle changing page size
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(0); // Reset to first page when changing page size
  };

  // Reset form data and close modals
  const handleCancel = () => {
    setFormData({
      urgencyName: "",
      description: "",
      responseTargetTime: "",
      isActive: true
    });
    setAddPriority(false);
    setEditPriority(false);
    setSelectedPriority(null);
  };

  // Format the target time for display
  const formatTargetTime = (timeValue) => {
    if (!timeValue) return "-";
    
    try {
      // First normalize the format if it contains "days"
      let normalizedValue = timeValue;
      if (timeValue.includes("days")) {
        const match = timeValue.match(/^(\d+)days\s+(\d{2}:\d{2}:\d{2})$/);
        if (match) {
          normalizedValue = `${match[1]} ${match[2]}`;
        }
      }
      
      // Expected format: "D HH:MM:SS"
      const parts = normalizedValue.split(' ');
      if (parts.length !== 2) return timeValue; // Return as-is if not in expected format
      
      const days = parseInt(parts[0]);
      const timeParts = parts[1].split(':');
      
      if (timeParts.length !== 3) return timeValue; // Return as-is if not in expected format
      
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);
      const seconds = parseInt(timeParts[2]);
      
      let result = [];
      
      if (days > 0) {
        result.push(`${days} day${days !== 1 ? 's' : ''}`);
      }
      
      if (hours > 0) {
        result.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
      }
      
      if (minutes > 0) {
        result.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
      }
      
      if (seconds > 0) {
        result.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
      }
      
      if (result.length === 0) {
        return "0 seconds";
      }
      
      return result.join(' ');
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeValue; // Return as-is if there's an error
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 mx-4 md:mx-8 lg:mx-16">
        <div className="p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-3xl md:text-[39px] font-semibold text-gray-800">Priorities</h1>
            <p className="text-sm text-gray-500">
              Add, Search, and Manage your priorities all in one place
            </p>
          </div>

          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Real-time search input */}
            <div className="relative w-full md:w-auto">
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Search Priority"
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="pl-10 pr-4 py-2 border rounded-md w-full md:w-[300px] focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
              />
              <svg 
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button label="Bulk Import" />
              <Button
                onClick={() => setAddPriority(true)}
                label="Add Priority"
                blueBackground
              />
            </div>
          </div>

          {/* Add Priority Modal */}
          {addPriority && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="relative bg-white p-6 md:p-8 rounded-lg shadow-lg w-[90%] md:w-[70%] lg:w-[45%] max-h-[90vh] overflow-y-auto">
                <h1 className="text-xl font-semibold mb-4 text-gray-800">Add Priority</h1>
                <hr className="border-t border-gray-300 mb-6" />
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col">
                    <label
                      htmlFor="urgencyName"
                      className="font-medium mb-2 text-gray-700"
                    >
                      Urgency Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="urgencyName"
                      name="urgencyName"
                      value={formData.urgencyName}
                      onChange={handleFormChange}
                      required
                      className="border p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                      placeholder="Enter urgency name"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="responseTargetTime" className="font-medium mb-2 text-gray-700">
                      Target Response Time
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      Enter time in any format: "4 20:10:20" (4 days, 20 hours, 10 minutes, 20 seconds), 
                      "24" (24 hours), or "3:30" (3 hours, 30 minutes)
                    </p>
                    <input
                      id="responseTargetTime"
                      name="responseTargetTime"
                      type="text"
                      value={formData.responseTargetTime}
                      onChange={handleFormChange}
                      placeholder="e.g., 4 20:10:20 or 24 or 3:30"
                      className="border p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="description" className="font-medium mb-2 text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Enter a detailed description for this priority level"
                      className="border p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                      rows="3"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="ml-2 font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                  {/* Cancel and ADD Button */}
                  <div className="flex justify-end gap-4 pt-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="border p-2 px-4 rounded-md hover:bg-gray-100 transition"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="border p-2 px-6 rounded-md bg-[#2E6EC0] text-white hover:bg-[#2255a4] transition"
                      disabled={loading}
                    >
                      {loading ? "Adding..." : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Priority Modal */}
          {editPriority && selectedPriority && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="relative bg-white p-6 md:p-8 rounded-lg shadow-lg w-[90%] md:w-[70%] lg:w-[45%] max-h-[90vh] overflow-y-auto">
                <h1 className="text-xl font-semibold mb-4 text-gray-800">Edit Priority</h1>
                <hr className="border-t border-gray-300 mb-6" />
                <form ref={formRef} onSubmit={handleUpdateSubmit} className="space-y-6">
                  <div className="flex flex-col">
                    <label
                      htmlFor="urgencyName"
                      className="font-medium mb-2 text-gray-700"
                    >
                      Urgency Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="urgencyName"
                      name="urgencyName"
                      value={formData.urgencyName}
                      onChange={handleFormChange}
                      required
                      className="border p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="responseTargetTime" className="font-medium mb-2 text-gray-700">
                      Target Response Time
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      Enter time in any format: "4 20:10:20" (4 days, 20 hours, 10 minutes, 20 seconds), 
                      "24" (24 hours), or "3:30" (3 hours, 30 minutes)
                    </p>
                    <input
                      id="responseTargetTime"
                      name="responseTargetTime"
                      type="text"
                      value={formData.responseTargetTime}
                      onChange={handleFormChange}
                      placeholder="e.g., 4 20:10:20 or 24 or 3:30"
                      className="border p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="description" className="font-medium mb-2 text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      className="border p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                      rows="3"
                      placeholder="Enter a detailed description for this priority level"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="ml-2 font-medium text-gray-700">
                      Active
                    </label>
                    <p className="ml-4 text-sm text-gray-500">
                      (Controls whether this priority is available for selection)
                    </p>
                  </div>
                  {/* Cancel and UPDATE Button */}
                  <div className="flex justify-end gap-4 pt-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="border p-2 px-4 rounded-md hover:bg-gray-100 transition"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="border p-2 px-6 rounded-md bg-[#2E6EC0] text-white hover:bg-[#2255a4] transition"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

         
          {/* Priorities Table */}
          <div className="bg-white rounded-md border overflow-hidden mt-8 shadow-sm">
            {loading ? (
              <div className="p-4 text-center">Loading priorities...</div>
            ) : !filteredPriorities.length ? (
              <div className="p-4 text-center">
                {searchTerm ? "No matching priorities found" : "No priorities found"}
              </div>
            ) : (
              <table className="min-w-full table-fixed">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Priority ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Urgency Name
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Target Time
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((priority, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } border-t border-gray-200 hover:bg-gray-100 transition-colors`}
                    >
                      <td className="px-4 py-3 break-words">
                        {priority.priority_id}
                      </td>
                      <td className="px-4 py-3 break-words font-medium">
                        {priority.urgency_name}
                      </td>
                      <td className="px-4 py-3 break-words text-gray-600">
                        {priority.description || "-"}
                      </td>
                      <td className="px-4 py-3 break-words">
                        {formatTargetTime(priority.response_target_time)}
                      </td>
                      <td className="px-4 py-3 break-words">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {priority.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 break-words">
                        <button
                          onClick={() => handleEditClick(priority)}
                          className="text-blue-600 hover:text-blue-800 mr-4 transition-colors"
                        >
                          Edit
                        </button>
                        {/* Removed the deactivate button as requested - using checkbox in edit modal instead */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination and Page Size Controls */}
          {filteredPriorities.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 mb-8">
              <div className="mb-4 md:mb-0">
                <label htmlFor="pageSize" className="mr-2 text-sm text-gray-600">
                  Items per page:
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="border rounded-md p-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="2">2</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                {totalEntries > 0 && (
                  <span className="ml-4 text-sm text-gray-600">
                    Showing {currentEntries.start} to {currentEntries.end} of{" "}
                    {totalEntries} entries
                  </span>
                )}
              </div>

              <ReactPaginate
                previousLabel={"← Previous"}
                nextLabel={"Next →"}
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                forcePage={currentPage}
                containerClassName="flex space-x-1"
                pageClassName="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                activeClassName="bg-blue-500 text-white border-blue-500"
                previousClassName="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                nextClassName="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
        </div>
      </main>
      <ChatbotPopup />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
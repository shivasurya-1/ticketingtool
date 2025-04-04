import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import SearchIconRight from "../components/common/SearchRightIcon";
import ChatbotPopup from "../components/ChatBot";
import Button from "../components/common/Button";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import { axiosInstance } from "../utils/axiosInstance";

export default function Priority() {
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(5);
  const [priorities, setPriorities] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState({
    urgencyName: "",
    description: "",
    responseTargetTime: "",
  });
  const [addPriority, setAddPriority] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentEntries, setCurrentEntries] = useState({
    start: 0,
    end: 0
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Filter priorities based on search term
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Convert time string to float (hours)
  const convertTimeToFloat = (timeStr) => {
    // Handle direct numeric input
    if (!isNaN(timeStr) && timeStr !== "") {
      return parseFloat(timeStr);
    }
    
    // Handle HH:MM:SS format
    if (timeStr.includes(":")) {
      const parts = timeStr.split(":");
      let hours = 0;
      
      if (parts.length >= 1) hours += parseInt(parts[0]) || 0;
      if (parts.length >= 2) hours += (parseInt(parts[1]) || 0) / 60;
      if (parts.length >= 3) hours += (parseInt(parts[2]) || 0) / 3600;
      
      return hours;
    }
    
    // Handle "X hours" format
    if (timeStr.toLowerCase().includes("hour")) {
      const match = timeStr.match(/(\d+(\.\d+)?)/);
      if (match) {
        return parseFloat(match[1]);
      }
    }
    
    return 0; // Default if cannot parse
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(0); // Reset to first page when searching
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

    // Convert the target time to float before sending
    const targetTimeFloat = convertTimeToFloat(formData.responseTargetTime);

    const parseFormData = (data) => ({
      urgency_name: data.urgencyName,
      description: data.description,
      response_target_time: targetTimeFloat,
    });

    try {
      const parsedData = parseFormData(formData);
      console.log("parsedData", parsedData);
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

  // Handle changing page size
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(0); // Reset to first page when changing page size
  };

  // Format the target time for display
  const formatTargetTime = (timeValue) => {
    if (!timeValue && timeValue !== 0) return "-";
    
    const hours = parseFloat(timeValue);
    if (isNaN(hours)) return timeValue;
    
    if (hours === Math.floor(hours)) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const wholeHours = Math.floor(hours);
      const minutes = Math.round((hours - wholeHours) * 60);
      
      if (wholeHours === 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      } else {
        return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <main className="flex-1 mx-16">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-[39px] font-semibold">Priorities</h1>
            <p className="text-sm text-muted-foreground">
              Add, Search, and Manage your priorities all in one place
            </p>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <SearchIconRight 
              placeholder="Search Priority" 
              onSearch={handleSearchChange}
            />
            <div className="flex gap-2">
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
              <div className="relative bg-white p-8 rounded-lg shadow-lg w-[45%]">
                <h1 className="text-lg font-semibold mb-4">Add Priority</h1>
                <hr className="absolute left-0 right-0 border-t border-gray-300" />
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  <div className="flex flex-col">
                    <label
                      htmlFor="urgencyName"
                      className="font-medium mb-4"
                    >
                      Urgency Name
                    </label>
                    <input
                      id="urgencyName"
                      name="urgencyName"
                      value={formData.urgencyName}
                      onChange={handleFormChange}
                      required
                      className="border p-3 w-full rounded-md drop-shadow-lg"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="responseTargetTime" className="font-medium mb-2">
                      Target Time
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      Enter time in hours. You can use formats like "3" (for 3 hours), "1.5" (for 1 hour 30 min), 
                      or "3:30:0" (for 3 hours 30 min)
                    </p>
                    <input
                      id="responseTargetTime"
                      name="responseTargetTime"
                      type="text"
                      value={formData.responseTargetTime}
                      onChange={handleFormChange}
                      placeholder="e.g. 24 or 3:30"
                      className="border p-3 w-full rounded-md drop-shadow-lg"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="description" className="font-medium">
                      Description
                    </label>
                    <p className="text-sm text-gray-500 mt-2 mb-2">
                      Enter a detailed description for this priority level.
                    </p>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      className="border p-3 w-full rounded-md drop-shadow-lg"
                      rows="3"
                    />
                  </div>
                  {/* Cancel and ADD Button */}
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setAddPriority(false)}
                      className="border p-2 rounded-md"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="border p-2 rounded-md bg-[#2E6EC0] text-white"
                      disabled={loading}
                    >
                      {loading ? "Adding..." : "ADD"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Priorities Table */}
          <div className="bg-white rounded-md border overflow-hidden mt-8">
            {loading ? (
              <div className="p-4 text-center">Loading priorities...</div>
            ) : !filteredPriorities.length ? (
              <div className="p-4 text-center">
                {searchTerm ? "No matching priorities found" : "No priorities found"}
              </div>
            ) : (
              <table className="min-w-full table-fixed">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 text-left font-medium">Priority ID</th>
                    <th className="px-4 py-2 text-left font-medium">
                      Urgency Name
                    </th>
                    <th className="px-4 py-2 text-left font-medium">
                      Description
                    </th>
                    <th className="px-4 py-2 text-left font-medium">
                      Target Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((priority, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100`}
                    >
                      <td className="px-4 py-2 break-words">
                        {priority.priority_id}
                      </td>
                      <td className="px-4 py-2 break-words">
                        {priority.urgency_name}
                      </td>
                      <td className="px-4 py-2 break-words">
                        {priority.description || "-"}
                      </td>
                      <td className="px-4 py-2 break-words">
                        {formatTargetTime(priority.response_target_time)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination and Page Size Controls */}
          {filteredPriorities.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center mt-4">
              <div className="mb-4 md:mb-0">
                <label htmlFor="pageSize" className="mr-2 text-sm">
                  Items per page:
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="border rounded-md p-1"
                >
                  <option value="2">2</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                {totalEntries > 0 && (
                  <span className="ml-4 text-sm">
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
                containerClassName="flex space-x-2"
                pageClassName="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-300"
                activeClassName="bg-blue-500 text-white"
                previousClassName="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-300"
                nextClassName="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-300"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
        </div>
      </main>
      <ChatbotPopup />
      <ToastContainer />
    </div>
  );
}
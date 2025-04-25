import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import ChatbotPopup from "../../components/ChatBot";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";

export default function SolutionGroup() {
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(5);
  const [solutionGroups, setSolutionGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState({
    groupName: "",
    category: "",
    organisation: "",
    isActive: true
  });
  const [showSolutionGroupModal, setShowSolutionGroupModal] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentEntries, setCurrentEntries] = useState({
    start: 0,
    end: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedSolutionGroupId, setSelectedSolutionGroupId] = useState(null);
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Handle click outside for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Filter solution groups based on search term
  const filteredSolutionGroups = solutionGroups.filter((group) => {
    if (!searchTerm.trim()) return true;
    
    const searchTermLower = searchTerm.toLowerCase().trim();
    return (
      group.group_name.toLowerCase().includes(searchTermLower) ||
      group.solution_id.toString().includes(searchTermLower) ||
      (group.category && group.category.toLowerCase().includes(searchTermLower)) ||
      (group.organisation && group.organisation.toLowerCase().includes(searchTermLower))
    );
  });

  // Calculate pagination values
  const pageCount = Math.max(
    1,
    Math.ceil(filteredSolutionGroups.length / pageSize)
  );
  const offset = currentPage * pageSize;
  const currentItems = filteredSolutionGroups.slice(offset, offset + pageSize);

  // Fetch solution groups, categories and organisations on component mount
  useEffect(() => {
    fetchSolutionGroups();
    fetchCategories();
    fetchOrganisations();
  }, []);

  // Update current entries information when filteredSolutionGroups changes
  useEffect(() => {
    const start = filteredSolutionGroups.length > 0 ? offset + 1 : 0;
    const end = Math.min(offset + pageSize, filteredSolutionGroups.length);
    setCurrentEntries({ start, end });
    setTotalEntries(filteredSolutionGroups.length);
  }, [filteredSolutionGroups.length, offset, pageSize]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // Ensure currentPage is never out of bounds
  useEffect(() => {
    if (
      currentPage >= pageCount &&
      pageCount > 0 &&
      filteredSolutionGroups.length > 0
    ) {
      setCurrentPage(Math.max(0, pageCount - 1));
    }
  }, [filteredSolutionGroups.length, pageCount, currentPage]);

  // Scroll to top when changing to the last page with fewer items
  useEffect(() => {
    if (currentPage === pageCount - 1 && currentItems.length < pageSize) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);
    }
  }, [currentPage, pageCount, currentItems.length, pageSize]);

  const fetchSolutionGroups = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to access this page.");
      setLoading(false);
      return;
    }
    try {
      const response = await axiosInstance.get("/solution_grp/create/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 200) {
        setSolutionGroups(response.data);
        // Reset to first page when data changes significantly
        setCurrentPage(0);
      }
    } catch (error) {
      console.error("Error fetching solution groups:", error);
      toast.error("Failed to load solution groups");
      setSolutionGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      return;
    }
    try {
      const response = await axiosInstance.get("/category/create/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 200) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const fetchOrganisations = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      return;
    }
    try {
      const response = await axiosInstance.get("/org/organisation/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 200) {
        setOrganisations(response.data);
      }
    } catch (error) {
      console.error("Error fetching organisations:", error);
      toast.error("Failed to load organisations");
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.groupName || !formData.category || !formData.organisation) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to manage solution groups.");
      setLoading(false);
      return;
    }

    const parseFormData = (data) => ({
      group_name: data.groupName,
      category: data.category,
      organisation: data.organisation,
      is_active: data.isActive
    });

    try {
      const parsedData = parseFormData(formData);
      let response;
      
      if (modalMode === "add") {
        response = await axiosInstance.post(
          "/solution_grp/create/",
          parsedData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (response.status === 201 || response.status === 200) {
          toast.success("Solution Group added successfully");
        }
      } else if (modalMode === "edit") {
        response = await axiosInstance.put(
          `/solution_grp/solutions/${selectedSolutionGroupId}/`,
          parsedData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (response.status === 200) {
          toast.success("Solution Group updated successfully");
        }
      }
      
      setShowSolutionGroupModal(false);
      resetForm();
      // Refresh the data after adding/editing solution group
      await fetchSolutionGroups();
    } catch (error) {
      console.error("Error managing solution group:", error);
      toast.error(
        error.response?.data?.message || `Failed to ${modalMode} solution group`
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(0);
  };

  const resetForm = () => {
    setFormData({
      groupName: "",
      category: "",
      organisation: "",
      isActive: true
    });
    setSelectedSolutionGroupId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode("add");
    setShowSolutionGroupModal(true);
    setDropdownOpen(false);
  };

  const openEditModal = () => {
    setModalMode("edit");
    setShowSolutionGroupModal(false);
    setDropdownOpen(false);
    
    const groupId = prompt("Please enter the Solution Group ID you want to edit:");
    if (!groupId) return;
    
    const selectedGroup = solutionGroups.find(
      group => group.solution_id.toString() === groupId.trim()
    );
    
    if (selectedGroup) {
      setSelectedSolutionGroupId(selectedGroup.solution_id);
      setFormData({
        groupName: selectedGroup.group_name,
        category: selectedGroup.category_id || "",
        organisation: selectedGroup.organisation_id || "",
        isActive: selectedGroup.is_active || true
      });
      setShowSolutionGroupModal(true);
    } else {
      toast.error("Solution Group not found with the provided ID.");
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Solution Groups</h1>
            <p className="mt-2 text-sm text-gray-600">
              Add, search, and manage your solution groups all in one place
            </p>
          </header>
  
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              {/* Enhanced search input */}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className="h-5 w-5 text-gray-400" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Search Solution Group"
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                />
              </div>
              
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <span>Actions</span>
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
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-100 overflow-hidden">
                    <ul className="py-1">
                      <li>
                        <button
                          onClick={openAddModal}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <svg 
                            className="w-4 h-4 mr-2" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Add Solution Group
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={openEditModal}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <svg 
                            className="w-4 h-4 mr-2" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit Solution Group
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
  
          {/* Solution Groups Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading solution groups...</span>
              </div>
            ) : !filteredSolutionGroups.length ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm
                  ? "No matching solution groups found"
                  : "No solution groups found"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Group Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organisation
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((group, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {group.solution_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {group.group_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {group.category || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {group.organisation || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            group.is_active !== false 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {group.is_active !== false ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination and Page Size Controls */}
            {filteredSolutionGroups.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center">
                    <label htmlFor="pageSize" className="text-sm text-gray-600 mr-2">
                      Show:
                    </label>
                    <select
                      id="pageSize"
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      className="border border-gray-200 rounded-md text-sm py-1 px-2 focus:ring-blue-500 focus:border-blue-500"
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
                    previousLabel={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    }
                    nextLabel={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    }
                    breakLabel={"..."}
                    pageCount={pageCount}
                    marginPagesDisplayed={1}
                    pageRangeDisplayed={2}
                    onPageChange={handlePageClick}
                    forcePage={currentPage}
                    containerClassName="flex items-center space-x-1"
                    pageClassName="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 cursor-pointer text-sm hover:bg-gray-100"
                    activeClassName="bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                    previousClassName="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-100"
                    nextClassName="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-100"
                    disabledClassName="opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
  
        {/* Solution Group Modal (Add/Edit) */}
        {showSolutionGroupModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {modalMode === "add" ? "Add Solution Group" : "Edit Solution Group"}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="px-6 py-4">
                {modalMode === "edit" && (
                  <div className="mb-4">
                    <label htmlFor="solutionGroupId" className="block text-sm font-medium text-gray-700 mb-1">
                      Solution Group ID
                    </label>
                    <input
                      id="solutionGroupId"
                      value={selectedSolutionGroupId || ""}
                      disabled
                      className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 px-3 text-sm"
                    />
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                    Solution Group Name
                  </label>
                  <input
                    id="groupName"
                    name="groupName"
                    value={formData.groupName}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-200 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
  
                <div className="mb-4">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Solution Group Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-200 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>
  
                <div className="mb-4">
                  <label htmlFor="organisation" className="block text-sm font-medium text-gray-700 mb-1">
                    Organisation
                  </label>
                  <select
                    id="organisation"
                    name="organisation"
                    value={formData.organisation}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-200 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an organisation</option>
                    {organisations.map((org) => (
                      <option key={org.id || org.organisation_id} value={org.organisation_id}>
                        {org.organisation_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                      Active Status
                    </label>
                  </div>
                </div>
  
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSolutionGroupModal(false)}
                    className="py-2 px-4 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={loading}
                  >
                    {loading ? 
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {modalMode === "add" ? "Adding..." : "Updating..."}
                      </span> : 
                      (modalMode === "add" ? "Add Solution Group" : "Update Solution Group")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        <ChatbotPopup />
        <ToastContainer />
      </main>
    </div>
  );
}
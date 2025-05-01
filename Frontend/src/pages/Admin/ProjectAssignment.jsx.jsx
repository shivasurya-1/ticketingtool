import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Sidebar from "../../components/Sidebar";
import { FiSearch, FiEdit2, FiEye, FiPlus, FiCheck, FiX } from "react-icons/fi";
import ChatbotPopup from "../../components/ChatBot";
import Button from "../../components/common/Button";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { formatDate } from "../../utils/formatDate";

export default function ProjectAssignment() {
  // User profile from Redux store
  const userProfile = useSelector((state) => state.userProfile.user);

  // State variables
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentEntries, setCurrentEntries] = useState({
    start: 0,
    end: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Data state
  const [organisations, setOrganisations] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [users, setUsers] = useState([]);

  // Form state
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit" or "view"
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [formData, setFormData] = useState({
    organisation: "",
    project: "",
    project_id: null,
    users: [],
  });

  // Filtered data based on selections
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const searchInputRef = useRef(null);

  // Filter assignments based on search term
  const filteredAssignments = assignedProjects.filter((assignment) => {
    if (!searchTerm.trim()) return true;

    const searchTermLower = searchTerm.toLowerCase().trim();
    return (
      assignment.name.toLowerCase().includes(searchTermLower) ||
      assignment.assigned_projects.some((project) =>
        project.toLowerCase().includes(searchTermLower)
      )
    );
  });

  // Calculate pagination values
  const pageCount = Math.max(
    1,
    Math.ceil(filteredAssignments.length / pageSize)
  );
  const offset = currentPage * pageSize;
  const currentItems = filteredAssignments.slice(offset, offset + pageSize);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Update current entries information when filteredAssignments changes
  useEffect(() => {
    const start = filteredAssignments.length > 0 ? offset + 1 : 0;
    const end = Math.min(offset + pageSize, filteredAssignments.length);
    setCurrentEntries({ start, end });
    setTotalEntries(filteredAssignments.length);
  }, [filteredAssignments.length, offset, pageSize]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // Ensure currentPage is never out of bounds
  useEffect(() => {
    if (
      currentPage >= pageCount &&
      pageCount > 0 &&
      filteredAssignments.length > 0
    ) {
      setCurrentPage(Math.max(0, pageCount - 1));
    }
  }, [filteredAssignments.length, pageCount, currentPage]);

  // Update filtered projects when organisation changes
  useEffect(() => {
    if (formData.organisation) {
      const projects = allProjects.filter(
        (project) => project.organisation === formData.organisation
      );
      setFilteredProjects(projects);
      // Reset project selection when organisation changes
      setFormData((prev) => ({
        ...prev,
        project: "",
        project_id: null,
        users: [],
      }));
    } else {
      setFilteredProjects([]);
    }
  }, [formData.organisation, allProjects]);

  // Filter users when userSearchTerm changes
  useEffect(() => {
    if (users.length > 0) {
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [userSearchTerm, users]);

  const fetchData = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to access this page.");
      setLoading(false);
      return;
    }

    const authHeaders = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      // Fetch organisations, projects, and users in parallel
      const [orgResponse, projectsResponse, usersResponse] = await Promise.all([
        axiosInstance.get("/org/organisation/", authHeaders),
        axiosInstance.get("/project/details/", authHeaders),
        axiosInstance.get("user/api/assignee/", authHeaders),
      ]);
      console.log("projectsResponse", projectsResponse.data);
      // Handle organisations data
      const orgs = Array.isArray(orgResponse.data)
        ? orgResponse.data
        : [orgResponse.data];
      setOrganisations(orgs);

      // Handle users data
      const userData = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : [];
      setUsers(userData);
      setFilteredUsers(userData);

      // Handle projects data
      if (projectsResponse.status === 200) {
        const data = projectsResponse.data;

        if (Array.isArray(data)) {
          // Find the object with all_project key
          const projectsObj = data.find((item) => item.all_project);
          if (projectsObj) {
            setAllProjects(projectsObj.all_project);
          }

          // Find the object with assigned_projects key
          const assignmentsObj = data.find((item) => item.assigned_projects);
          if (assignmentsObj) {
            setAssignedProjects(assignmentsObj.assigned_projects);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error?.response?.data);
      toast.error(error?.response?.data?.error || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "project") {
      // Find the selected project to get its ID
      const selectedProject = filteredProjects.find(p => p.project_name === value);
      const projectId = selectedProject ? selectedProject.project_id : null;
      
      setFormData({
        ...formData,
        [name]: value,
        project_id: projectId,
      });
      
      // Log the selected project for debugging
      console.log("Selected project:", selectedProject);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleUserToggle = (username) => {
    setFormData((prev) => {
      const users = [...prev.users];

      if (users.includes(username)) {
        return {
          ...prev,
          users: users.filter((user) => user !== username),
        };
      } else {
        return {
          ...prev,
          users: [...users, username],
        };
      }
    });
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUserSearchChange = (e) => {
    setUserSearchTerm(e.target.value);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.organisation || !formData.project || formData.users.length === 0 || !formData.project_id) {
      toast.error("Please fill in all required fields and select at least one user");
      return;
    }
  
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to manage project assignments.");
      setLoading(false);
      return;
    }
  
    try {
      const projectId = formData.project_id;
      
      // Find the selected project from allProjects to get project_name and product_mail
      const selectedProject = allProjects.find(p => p.project_id === projectId);
      
      if (!selectedProject) {
        toast.error("Project information not found");
        setLoading(false);
        return;
      }
      
      // Prepare data for API - the correct structure that backend expects
      const assignmentData = {
        project_id: projectId,
        users: formData.users,
        project_name: selectedProject.project_name,
        product_mail: selectedProject.product_mail
      };
  
      console.log("Sending data to API:", assignmentData);
  
      let response;
      console.log("assignmentData post", assignmentData);
      if (modalMode === "add") {
        // For adding assignments
        response = await axiosInstance.post(
          `/project/details/`, 
          assignmentData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
       
        if (response.status === 201 || response.status === 200) {
          toast.success("Project assignment added successfully");
        }
      } else if (modalMode === "edit") {
        // For editing assignments
        response = await axiosInstance.put(
          `/project/details/${projectId}/`,
          assignmentData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
  
        if (response.status === 200) {
          toast.success("Project assignment updated successfully");
        }
      }
  
      setShowAssignmentModal(false);
      resetForm();
      // Refresh the data after adding/editing assignment
      await fetchData();
    } catch (error) {
      console.error("Error updating project assignment:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to manage project assignment";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (assignment) => {
    // Find users assigned to this project
    const selectedUsers = assignment.assigned_projects || [];

    // Just show the first project for now
    const projectName = selectedUsers.length > 0 ? selectedUsers[0] : "";

    // Find the project in allProjects
    const project = allProjects.find((p) => p.project_name === projectName);

    setSelectedAssignmentId(assignment.name);
    setFormData({
      organisation: project?.organisation || "",
      project: projectName,
      project_id: project?.project_id || null,
      users: [assignment.name], // User is represented by name in this example
    });
    setModalMode("view");
    setShowAssignmentModal(true);
  };

  const handleEdit = (assignment) => {
    // Similar to handleView, but set mode to edit
    const selectedUsers = assignment.assigned_projects || [];
    const projectName = selectedUsers.length > 0 ? selectedUsers[0] : "";
    const project = allProjects.find((p) => p.project_name === projectName);

    setSelectedAssignmentId(assignment.name);
    setFormData({
      organisation: project?.organisation || "",
      project: projectName,
      project_id: project?.project_id || null,
      users: [assignment.name],
    });
    setModalMode("edit");
    setShowAssignmentModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setUserSearchTerm(""); // Reset user search when opening modal
    setModalMode("add");
    setShowAssignmentModal(true);
  };

  const resetForm = () => {
    setFormData({
      organisation: "",
      project: "",
      project_id: null,
      users: [],
    });
    setSelectedAssignmentId(null);
  };

  const clearUserSearch = () => {
    setUserSearchTerm("");
  };

  return (
    <div className="flex w-full h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="p-4 max-w-full">
          {/* Condensed Header */}
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Project Assignments
              </h1>
              <p className="text-gray-500 text-sm">
                Assign projects to users and manage existing assignments
              </p>
            </div>
            <Button
              blueBackground
              onClick={openAddModal}
              label="Assign Project"
              icon={<FiPlus size={16} />}
              primary={true}
            />
          </div>

          {/* Search bar in a row with other controls */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative w-64">
              <input
                ref={searchInputRef}
                type="text"
                className="border border-gray-300 rounded-lg pl-8 pr-2 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" size={16} />
              </div>
            </div>

            <div className="flex items-center text-sm ml-auto">
              <label htmlFor="pageSize" className="text-gray-600 mr-1">
                Show:
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>

              <span className="ml-2 text-sm text-gray-600">
                {currentEntries.start}-{currentEntries.end} of {totalEntries}
              </span>
            </div>
          </div>

          {/* Assignments Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-fit">
            {loading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-3 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600 text-sm">
                  Loading assignments...
                </p>
              </div>
            ) : !filteredAssignments.length ? (
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                  >
                    <path d="M10 21h4M19 12V8.2c0-1.12 0-1.68-.218-2.108a2 2 0 00-.874-.874C17.48 5 16.92 5 15.8 5H8.2c-1.12 0-1.68 0-2.108.218a2 2 0 00-.874.874C5 6.52 5 7.08 5 8.2V12" />
                    <path d="M15 17H9c-.93 0-1.395 0-1.776.102a3 3 0 00-2.122 2.122C5 19.605 5 20.07 5 21v0M7 10h.01M12 10h.01M17 10h.01" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">
                  {searchTerm
                    ? "No matching assignments found"
                    : "No assignments found"}
                </p>
                <button
                  onClick={openAddModal}
                  className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg flex items-center gap-1 mx-auto text-sm"
                >
                  <FiPlus size={16} />
                  Assign Project
                </button>
              </div>
            ) : (
              <div className="overflow-auto h-full">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Assigned Projects
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.map((assignment, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                          {assignment.name}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-800">
                          <div className="flex flex-wrap gap-1">
                            {assignment.assigned_projects.map(
                              (project, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {project}
                                </span>
                              )
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleView(assignment)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(assignment)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                              title="Edit Assignment"
                            >
                              <FiEdit2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Compact Pagination Controls */}
          {filteredAssignments.length > 0 && (
            <div className="mt-2 flex justify-start items-center">
              <ReactPaginate
                previousLabel={
                  <span className="flex items-center">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </span>
                }
                nextLabel={
                  <span className="flex items-center">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                }
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={1}
                pageRangeDisplayed={2}
                onPageChange={handlePageClick}
                forcePage={currentPage}
                containerClassName="flex space-x-1"
                pageClassName="w-6 h-6 flex items-center justify-center rounded text-xs"
                pageLinkClassName="w-full h-full flex items-center justify-center"
                activeClassName="bg-blue-600 text-white"
                activeLinkClassName="font-medium"
                previousClassName="px-1.5 py-1 rounded flex items-center text-xs text-gray-700 hover:bg-gray-100"
                nextClassName="px-1.5 py-1 rounded flex items-center text-xs text-gray-700 hover:bg-gray-100"
                disabledClassName="opacity-50 cursor-not-allowed"
                breakClassName="w-6 h-6 flex items-center justify-center"
              />
            </div>
          )}

          {/* Assignment Modal */}
          {showAssignmentModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                <div className="border-b border-gray-200 p-3 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {modalMode === "add"
                      ? "Assign Project to Users"
                      : modalMode === "edit"
                      ? "Edit Project Assignment"
                      : "Assignment Details"}
                  </h2>
                  <button
                    onClick={() => setShowAssignmentModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  {/* Organisation Selection */}
                  <div>
                    <label
                      htmlFor="organisation"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Organisation{" "}
                      {modalMode !== "view" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <select
                      id="organisation"
                      name="organisation"
                      value={formData.organisation}
                      onChange={handleFormChange}
                      required={modalMode !== "view"}
                      disabled={modalMode === "view"}
                      className={`border rounded-lg p-2 w-full text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        modalMode === "view" ? "bg-gray-50 text-gray-500" : ""
                      }`}
                    >
                      <option value="">Select Organisation</option>
                      {organisations.map((org, index) => (
                        <option key={index} value={org.organisation_name}>
                          {org.organisation_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Project Selection */}
                  <div>
                    <label
                      htmlFor="project"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Project{" "}
                      {modalMode !== "view" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <select
                      id="project"
                      name="project"
                      value={formData.project}
                      onChange={handleFormChange}
                      required={modalMode !== "view"}
                      disabled={modalMode === "view" || !formData.organisation}
                      className={`border rounded-lg p-2 w-full text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        modalMode === "view" || !formData.organisation
                          ? "bg-gray-50 text-gray-500"
                          : ""
                      }`}
                    >
                      <option value="">Select Project</option>
                      {filteredProjects.map((project, index) => (
                        <option key={index} value={project.project_name}>
                          {project.project_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* User Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Users{" "}
                      {modalMode !== "view" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>

                    {/* User search input - only show in add/edit mode */}
                    {modalMode !== "view" && (
                      <div className="relative mb-2">
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg pl-8 pr-8 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                          placeholder="Search users..."
                          value={userSearchTerm}
                          onChange={handleUserSearchChange}
                        />
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <FiSearch className="text-gray-400" size={16} />
                        </div>
                        {userSearchTerm && (
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-2 flex items-center"
                            onClick={clearUserSearch}
                          >
                            <FiX className="text-gray-400" size={16} />
                          </button>
                        )}
                      </div>
                    )}

                    <div
                      className={`border rounded-lg p-2 w-full max-h-48 overflow-y-auto ${
                        modalMode === "view" ? "bg-gray-50" : ""
                      }`}
                    >
                      {modalMode !== "view" &&
                        filteredUsers.length === 0 &&
                        userSearchTerm && (
                          <p className="text-gray-500 text-sm text-center py-2">
                            No users matching "{userSearchTerm}"
                          </p>
                        )}

                      {(modalMode === "view" ? users : filteredUsers).length ===
                        0 && !userSearchTerm ? (
                        <p className="text-gray-500 text-sm text-center py-2">
                          {formData.organisation
                            ? "No users available"
                            : "Select an organisation first"}
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {(modalMode === "view"
                            ? users.filter((user) =>
                                formData.users.includes(user.username)
                              )
                            : filteredUsers
                          ).map((user, index) => (
                            <div
                              key={index}
                              className="flex items-center p-1 hover:bg-gray-50 rounded"
                            >
                              <div
                                className={`flex-1 text-sm ${
                                  modalMode === "view" ? "text-gray-500" : ""
                                }`}
                              >
                                {user.username}
                              </div>

                              {modalMode !== "view" && (
                                <div
                                  onClick={() =>
                                    handleUserToggle(user.username)
                                  }
                                  className={`h-5 w-5 rounded flex items-center justify-center cursor-pointer ${
                                    formData.users.includes(user.username)
                                      ? "bg-blue-500 text-white"
                                      : "border border-gray-300"
                                  }`}
                                >
                                  {formData.users.includes(user.username) && (
                                    <FiCheck size={12} />
                                  )}
                                </div>
                              )}

                              {modalMode === "view" &&
                                formData.users.includes(user.username) && (
                                  <div className="h-5 w-5 rounded flex items-center justify-center bg-blue-500 text-white">
                                    <FiCheck size={12} />
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Show selected users count in add/edit mode */}
                    {modalMode !== "view" && (
                      <div className="text-xs text-gray-500 mt-1">
                        {formData.users.length} user(s) selected
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t">
                    {modalMode === "view" ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit({
                              name: selectedAssignmentId,
                              assigned_projects: [formData.project],
                            })
                          }
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAssignmentModal(false)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                        >
                          Close
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowAssignmentModal(false)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                        >
                          {modalMode === "add"
                            ? "Assign Project"
                            : "Update Assignment"}
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Toast Container for notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          {/* ChatBot component */}
          <ChatbotPopup />
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import ChatbotPopup from "../../components/ChatBot";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";

export default function Projects() {
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(5);
  const [projects, setProjects] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState({
    projectName: "",
    organisation: "",
    productMail: "",
    isActive: true,
    files: null,
  });
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentEntries, setCurrentEntries] = useState({
    start: 0,
    end: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Filter projects based on search term
  const filteredProjects = projects.filter((project) => {
    if (!searchTerm.trim()) return true;

    const searchTermLower = searchTerm.toLowerCase().trim();
    return (
      project.project_name.toLowerCase().includes(searchTermLower) ||
      project.project_id.toString().includes(searchTermLower) ||
      (project.organisation &&
        project.organisation.toLowerCase().includes(searchTermLower)) ||
      (project.product_mail &&
        project.product_mail.toLowerCase().includes(searchTermLower))
    );
  });

  // Calculate pagination values
  const pageCount = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const offset = currentPage * pageSize;
  const currentItems = filteredProjects.slice(offset, offset + pageSize);

  // Fetch projects and organisations on component mount
  useEffect(() => {
    fetchProjects();
    fetchOrganisations();
    fetchProjectMembers();
  }, []);

  // Update current entries information when filteredProjects changes
  useEffect(() => {
    const start = filteredProjects.length > 0 ? offset + 1 : 0;
    const end = Math.min(offset + pageSize, filteredProjects.length);
    setCurrentEntries({ start, end });
    setTotalEntries(filteredProjects.length);
  }, [filteredProjects.length, offset, pageSize]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // Ensure currentPage is never out of bounds
  useEffect(() => {
    if (
      currentPage >= pageCount &&
      pageCount > 0 &&
      filteredProjects.length > 0
    ) {
      setCurrentPage(Math.max(0, pageCount - 1));
    }
  }, [filteredProjects.length, pageCount, currentPage]);

  // Scroll to top when changing to the last page with fewer items
  useEffect(() => {
    if (currentPage === pageCount - 1 && currentItems.length < pageSize) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);
    }
  }, [currentPage, pageCount, currentItems.length, pageSize]);

  const fetchProjects = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to access this page.");
      setLoading(false);
      return;
    }
    try {
      const response = await axiosInstance.get("project/projectdetails/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 200) {
        setProjects(response.data);
        // Reset to first page when data changes significantly
        setCurrentPage(0);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectMembers = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      return;
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
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to manage projects.");
      setLoading(false);
      return;
    }

    // Create FormData object for file upload
    const formDataToSend = new FormData();
    formDataToSend.append("project_name", formData.projectName);
    formDataToSend.append("organisation", formData.org_name);
    formDataToSend.append("product_mail", formData.productMail);
    formDataToSend.append("is_active", formData.isActive);

    if (formData.file) {
      formDataToSend.append("files", formData.file);
    }

    try {
      let response;

      if (modalMode === "add") {
        response = await axiosInstance.post(
          "/project/details/",
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 201 || response.status === 200) {
          toast.success("Project added successfully");
        }
      } else if (modalMode === "edit") {
        response = await axiosInstance.put(
          `/project/projects/${selectedProjectId}/`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200) {
          toast.success("Project updated successfully");
        }
      }

      setShowProjectModal(false);
      resetForm();
      // Refresh the data after adding/editing project
      await fetchProjects();
    } catch (error) {
      console.error("Error managing project:", error);
      toast.error(
        error.response?.data?.message || `Failed to ${modalMode} project`
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
      projectName: "",
      organisation: "",
      productMail: "",
      isActive: true,
      files: null,
    });
    setSelectedProjectId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openAddModal = () => {
    resetForm();
    setModalMode("add");
    setShowProjectModal(true);
    setDropdownOpen(false);
  };

  const openEditModal = () => {
    setModalMode("edit");
    setShowProjectModal(false);
    setDropdownOpen(false);

    const projectId = prompt("Please enter the Project ID you want to edit:");
    if (!projectId) return;

    const selectedProject = projects.find(
      (project) => project.project_id.toString() === projectId.trim()
    );

    if (selectedProject) {
      setSelectedProjectId(selectedProject.project_id);
      setFormData({
        projectName: selectedProject.project_name,
        organisation: selectedProject.org_name || "",
        productMail: selectedProject.product_mail || "",
        isActive: selectedProject.is_active || true,
        files: null, // Can't set file value for security reasons
      });
      setShowProjectModal(true);
    } else {
      toast.error("Project not found with the provided ID.");
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
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="mt-2 text-sm text-gray-600">
              Add, search, and manage your projects all in one place
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
                  placeholder="Search Project"
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
                          Add Project
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
                          Edit Project
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading projects...</span>
              </div>
            ) : !filteredProjects.length ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm
                  ? "No matching projects found"
                  : "No projects found"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Project Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Organisation
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product Mail
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Files
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((project, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {project.project_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {project.project_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {project.org_name || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {project.product_mail || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {project.file ? (
                            <a
                              href={project.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View File
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              project.is_active !== false
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {project.is_active !== false
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination and Page Size Controls */}
            {filteredProjects.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center">
                    <label
                      htmlFor="pageSize"
                      className="text-sm text-gray-600 mr-2"
                    >
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
                        Showing {currentEntries.start} to {currentEntries.end}{" "}
                        of {totalEntries} entries
                      </span>
                    )}
                  </div>

                  <ReactPaginate
                    previousLabel={
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    }
                    nextLabel={
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
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

        {/* Project Modal (Add/Edit) */}
        {showProjectModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {modalMode === "add" ? "Add Project" : "Edit Project"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-4">
                {modalMode === "edit" && (
                  <div className="mb-4">
                    <label
                      htmlFor="projectId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Project ID
                    </label>
                    <input
                      id="projectId"
                      value={selectedProjectId || ""}
                      disabled
                      className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 px-3 text-sm"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label
                    htmlFor="projectName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Project Name
                  </label>
                  <input
                    id="projectName"
                    name="projectName"
                    value={formData.project_name}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-200 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="organisation"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Organisation
                  </label>
                  <select
                    id="organisation"
                    name="organisation"
                    value={formData.org_name}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-200 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an organisation</option>
                    {organisations.map((org) => (
                      <option
                        key={org.id || org.organisation_id}
                        value={org.organisation_id}
                      >
                        {org.organisation_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="productMail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Product Mail
                  </label>
                  <input
                    id="productMail"
                    name="productMail"
                    type="email"
                    value={formData.product_mail}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-200 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="files"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Project Files
                  </label>
                  <input
                    id="files"
                    name="files"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {modalMode === "edit" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to keep the current file
                    </p>
                  )}
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
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Active Status
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
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
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {modalMode === "add" ? "Adding..." : "Updating..."}
                      </span>
                    ) : modalMode === "add" ? (
                      "Add Project"
                    ) : (
                      "Update Project"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ChatbotPopup />
        <ToastContainer
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </main>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import {
  FiSearch,
  FiEdit2,
  FiEye,
  FiPlus,
  FiDownload,
  FiX,
} from "react-icons/fi";
import ChatbotPopup from "../../components/ChatBot";
import Button from "../../components/common/Button";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { formatDate } from "../../utils/formatDate";

export default function Projects() {
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [projects, setProjects] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState({
    projectName: "",
    organisation: "",
    productMail: "",
    isActive: true,
    file: null,
  });
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentEntries, setCurrentEntries] = useState({
    start: 0,
    end: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState("add"); // "add", "edit", or "view"
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [filePreview, setFilePreview] = useState(null);

  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter projects based on search term
  const filteredProjects = projects.filter((project) => {
    if (!searchTerm.trim()) return true;

    const searchTermLower = searchTerm.toLowerCase().trim();
    return (
      project.project_name?.toLowerCase().includes(searchTermLower) ||
      project.project_id?.toString().includes(searchTermLower) ||
      project.org_name?.toLowerCase().includes(searchTermLower) ||
      project.product_mail?.toLowerCase().includes(searchTermLower)
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
        console.log("Projects fetched successfully:", response.data);
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
      if (files.length > 0) {
        setFormData({
          ...formData,
          file: files[0],
        });

        // Create file preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview({
            name: files[0].name,
            size: (files[0].size / 1024).toFixed(2), // Convert to KB
            type: files[0].type,
          });
        };
        reader.readAsDataURL(files[0]);
      }
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

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.projectName ||
      !formData.organisation ||
      !formData.productMail
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

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
    formDataToSend.append("organisation", formData.organisation);
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
          `/project/details/${selectedProjectId}/`,
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
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        `Failed to ${modalMode} project`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      projectName: "",
      organisation: "",
      productMail: "",
      isActive: true,
      file: null,
    });
    setFilePreview(null);
    setSelectedProjectId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleView = (project) => {
    setSelectedProjectId(project.project_id);
    setFormData({
      projectName: project.project_name,
      organisation: project.org_name || "",
      productMail: project.product_mail || "",
      isActive: project.is_active !== false,
      file: null,
    });

    // If project has a file, set the preview
    if (project.file) {
      const fileName = project.file.split("/").pop();
      setFilePreview({
        name: fileName,
        url: project.file,
        isExisting: true,
      });
    } else {
      setFilePreview(null);
    }

    setModalMode("view");
    setShowProjectModal(true);
  };

  const handleEdit = (project) => {
    setSelectedProjectId(project.project_id);
    setFormData({
      projectName: project.project_name,
      organisation: project.org_name || "",
      productMail: project.product_mail || "",
      isActive: project.is_active !== false,
      file: null, // Can't set file directly for security reasons
    });

    // If project has a file, set the preview
    if (project.file) {
      const fileName = project.file.split("/").pop();
      setFilePreview({
        name: fileName,
        url: project.file,
        isExisting: true,
      });
    } else {
      setFilePreview(null);
    }

    setModalMode("edit");
    setShowProjectModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode("add");
    setShowProjectModal(true);
  };

  const clearFileSelection = () => {
    setFormData({
      ...formData,
      file: null,
    });
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadFile = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex w-full h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="p-4 max-w-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
              <p className="text-gray-500 text-sm">
                Add, search, and manage your projects
              </p>
            </div>
            <Button
              blueBackground
              onClick={openAddModal}
              label="Add Project"
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
                placeholder="Search projects..."
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

          {/* Projects Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-fit">
            {loading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-3 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600 text-sm">
                  Loading projects...
                </p>
              </div>
            ) : !filteredProjects.length ? (
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
                    ? "No matching projects found"
                    : "No projects found"}
                </p>
                <button
                  onClick={openAddModal}
                  className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg flex items-center gap-1 mx-auto text-sm"
                >
                  <FiPlus size={16} />
                  Add Project
                </button>
              </div>
            ) : (
              <div className="overflow-auto h-full">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        ID
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Project Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Organisation
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Product Mail
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Created at
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Created by
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Updated at
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Updated by
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.map((project, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                          {project.project_id}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-800">
                          {project.project_name}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-800">
                          {project.org_name || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-800">
                          {project.product_mail || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                                                {formatDate(project.created_at) || "-"}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                                                  {project.created_by || "-"}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                                                  {formatDate(project.modified_at || "-")}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                                                  {project.modified_by || "-"}
                                                </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleView(project)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(project)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                              title="Edit Project"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            {project.file && (
                              <button
                                onClick={() =>
                                  downloadFile(
                                    project.file,
                                    project.file.split("/").pop()
                                  )
                                }
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                                title="Download File"
                              >
                                <FiDownload size={16} />
                              </button>
                            )}
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
          {filteredProjects.length > 0 && (
            <div className="mt-2 flex justify-end items-center">
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

          {/* Project Modal (Add/Edit/View) */}
          {showProjectModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                <div className="border-b border-gray-200 p-3 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {modalMode === "add"
                      ? "Add New Project"
                      : modalMode === "edit"
                      ? "Edit Project"
                      : "Project Details"}
                  </h2>
                  <button
                    onClick={() => setShowProjectModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  {(modalMode === "edit" || modalMode === "view") && (
                    <div>
                      <label
                        htmlFor="projectId"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Project ID
                      </label>
                      <input
                        id="projectId"
                        value={selectedProjectId || ""}
                        disabled
                        className="border border-gray-300 rounded-lg p-2 w-full bg-gray-50 text-gray-500 text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="projectName"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Project Name{" "}
                      {modalMode !== "view" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <input
                      id="projectName"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleFormChange}
                      required={modalMode !== "view"}
                      disabled={modalMode === "view"}
                      className={`border rounded-lg p-2 w-full text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        modalMode === "view" ? "bg-gray-50 text-gray-500" : ""
                      }`}
                    />
                  </div>

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

                  <div>
                    <label
                      htmlFor="productMail"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Product Mail{" "}
                      {modalMode !== "view" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <input
                      id="productMail"
                      name="productMail"
                      type="email"
                      value={formData.productMail}
                      onChange={handleFormChange}
                      required={modalMode !== "view"}
                      disabled={modalMode === "view"}
                      className={`border rounded-lg p-2 w-full text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        modalMode === "view" ? "bg-gray-50 text-gray-500" : ""
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="file"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Project File
                    </label>

                    {modalMode !== "view" && (
                      <div className="mt-1">
                        <input
                          id="file"
                          name="file"
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFormChange}
                          className={`border rounded-lg p-2 w-full text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                            filePreview ? "hidden" : ""
                          }`}
                        />
                      </div>
                    )}

                    {filePreview && (
                      <div className="mt-1 flex items-center p-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex-1 truncate">
                          <div className="flex items-center space-x-1">
                            <svg
                              className="h-4 w-4 text-gray-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            <span className="text-xs font-medium text-gray-700">
                              {filePreview.name}
                            </span>
                          </div>
                          {!filePreview.isExisting && filePreview.size && (
                            <span className="block text-xs text-gray-500">
                              {filePreview.size} KB
                            </span>
                          )}
                        </div>

                        {modalMode === "view" && filePreview.isExisting ? (
                          <button
                            type="button"
                            className="ml-2 flex-shrink-0 text-blue-600 hover:text-blue-800 text-xs font-medium"
                            onClick={() =>
                              downloadFile(filePreview.url, filePreview.name)
                            }
                          >
                            <FiDownload size={16} />
                          </button>
                        ) : (
                          modalMode !== "view" && (
                            <button
                              type="button"
                              className="ml-2 flex-shrink-0 text-red-600 hover:text-red-800"
                              onClick={clearFileSelection}
                            >
                              <FiX size={16} />
                            </button>
                          )
                        )}
                      </div>
                    )}

                    {modalMode === "edit" && (
                      <p className="text-xs text-gray-500 mt-1">
                        {filePreview
                          ? "Replace file or remove current one"
                          : "Upload a new file"}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      disabled={modalMode === "view"}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Active Status
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
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
        </div>
      </main>
    </div>
  );
}

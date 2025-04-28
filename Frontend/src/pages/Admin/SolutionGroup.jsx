import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import ChatbotPopup from "../../components/ChatBot";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { FiSearch, FiEdit2, FiEye, FiPlus } from "react-icons/fi";
import Button from "../../components/common/Button";
import { formatDate } from "../../utils/formatDate";

export default function SolutionGroup() {
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(5);
  const [solutionGroups, setSolutionGroups] = useState([]);
  const [filteredSolutionGroupsByOrg, setFilteredCategoryGroupsByOrg] =
    useState([]);
  const [categories, setCategories] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState({
    groupName: "",
    category: "",
    organisation: "",
    isActive: true,
  });
  const [showSolutionGroupModal, setShowSolutionGroupModal] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentEntries, setCurrentEntries] = useState({
    start: 0,
    end: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit" or "view"
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
      (group.category &&
        group.category.toLowerCase().includes(searchTermLower)) ||
      (group.organisation &&
        group.organisation.toLowerCase().includes(searchTermLower))
    );
  });

  // Filter solution groups based on selected organization
  useEffect(() => {
    if (formData.organisation) {
      const orgName = organisations.find(
        (org) =>
          org.organisation_id.toString() === formData.organisation.toString()
      )?.organisation_name;
      if (orgName) {
        const filteredGroups = categories.filter(
          (group) => group.organisation === orgName
        );
        setFilteredCategoryGroupsByOrg(filteredGroups);
      } else {
        setFilteredCategoryGroupsByOrg([]);
      }
    } else {
      setFilteredCategoryGroupsByOrg([]);
    }
  }, [formData.organisation, organisations, solutionGroups]);

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
        // Process solution groups with default is_active if not provided
        const processedGroups = response.data.map((group) => ({
          ...group,
          is_active: group.is_active !== undefined ? group.is_active : true,
        }));
        setSolutionGroups(processedGroups);
        console.log("Solution groups fetched successfully:", processedGroups);
        // Reset to first page when data changes significantly
        setCurrentPage(0);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to load solution groups"
      );
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
      toast.error(error.response?.data?.error || "Failed to load categories");
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
      toast.error(
        error.response?.data?.error || "Failed to load organisations"
      );
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
      // Reset solution group when organization changes
      ...(name === "organisation" && { category: "" }),
    });
  };

  // Toggle active status
  const handleToggleActive = () => {
    if (modalMode !== "view") {
      setFormData({
        ...formData,
        isActive: !formData.isActive,
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

    // Only process the form submission when not in view mode
    if (modalMode === "view") {
      return;
    }

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
      is_active: data.isActive,
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
          toast.success(
            response?.data?.message || "Solution Group added successfully"
          );
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
          toast.success(
            response?.data?.message || "Solution Group updated successfully"
          );
        }
      }

      setShowSolutionGroupModal(false);
      resetForm();
      // Refresh the data after adding/editing solution group
      await fetchSolutionGroups();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        `Failed to ${modalMode} solution group`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (group) => {
    setSelectedSolutionGroupId(group.solution_id);

    // Similar logic to handleEdit for category and organization
    let categoryId;
    let organizationId;

    if (typeof group.category === "string") {
      const matchingCat = categories.find(
        (cat) => cat.category_name === group.category
      );
      categoryId = matchingCat ? matchingCat.category_id : "";
    } else if (typeof group.category === "object") {
      categoryId = group.category.category_id;
    } else {
      categoryId = group.category_id || "";
    }

    if (typeof group.organisation === "string") {
      const matchingOrg = organisations.find(
        (org) => org.organisation_name === group.organisation
      );
      organizationId = matchingOrg ? matchingOrg.organisation_id : "";
    } else if (typeof group.organisation === "object") {
      organizationId = group.organisation.organisation_id;
    } else {
      organizationId = group.organisation_id || "";
    }

    setFormData({
      groupName: group.group_name,
      category: categoryId,
      organisation: organizationId,
      isActive: group.is_active !== undefined ? group.is_active : true,
    });

    setModalMode("view");
    setShowSolutionGroupModal(true);
  };

  const handleEdit = () => {
    // Switch from view mode to edit mode
    setModalMode("edit");
  };

  const handleEditFromTable = (group) => {
    setSelectedSolutionGroupId(group.solution_id);

    // Find the category ID and organization ID by name if we have names instead of IDs
    let categoryId;
    let organizationId;

    if (typeof group.category === "string") {
      const matchingCat = categories.find(
        (cat) => cat.category_name === group.category
      );
      categoryId = matchingCat ? matchingCat.category_id : "";
    } else if (typeof group.category === "object") {
      categoryId = group.category.category_id;
    } else {
      categoryId = group.category_id || "";
    }

    if (typeof group.organisation === "string") {
      const matchingOrg = organisations.find(
        (org) => org.organisation_name === group.organisation
      );
      organizationId = matchingOrg ? matchingOrg.organisation_id : "";
    } else if (typeof group.organisation === "object") {
      organizationId = group.organisation.organisation_id;
    } else {
      organizationId = group.organisation_id || "";
    }

    setFormData({
      groupName: group.group_name,
      category: categoryId,
      organisation: organizationId,
      isActive: group.is_active !== undefined ? group.is_active : true,
    });

    setModalMode("edit");
    setShowSolutionGroupModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode("add");
    setShowSolutionGroupModal(true);
    setDropdownOpen(false);
  };

  const resetForm = () => {
    setFormData({
      groupName: "",
      category: "",
      organisation: "",
      isActive: true,
    });
    setSelectedSolutionGroupId(null);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Get solution group name by ID
  const getSolutionGroupNameById = (id) => {
    const group = solutionGroups.find(
      (g) => g.solution_id.toString() === id.toString()
    );
    return group ? group.group_name : "";
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
                Solution Groups
              </h1>
              <p className="text-gray-500 text-sm">
                Add, search, and manage your solution groups
              </p>
            </div>
            <Button
              blueBackground
              onClick={openAddModal}
              label="Add Solution Group"
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
                placeholder="Search solution groups..."
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

          {/* Solution Groups Table - More compact */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-fit">
            {loading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-3 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600 text-sm">
                  Loading solution groups...
                </p>
              </div>
            ) : !filteredSolutionGroups.length ? (
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
                    ? "No matching solution groups found"
                    : "No solution groups found"}
                </p>
                <button
                  onClick={openAddModal}
                  className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg flex items-center gap-1 mx-auto text-sm"
                >
                  <FiPlus size={16} />
                  Add Solution Group
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
                        Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Organisation
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
                    {currentItems.map((group, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                          {group.solution_id}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-800">
                          {group.group_name}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {group.category || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {group.organisation || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              group.is_active !== false
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {group.is_active !== false ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {formatDate(group.created_at) || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {group.created_by || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {formatDate(group.modified_at || "-")}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {group.modified_by || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleView(group)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => handleEditFromTable(group)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                              title="Edit Solution Group"
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
          {filteredSolutionGroups.length > 0 && (
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

          {/* Solution Group Modal - Updated to match Organization panel design */}
          {/* Solution Group Modal - Updated to match Organization panel design */}
          {showSolutionGroupModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                <div className="border-b border-gray-200 p-3 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {modalMode === "add"
                      ? "Add New Solution Group"
                      : modalMode === "edit"
                      ? "Edit Solution Group"
                      : "Solution Group Details"}
                  </h2>
                  <button
                    onClick={() => setShowSolutionGroupModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  {/* Solution Group ID field */}
                  {(modalMode === "edit" || modalMode === "view") && (
                    <div>
                      <label
                        htmlFor="solutionGroupId"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Solution Group ID
                      </label>
                      <input
                        id="solutionGroupId"
                        value={selectedSolutionGroupId || ""}
                        disabled
                        className="border border-gray-300 rounded-lg p-2 w-full bg-gray-50 text-gray-500 text-sm"
                      />
                    </div>
                  )}

                  {/* Solution Group Name field */}
                  <div>
                    <label
                      htmlFor="groupName"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Solution Group Name{" "}
                      {modalMode !== "view" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <input
                      id="groupName"
                      name="groupName"
                      value={formData.groupName}
                      onChange={handleFormChange}
                      required={modalMode !== "view"}
                      disabled={modalMode === "view"}
                      className={`border rounded-lg p-2 w-full text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        modalMode === "view" ? "bg-gray-50 text-gray-500" : ""
                      }`}
                    />
                  </div>

                  {/* Organisation field */}
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
                    {modalMode === "view" ? (
                      <input
                        value={
                          organisations.find(
                            (org) =>
                              org.organisation_id.toString() ===
                              formData.organisation.toString()
                          )?.organisation_name || formData.organisation
                        }
                        disabled
                        className="border border-gray-300 rounded-lg p-2 w-full bg-gray-50 text-gray-500 text-sm"
                      />
                    ) : (
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
                        <option value="">Select organisation</option>
                        {organisations.map((org) => (
                          <option
                            key={org.organisation_id}
                            value={org.organisation_id}
                          >
                            {org.organisation_name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Category field */}
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Category{" "}
                      {modalMode !== "view" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    {modalMode === "view" ? (
                      <input
                        value={
                          categories.find(
                            (cat) =>
                              cat.category_id.toString() ===
                              formData.category.toString()
                          )?.category_name || formData.category
                        }
                        disabled
                        className="border border-gray-300 rounded-lg p-2 w-full bg-gray-50 text-gray-500 text-sm"
                      />
                    ) : (
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        required={modalMode !== "view"}
                        disabled={
                          modalMode === "view" || !formData.organisation
                        }
                        className={`border rounded-lg p-2 w-full text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                          modalMode === "view" || !formData.organisation
                            ? "bg-gray-50 text-gray-500"
                            : ""
                        }`}
                      >
                        <option value="">Select category</option>
                        {filteredSolutionGroupsByOrg.length > 0
                          ? filteredSolutionGroupsByOrg.map((cat) => (
                              <option
                                key={cat.category_id}
                                value={cat.category_id}
                              >
                                {cat.category_name}
                              </option>
                            ))
                          : categories.map((cat) => (
                              <option
                                key={cat.category_id}
                                value={cat.category_id}
                              >
                                {cat.category_name}
                              </option>
                            ))}
                      </select>
                    )}
                    {modalMode !== "view" && !formData.organisation && (
                      <p className="mt-1 text-xs text-orange-600">
                        Please select an organisation first
                      </p>
                    )}
                  </div>

                  {/* Active status toggle */}

                  {/* <div className="flex items-center">
                    <div className="relative inline-block">
                      <input
                        id="isActive"
                        name="isActive"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={handleFormChange}
                        className="sr-only"
                        disabled={modalMode === "view"}
                      />
                      <div
                        onClick={handleToggleActive}
                        className={`w-7 h-4 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ease-in-out ${
                          formData.isActive ? "bg-blue-500" : "bg-gray-300"
                        } ${
                          modalMode === "view"
                            ? "opacity-70 pointer-events-none"
                            : ""
                        }`}
                      >
                        <div
                          className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                            formData.isActive
                              ? "translate-x-3"
                              : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                    <label
                      htmlFor="isActive"
                      className="text-xs font-medium text-gray-700 ml-2 cursor-pointer"
                      onClick={handleToggleActive}
                    >
                      {formData.isActive ? "Active" : "Inactive"}
                    </label>
                  </div> */}
                  <div className="flex items-center">
                    <div
                      onClick={handleToggleActive}
                      className={`relative inline-block w-10 h-5 rounded-full transition-colors cursor-pointer ${
                        modalMode === "view"
                          ? "opacity-70 pointer-events-none"
                          : ""
                      } ${formData.isActive ? "bg-blue-500" : "bg-gray-300"}`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform transform ${
                          formData.isActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                      <input
                        id="isActive"
                        name="isActive"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={handleFormChange}
                        className="sr-only"
                        disabled={modalMode === "view"}
                      />
                    </div>
                    <label
                      htmlFor="isActive"
                      className="text-xs font-medium text-gray-700 ml-2 cursor-pointer"
                      onClick={handleToggleActive}
                    >
                      {formData.isActive ? "Active" : "Inactive"}
                    </label>
                  </div>
                  {/* Form action buttons */}
                  <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowSolutionGroupModal(false)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>

                    {modalMode === "view" && (
                      // Only show Edit button in view mode
                      <button
                        type="button"
                        onClick={() => {
                          // Direct inline function to ensure state update happens
                          setModalMode("edit");
                          console.log("Switching to edit mode");
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                      >
                        <FiEdit2 size={14} />
                        Edit
                      </button>
                    )}

                    {modalMode !== "view" && (
                      // Only show Save/Add button in non-view modes
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>
                              {modalMode === "add" ? "Adding..." : "Saving..."}
                            </span>
                          </div>
                        ) : modalMode === "add" ? (
                          "Add Solution Group"
                        ) : (
                          "Update Solution Group"
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
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
  );
}

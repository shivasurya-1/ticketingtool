import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import {
  FiSearch,
  FiEdit2,
  FiEye,
  FiPlus,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import ChatbotPopup from "../../components/ChatBot";
import Button from "../../components/common/Button";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { formatDate } from "../../utils/formatDate";

export default function UserRoles() {
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [userRoles, setUserRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState({
    userId: "",
    roleId: "",
    isActive: true,
  });
  const [showUserRoleModal, setShowUserRoleModal] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentEntries, setCurrentEntries] = useState({
    start: 0,
    end: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit" or "view"
  const [selectedUserRoleId, setSelectedUserRoleId] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const searchInputRef = useRef(null);

  // Filter user roles based on search term
  const filteredUserRoles = userRoles.filter((userRole) => {
    if (!searchTerm.trim()) return true;

    const searchTermLower = searchTerm.toLowerCase().trim();
    return (
      userRole.user.toLowerCase().includes(searchTermLower) ||
      userRole.role.toLowerCase().includes(searchTermLower) ||
      userRole.user_role_id.toString().includes(searchTermLower)
    );
  });

  // Calculate pagination values
  const pageCount = Math.max(1, Math.ceil(filteredUserRoles.length / pageSize));
  const offset = currentPage * pageSize;
  const currentItems = filteredUserRoles.slice(offset, offset + pageSize);

  // Fetch user roles on component mount
  useEffect(() => {
    fetchUserRoles();
  }, []);

  // Fetch users and roles when modal is opened
  useEffect(() => {
    if (showUserRoleModal) {
      fetchUsers();
      fetchRoles();
    }
  }, [showUserRoleModal]);

  // Update current entries information when filteredUserRoles changes
  useEffect(() => {
    const start = filteredUserRoles.length > 0 ? offset + 1 : 0;
    const end = Math.min(offset + pageSize, filteredUserRoles.length);
    setCurrentEntries({ start, end });
    setTotalEntries(filteredUserRoles.length);
  }, [filteredUserRoles.length, offset, pageSize]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // Ensure currentPage is never out of bounds
  useEffect(() => {
    if (
      currentPage >= pageCount &&
      pageCount > 0 &&
      filteredUserRoles.length > 0
    ) {
      setCurrentPage(Math.max(0, pageCount - 1));
    }
  }, [filteredUserRoles.length, pageCount, currentPage]);

  // Scroll to top when changing to the last page with fewer items
  useEffect(() => {
    if (currentPage === pageCount - 1 && currentItems.length < pageSize) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);
    }
  }, [currentPage, pageCount, currentItems.length, pageSize]);

  const fetchUserRoles = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to access this page.");
      setLoading(false);
      return;
    }
    try {
      const response = await axiosInstance.get("/roles/user_role/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 200) {
        setUserRoles(response.data);
        // Reset to first page when data changes significantly
        setCurrentPage(0);
      }
    } catch (error) {
      toast.error("Failed to load user roles");
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      const response = await axiosInstance.get("/user/api/assignee/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Users response:", response.data);
      if (response.status === 200) {
        setUsers(response.data);
      }
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const fetchRoles = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    try {
      const response = await axiosInstance.get("/roles/create/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 200) {
        setRoles(response.data);
      }
    } catch (error) {
      toast.error("Failed to load roles");
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

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userId || !formData.roleId) {
      toast.error("Please select both user and role");
      return;
    }

    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to manage user roles.");
      setLoading(false);
      return;
    }

    const parseFormData = (data) => ({
      user: parseInt(data.userId),
      role: parseInt(data.roleId),
      is_active: data.isActive,
    });

    try {
      const parsedData = parseFormData(formData);
      let response;

      if (modalMode === "add") {
        response = await axiosInstance.post("/roles/user_role/", parsedData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 201 || response.status === 200) {
          toast.success(
            response?.data?.message || "User role assigned successfully"
          );
        }
      } else if (modalMode === "edit") {
        response = await axiosInstance.put(
          `/roles/role/${selectedUserRoleId}/`,
          parsedData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status === 200) {
          toast.success(
            response?.data?.message || "User role updated successfully"
          );
        }
      }

      setShowUserRoleModal(false);
      resetForm();
      // Refresh the data after adding/editing user role
      await fetchUserRoles();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        `Failed to ${modalMode} user role`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (userRole) => {
    // Find the user and role IDs from the names
    const user = users.find((u) => u.username === userRole.user);
    const role = roles.find((r) => r.name === userRole.role);

    setSelectedUserRoleId(userRole.user_role_id);
    setFormData({
      userId: user?.id || "",
      roleId: role?.role_id || "",
      isActive: userRole.is_active,
    });
    setModalMode("view");
    setShowUserRoleModal(true);
  };

  const handleEdit = (userRole) => {
    // Find the user and role IDs from the names
    const user = users.find((u) => u.username === userRole.user);
    const role = roles.find((r) => r.name === userRole.role);

    setSelectedUserRoleId(userRole.user_role_id);
    setFormData({
      userId: user?.id || "",
      roleId: role?.role_id || "",
      isActive: userRole.is_active,
    });
    setModalMode("edit");
    setShowUserRoleModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode("add");
    setShowUserRoleModal(true);
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      roleId: "",
      isActive: true,
    });
    setSelectedUserRoleId(null);
  };

  const toggleStatus = async (userRole) => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to manage user roles.");
      return;
    }

    try {
      const user = users.find((u) => u.username === userRole.user);
      const role = roles.find((r) => r.name === userRole.role);

      if (!user || !role) {
        await fetchUsers();
        await fetchRoles();
        toast.error("Could not find user or role details. Please try again.");
        return;
      }

      const response = await axiosInstance.put(
        `/roles/role/${userRole.user_role_id}/`,
        {
          user_id: user.id,
          role_id: role.role_id,
          is_active: !userRole.is_active,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success(
          `User role ${
            userRole.is_active ? "deactivated" : "activated"
          } successfully`
        );
        await fetchUserRoles();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Failed to update the user role"
      );
    }
  };


  return (
    <div className="flex w-full h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="p-4 max-w-full">
          {/* Condensed Header */}
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">User Roles</h1>
              <p className="text-gray-500 text-sm">
                Assign, manage, and monitor user roles
              </p>
            </div>
            <Button
              blueBackground
              onClick={openAddModal}
              label="Assign Role"
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
                placeholder="Search user roles..."
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

          {/* User Roles Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-fit">
            {loading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-3 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600 text-sm">
                  Loading user roles...
                </p>
              </div>
            ) : !filteredUserRoles.length ? (
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
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">
                  {searchTerm
                    ? "No matching user roles found"
                    : "No user roles found"}
                </p>
                <button
                  onClick={openAddModal}
                  className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg flex items-center gap-1 mx-auto text-sm"
                >
                  <FiPlus size={16} />
                  Assign Role
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
                        User
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Assigned at
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
                    {currentItems.map((userRole, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                          {userRole.user_role_id}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-800">
                          {userRole.user}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {userRole.role}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {formatDate(userRole.assigned_at)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              userRole.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {userRole.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {formatDate(userRole.created_at) || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {userRole.created_by || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {formatDate(userRole.modified_at) || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {userRole.modifies_by || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleView(userRole)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(userRole)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                              title="Edit User Role"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => toggleStatus(userRole)}
                              className={`${
                                userRole.is_active
                                  ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                                  : "text-green-600 hover:text-green-900 hover:bg-green-50"
                              } p-1 rounded transition-colors`}
                              title={
                                userRole.is_active ? "Deactivate" : "Activate"
                              }
                            >
                              {userRole.is_active ? (
                                <FiToggleRight size={16} />
                              ) : (
                                <FiToggleLeft size={16} />
                              )}
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
          {filteredUserRoles.length > 0 && (
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

          {/* User Role Modal */}
          {showUserRoleModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                <div className="border-b border-gray-200 p-3 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {modalMode === "add"
                      ? "Assign New Role"
                      : modalMode === "edit"
                      ? "Edit User Role"
                      : "User Role Details"}
                  </h2>
                  <button
                    onClick={() => setShowUserRoleModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  {(modalMode === "edit" || modalMode === "view") && (
                    <div>
                      <label
                        htmlFor="userRoleId"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        User Role ID
                      </label>
                      <input
                        id="userRoleId"
                        value={selectedUserRoleId || ""}
                        disabled
                        className="border border-gray-300 rounded-lg p-2 w-full bg-gray-50 text-gray-500 text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="userId"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      User{" "}
                      {modalMode !== "view" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <select
                      id="userId"
                      name="userId"
                      value={formData.userId}
                      onChange={handleFormChange}
                      required={modalMode !== "view"}
                      disabled={modalMode === "view"}
                      className={`border rounded-lg p-2 w-full text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        modalMode === "view" ? "bg-gray-50 text-gray-500" : ""
                      }`}
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="roleId"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Role{" "}
                      {modalMode !== "view" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <select
                      id="roleId"
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleFormChange}
                      required={modalMode !== "view"}
                      disabled={modalMode === "view"}
                      className={`border rounded-lg p-2 w-full text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        modalMode === "view" ? "bg-gray-50 text-gray-500" : ""
                      }`}
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role.role_id} value={role.role_id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      disabled={modalMode === "view"}
                      className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                        modalMode === "view" ? "bg-gray-100" : ""
                      }`}
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Active
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t">
                    {modalMode === "view" ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              userRoles.find(
                                (userRole) =>
                                  userRole.user_role_id === selectedUserRoleId
                              )
                            )
                          }
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowUserRoleModal(false)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                        >
                          Close
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowUserRoleModal(false)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                          disabled={loading}
                        >
                          {loading && (
                            <svg
                              className="animate-spin h-3 w-3 text-white"
                              xmlns="http://www.w3.org/2000/svg"
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
                          )}
                          {loading
                            ? modalMode === "add"
                              ? "Assigning..."
                              : "Updating..."
                            : modalMode === "add"
                            ? "Assign Role"
                            : "Update Role"}
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Toast notifications */}
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

          {/* Chatbot popup */}
          <ChatbotPopup />
        </div>
      </main>
    </div>
  );
}

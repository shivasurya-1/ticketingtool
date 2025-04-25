import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import SearchIconRight from "../../components/common/SearchRightIcon";
import ChatbotPopup from "../../components/ChatBot";
import Button from "../../components/common/Button";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";

export default function Role() {
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(5);
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState({
    roleName: "",
  });
  const [addRole, setAddRole] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentEntries, setCurrentEntries] = useState({
    start: 0,
    end: 0
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Filter roles based on search term
  const filteredRoles = roles.filter(role => {
    return (
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.role_id.toString().includes(searchTerm)
    );
  });

  // Calculate pagination values - safeguard against empty data
  const pageCount = Math.max(1, Math.ceil(filteredRoles.length / pageSize));
  
  // Calculate offset once after currentPage and pageSize are set
  const offset = currentPage * pageSize;
  
  // Get current items for display
  const currentItems = filteredRoles.slice(offset, offset + pageSize);

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Update current entries information and total entries when filteredRoles, offset, or pageSize changes
  useEffect(() => {
    const start = filteredRoles.length > 0 ? offset + 1 : 0;
    const end = Math.min(offset + pageSize, filteredRoles.length);
    setCurrentEntries({ start, end });
    setTotalEntries(filteredRoles.length);
  }, [filteredRoles.length, offset, pageSize]);

  // Ensure currentPage is never out of bounds
  useEffect(() => {
    if (currentPage >= pageCount && pageCount > 0 && filteredRoles.length > 0) {
      setCurrentPage(Math.max(0, pageCount - 1));
    }
  }, [filteredRoles.length, pageCount, currentPage]);

  // Scroll to top when changing to the last page with fewer items
  useEffect(() => {
    if (currentPage === pageCount - 1 && currentItems.length < pageSize) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);
    }
  }, [currentPage, pageCount, currentItems.length, pageSize]);

  const fetchRoles = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to access this page.");
      setLoading(false);
      return;
    }
    try {
      const response = await axiosInstance.get("/roles/create/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 200) {
        setRoles(response.data);
        // Reset to first page when data changes significantly
        setCurrentPage(0);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles");
      setRoles([]);
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

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(0); // Reset to first page when searching
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.roleName) {
      toast.error("Please fill in the required fields");
      return;
    }

    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to add roles.");
      setLoading(false);
      return;
    }

    const parseFormData = (data) => ({
      role_id: "", // Backend will assign this
      name: data.roleName,
    });

    try {
      const parsedData = parseFormData(formData);
      console.log("parsedData", parsedData);
      const response = await axiosInstance.post(
        "/roles/create/",
        parsedData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("Role added successfully");
        setAddRole(false);
        setFormData({
          roleName: "",
        });
        // Refresh the data after adding new role
        await fetchRoles();
      }
    } catch (error) {
      console.error("Error adding role:", error);
      toast.error(
        error.response?.data?.message || "Failed to add role"
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

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <main className="flex-1 mx-16">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-[39px] font-semibold">Roles</h1>
            <p className="text-sm text-muted-foreground">
              Add, Search, and Manage your roles all in one place
            </p>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <SearchIconRight 
              placeholder="Search Role" 
              onSearch={handleSearchChange}
            />
            <div className="flex gap-2">
              
              <Button
                onClick={() => setAddRole(true)}
                label="Add Role"
                blueBackground
              />
            </div>
          </div>

          {/* Add Role Modal */}
          {addRole && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="relative bg-white p-8 rounded-lg shadow-lg w-[45%]">
                <h1 className="text-lg font-semibold mb-4">Add Role</h1>
                <hr className="absolute left-0 right-0 border-t border-gray-300" />
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  <div className="flex flex-col">
                    <label
                      htmlFor="roleName"
                      className="font-medium mb-4"
                    >
                      Role Name
                    </label>
                    <input
                      id="roleName"
                      name="roleName"
                      value={formData.roleName}
                      onChange={handleFormChange}
                      required
                      className="border p-3 w-full rounded-md drop-shadow-lg"
                    />
                  </div>
                  {/* Cancel and ADD Button */}
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setAddRole(false)}
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

          {/* Roles Table */}
          <div className="bg-white rounded-md border overflow-hidden mt-8">
            {loading ? (
              <div className="p-4 text-center">Loading roles...</div>
            ) : !filteredRoles.length ? (
              <div className="p-4 text-center">
                {searchTerm ? "No matching roles found" : "No roles found"}
              </div>
            ) : (
              <table className="min-w-full table-fixed">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 text-left font-medium">Role ID</th>
                    <th className="px-4 py-2 text-left font-medium">
                      Role Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((role, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100`}
                    >
                      <td className="px-4 py-2 break-words">
                        {role.role_id}
                      </td>
                      <td className="px-4 py-2 break-words">
                        {role.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination and Page Size Controls */}
          {filteredRoles.length > 0 && (
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
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import SearchIconRight from "../components/common/SearchRightIcon";
import ChatbotPopup from "../components/ChatBot";
import Button from "../components/common/Button";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import { axiosInstance } from "../utils/axiosInstance";

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
  });
  const [addSolutionGroup, setAddSolutionGroup] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentEntries, setCurrentEntries] = useState({
    start: 0,
    end: 0
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Filter solution groups based on search term
  const filteredSolutionGroups = solutionGroups.filter(group => {
    return (
      group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.solution_id.toString().includes(searchTerm) ||
      (group.category && group.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (group.organisation && group.organisation.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Calculate pagination values - safeguard against empty data
  const pageCount = Math.max(1, Math.ceil(filteredSolutionGroups.length / pageSize));
  
  // Calculate offset once after currentPage and pageSize are set
  const offset = currentPage * pageSize;
  
  // Get current items for display
  const currentItems = filteredSolutionGroups.slice(offset, offset + pageSize);

  // Fetch solution groups, categories and organisations on component mount
  useEffect(() => {
    fetchSolutionGroups();
    fetchCategories();
    fetchOrganisations();
  }, []);

  // Update current entries information and total entries when filteredSolutionGroups, offset, or pageSize changes
  useEffect(() => {
    const start = filteredSolutionGroups.length > 0 ? offset + 1 : 0;
    const end = Math.min(offset + pageSize, filteredSolutionGroups.length);
    setCurrentEntries({ start, end });
    setTotalEntries(filteredSolutionGroups.length);
  }, [filteredSolutionGroups.length, offset, pageSize]);

  // Ensure currentPage is never out of bounds
  useEffect(() => {
    if (currentPage >= pageCount && pageCount > 0 && filteredSolutionGroups.length > 0) {
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

    if (!formData.groupName || !formData.category || !formData.organisation) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to add solution groups.");
      setLoading(false);
      return;
    }

    const parseFormData = (data) => ({
      group_name: data.groupName,
      category: data.category,
      organisation: data.organisation,
    });

    try {
      const parsedData = parseFormData(formData);
      console.log("parsedData", parsedData);
      const response = await axiosInstance.post(
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
        setAddSolutionGroup(false);
        setFormData({
          groupName: "",
          category: "",
          organisation: "",
        });
        // Refresh the data after adding new solution group
        await fetchSolutionGroups();
      }
    } catch (error) {
      console.error("Error adding solution group:", error);
      toast.error(
        error.response?.data?.message || "Failed to add solution group"
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
  console.log(categories);

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <main className="flex-1 mx-16">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-[39px] font-semibold">Solution Groups</h1>
            <p className="text-sm text-muted-foreground">
              Add, Search, and Manage your solution groups all in one place
            </p>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <SearchIconRight 
              placeholder="Search Solution Group" 
              onSearch={handleSearchChange}
            />
            <div className="flex gap-2">
              <Button label="Bulk Import" />
              <Button
                onClick={() => setAddSolutionGroup(true)}
                label="Add Solution Group"
                blueBackground
              />
            </div>
          </div>

          {/* Add Solution Group Modal */}
          {addSolutionGroup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="relative bg-white p-8 rounded-lg shadow-lg w-[45%]">
                <h1 className="text-lg font-semibold mb-4">Add Solution Group</h1>
                <hr className="absolute left-0 right-0 border-t border-gray-300" />
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  <div className="flex flex-col">
                    <label
                      htmlFor="groupName"
                      className="font-medium mb-4"
                    >
                      Solution Group Name
                    </label>
                    <input
                      id="groupName"
                      name="groupName"
                      value={formData.groupName}
                      onChange={handleFormChange}
                      required
                      className="border p-3 w-full rounded-md drop-shadow-lg"
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <label htmlFor="category" className="font-medium mb-4">
                      Solution Group Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      required
                      className="border p-3 w-full rounded-md drop-shadow-lg"
                    >
                  
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col">
                    <label htmlFor="organisation" className="font-medium mb-4">
                      Organisation
                    </label>
                    <select
                      id="organisation"
                      name="organisation"
                      value={formData.organisation}
                      onChange={handleFormChange}
                      required
                      className="border p-3 w-full rounded-md drop-shadow-lg"
                    >
                      <option value="">Select an organisation</option>
                      {organisations.map((org) => (
                        <option key={org.id} value={org.organisation_id}>
                          {org.organisation_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Cancel and ADD Button */}
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setAddSolutionGroup(false)}
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

          {/* Solution Groups Table */}
          <div className="bg-white rounded-md border overflow-hidden mt-8">
            {loading ? (
              <div className="p-4 text-center">Loading solution groups...</div>
            ) : !filteredSolutionGroups.length ? (
              <div className="p-4 text-center">
                {searchTerm ? "No matching solution groups found" : "No solution groups found"}
              </div>
            ) : (
              <table className="min-w-full table-fixed">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 text-left font-medium">Solution Group ID</th>
                    <th className="px-4 py-2 text-left font-medium">
                      Solution Group Name
                    </th>
                    <th className="px-4 py-2 text-left font-medium">
                      Category
                    </th>
                    <th className="px-4 py-2 text-left font-medium">
                      Organisation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((group, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100`}
                    >
                      <td className="px-4 py-2 break-words">
                        {group.solution_id}
                      </td>
                      <td className="px-4 py-2 break-words">
                        {group.group_name}
                      </td>
                      <td className="px-4 py-2 break-words">
                        {group.category || "-"}
                      </td>
                      <td className="px-4 py-2 break-words">
                        {group.organisation || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination and Page Size Controls */}
          {filteredSolutionGroups.length > 0 && (
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
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import SearchIconRight from "../components/common/SearchRightIcon";
import ChatbotPopup from "../components/ChatBot";
import Button from "../components/common/Button";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import { axiosInstance } from "../utils/axiosInstance";

export default function Category() {
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(5);
  const [categories, setCategories] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    organisation: "",
  });
  const [addCategory, setAddCategory] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentEntries, setCurrentEntries] = useState({
    start: 0,
    end: 0
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => {
    return (
      category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      category.category_id.toString().includes(searchTerm) ||
      (category.organisation && category.organisation.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Calculate pagination values - safeguard against empty data
  const pageCount = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  
  // Calculate offset once after currentPage and pageSize are set
  const offset = currentPage * pageSize;
  
  // Get current items for display
  const currentItems = filteredCategories.slice(offset, offset + pageSize);

  // Fetch categories and organisations on component mount
  useEffect(() => {
    fetchCategories();
    fetchOrganisations();
  }, []);

  // Update current entries information and total entries when filteredCategories, offset, or pageSize changes
  useEffect(() => {
    const start = filteredCategories.length > 0 ? offset + 1 : 0;
    const end = Math.min(offset + pageSize, filteredCategories.length);
    setCurrentEntries({ start, end });
    setTotalEntries(filteredCategories.length);
  }, [filteredCategories.length, offset, pageSize]);

  // Ensure currentPage is never out of bounds
  useEffect(() => {
    if (currentPage >= pageCount && pageCount > 0 && filteredCategories.length > 0) {
      setCurrentPage(Math.max(0, pageCount - 1));
    }
  }, [filteredCategories.length, pageCount, currentPage]);

  // Scroll to top when changing to the last page with fewer items
  useEffect(() => {
    if (currentPage === pageCount - 1 && currentItems.length < pageSize) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);
    }
  }, [currentPage, pageCount, currentItems.length, pageSize]);

  const fetchCategories = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to access this page.");
      setLoading(false);
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
        // Reset to first page when data changes significantly
        setCurrentPage(0);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
      setCategories([]);
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

    if (!formData.categoryName || !formData.organisation) {
      toast.error("Please fill in the required fields");
      return;
    }

    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to add categories.");
      setLoading(false);
      return;
    }

    const parseFormData = (data) => ({
      category_name: data.categoryName,
      description: data.description,
      organisation: data.organisation,
    });

    try {
      const parsedData = parseFormData(formData);
      console.log("parsedData", parsedData);
      const response = await axiosInstance.post(
        "/category/create/",
        parsedData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("Category added successfully");
        setAddCategory(false);
        setFormData({
          categoryName: "",
          description: "",
          organisation: "",
        });
        // Refresh the data after adding new category
        await fetchCategories();
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(
        error.response?.data?.message || "Failed to add category"
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
            <h1 className="text-[39px] font-semibold">Categories</h1>
            <p className="text-sm text-muted-foreground">
              Add, Search, and Manage your categories all in one place
            </p>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <SearchIconRight 
              placeholder="Search Category" 
              onSearch={handleSearchChange}
            />
            <div className="flex gap-2">
              <Button label="Bulk Import" />
              <Button
                onClick={() => setAddCategory(true)}
                label="Add Category"
                blueBackground
              />
            </div>
          </div>

          {/* Add Category Modal */}
          {addCategory && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="relative bg-white p-8 rounded-lg shadow-lg w-[45%]">
                <h1 className="text-lg font-semibold mb-4">Add Category</h1>
                <hr className="absolute left-0 right-0 border-t border-gray-300" />
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  <div className="flex flex-col">
                    <label
                      htmlFor="categoryName"
                      className="font-medium mb-4"
                    >
                      Category Name
                    </label>
                    <input
                      id="categoryName"
                      name="categoryName"
                      value={formData.categoryName}
                      onChange={handleFormChange}
                      required
                      className="border p-3 w-full rounded-md drop-shadow-lg"
                    />
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
                  <div className="flex flex-col">
                    <label htmlFor="description" className="font-medium">
                      Description
                    </label>
                    <p className="text-sm text-gray-500 mt-2 mb-2">
                      Enter a detailed description for this category.
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
                      onClick={() => setAddCategory(false)}
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

          {/* Categories Table */}
          <div className="bg-white rounded-md border overflow-hidden mt-8">
            {loading ? (
              <div className="p-4 text-center">Loading categories...</div>
            ) : !filteredCategories.length ? (
              <div className="p-4 text-center">
                {searchTerm ? "No matching categories found" : "No categories found"}
              </div>
            ) : (
              <table className="min-w-full table-fixed">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 text-left font-medium">Category ID</th>
                    <th className="px-4 py-2 text-left font-medium">
                      Category Name
                    </th>
                    <th className="px-4 py-2 text-left font-medium">
                      Description
                    </th>
                    <th className="px-4 py-2 text-left font-medium">
                      Organisation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((category, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100`}
                    >
                      <td className="px-4 py-2 break-words">
                        {category.category_id}
                      </td>
                      <td className="px-4 py-2 break-words">
                        {category.category_name}
                      </td>
                      <td className="px-4 py-2 break-words">
                        {category.description || "-"}
                      </td>
                      <td className="px-4 py-2 break-words">
                        {category.organisation || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination and Page Size Controls */}
          {filteredCategories.length > 0 && (
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
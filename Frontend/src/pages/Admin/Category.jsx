import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import { FiSearch, FiEdit2, FiEye ,FiPlus} from "react-icons/fi";
import ChatbotPopup from "../../components/ChatBot";
import Button from "../../components/common/Button";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";

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
    isActive: true
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentEntries, setCurrentEntries] = useState({
    start: 0,
    end: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit" or "view"
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  
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

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => {
    if (!searchTerm.trim()) return true;
    
    const searchTermLower = searchTerm.toLowerCase().trim();
    return (
      category.category_name.toLowerCase().includes(searchTermLower) ||
      (category.description && category.description.toLowerCase().includes(searchTermLower)) ||
      category.category_id.toString().includes(searchTermLower) ||
      (category.organisation && category.organisation.toLowerCase().includes(searchTermLower))
    );
  });

  // Calculate pagination values
  const pageCount = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const offset = currentPage * pageSize;
  const currentItems = filteredCategories.slice(offset, offset + pageSize);

  // Fetch categories and organisations on component mount
  useEffect(() => {
    fetchCategories();
    fetchOrganisations();
  }, []);

  // Update current entries information when filteredCategories changes
  useEffect(() => {
    const start = filteredCategories.length > 0 ? offset + 1 : 0;
    const end = Math.min(offset + pageSize, filteredCategories.length);
    setCurrentEntries({ start, end });
    setTotalEntries(filteredCategories.length);
  }, [filteredCategories.length, offset, pageSize]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

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
        // Process categories with default is_active if not provided
        const processedCategories = response.data.map(category => ({
          ...category,
          is_active: category.is_active !== undefined ? category.is_active : true
        }));
        setCategories(processedCategories);
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
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

    if (!formData.categoryName || !formData.organisation) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to manage categories.");
      setLoading(false);
      return;
    }

    const parseFormData = (data) => ({
      category_name: data.categoryName,
      description: data.description,
      organisation: data.organisation,
      is_active: data.isActive
    });

    try {
      const parsedData = parseFormData(formData);
      let response;
      
      if (modalMode === "add") {
        response = await axiosInstance.post(
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
        }
      } else if (modalMode === "edit") {
        // FIX: Update the correct endpoint format to match what's expected by the API
        response = await axiosInstance.put(
          `/category/cg/${selectedCategoryId}/`,
          parsedData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (response.status === 200) {
          toast.success("Category updated successfully");
        }
      }
      
      setShowCategoryModal(false);
      resetForm();
      // Refresh the data after adding/editing category
      await fetchCategories();
    } catch (error) {
      console.error("Error managing category:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          `Failed to ${modalMode} category`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (category) => {
    setSelectedCategoryId(category.category_id);
    setFormData({
      categoryName: category.category_name,
      description: category.description || "",
      organisation: category.organisation_id || category.organisation,
      isActive: category.is_active !== undefined ? category.is_active : true
    });
    setModalMode("view");
    setShowCategoryModal(true);
  };

  const handleEdit = (category) => {
    setSelectedCategoryId(category.category_id);
    setFormData({
      categoryName: category.category_name,
      description: category.description || "",
      organisation: category.organisation_id || category.organisation,
      isActive: category.is_active !== undefined ? category.is_active : true
    });
    setModalMode("edit");
    setShowCategoryModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode("add");
    setShowCategoryModal(true);
    setDropdownOpen(false);
  };

  const openEditModal = () => {
    setModalMode("edit");
    setShowCategoryModal(false);
    setDropdownOpen(false);
    
    const categoryId = prompt("Please enter the Category ID you want to edit:");
    if (!categoryId) return;
    
    const selectedCategory = categories.find(
      cat => cat.category_id.toString() === categoryId.trim()
    );
    
    if (selectedCategory) {
      setSelectedCategoryId(selectedCategory.category_id);
      setFormData({
        categoryName: selectedCategory.category_name,
        description: selectedCategory.description || "",
        organisation: selectedCategory.organisation_id || selectedCategory.organisation,
        isActive: selectedCategory.is_active !== undefined ? selectedCategory.is_active : true
      });
      setShowCategoryModal(true);
    } else {
      toast.error("Category not found with the provided ID.");
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const resetForm = () => {
    setFormData({
      categoryName: "",
      description: "",
      organisation: "",
      isActive: true
    });
    setSelectedCategoryId(null);
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
            <p className="text-gray-500 mt-2">
              Add, search, and manage your categories all in one place
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
            <div className="relative w-full sm:w-64">
              <input
                ref={searchInputRef}
                type="text"
                className="border border-gray-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" size={18} />
              </div>
            </div>
            
            <div className="flex gap-3">
             
              
              <div className="relative" ref={dropdownRef}>
                <Button
                  onClick={toggleDropdown}
                  label="Category Actions"
                  icon={<FiPlus size={18} />}
                  primary={true}
                />
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-100 overflow-hidden">
                    <ul className="py-1">
                      <li>
                        <button
                          onClick={openAddModal}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <FiPlus className="mr-2" size={16} />
                          Add Category
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={openEditModal}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <FiEdit2 className="mr-2" size={16} />
                          Edit Category
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Categories Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-3 text-gray-600">Loading categories...</p>
              </div>
            ) : !filteredCategories.length ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <path d="M10 21h4M19 12V8.2c0-1.12 0-1.68-.218-2.108a2 2 0 00-.874-.874C17.48 5 16.92 5 15.8 5H8.2c-1.12 0-1.68 0-2.108.218a2 2 0 00-.874.874C5 6.52 5 7.08 5 8.2V12"/>
                    <path d="M15 17H9c-.93 0-1.395 0-1.776.102a3 3 0 00-2.122 2.122C5 19.605 5 20.07 5 21v0M7 10h.01M12 10h.01M17 10h.01"/>
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">
                  {searchTerm ? "No matching categories found" : "No categories found"}
                </p>
                <button 
                  onClick={openAddModal}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 mx-auto"
                >
                  <FiPlus size={18} />
                  Add Category
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organisation
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.map((category, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {category.category_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {category.category_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {category.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {organisations.find(org => org.organisation_name === category.organisation)?.organisation_name || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            category.is_active 
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {category.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(category)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <FiEye size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(category)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                              title="Edit Category"
                            >
                              <FiEdit2 size={18} />
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

          {/* Pagination Controls */}
          {filteredCategories.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
              <div className="mb-4 sm:mb-0 flex items-center">
                <label htmlFor="pageSize" className="text-sm text-gray-600 mr-2">
                  Show:
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="2">2</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span className="ml-4 text-sm text-gray-600">
                  Showing {currentEntries.start} to {currentEntries.end} of {totalEntries} entries
                </span>
              </div>

              <ReactPaginate
                previousLabel={<span className="flex items-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg> Prev</span>}
                nextLabel={<span className="flex items-center">Next <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></span>}
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={1}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                forcePage={currentPage}
                containerClassName="flex space-x-1"
                pageClassName="w-8 h-8 flex items-center justify-center rounded text-sm"
                pageLinkClassName="w-full h-full flex items-center justify-center"
                activeClassName="bg-blue-600 text-white"
                activeLinkClassName="font-medium"
                previousClassName="px-2 py-1 rounded flex items-center text-sm text-gray-700 hover:bg-gray-100"
                nextClassName="px-2 py-1 rounded flex items-center text-sm text-gray-700 hover:bg-gray-100"
                disabledClassName="opacity-50 cursor-not-allowed"
                breakClassName="w-8 h-8 flex items-center justify-center"
              />
            </div>
          )}

          {/* Category Modal (Add/Edit/View) */}
          {showCategoryModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="border-b border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {modalMode === "add" ? "Add New Category" : 
                     modalMode === "edit" ? "Edit Category" : "Category Details"}
                  </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {(modalMode === "edit" || modalMode === "view") && (
                    <div>
                      <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                        Category ID
                      </label>
                      <input
                        id="categoryId"
                        value={selectedCategoryId || ""}
                        disabled
                        className="border border-gray-300 rounded-lg p-3 w-full bg-gray-50 text-gray-500"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label
                      htmlFor="categoryName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Category Name {modalMode !== "view" && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      id="categoryName"
                      name="categoryName"
                      value={formData.categoryName}
                      onChange={handleFormChange}
                      required={modalMode !== "view"}
                      disabled={modalMode === "view"}
                      className={`border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        modalMode === "view" ? "bg-gray-50 text-gray-500" : ""
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      disabled={modalMode === "view"}
                      className={`border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        modalMode === "view" ? "bg-gray-50 text-gray-500" : ""
                      }`}
                      rows="3"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="organisation" className="block text-sm font-medium text-gray-700 mb-1">
                      Organisation {modalMode !== "view" && <span className="text-red-500">*</span>}
                    </label>
                    {modalMode === "view" ? (
                      <input
                        value={organisations.find(org => org.organisation_id === formData.organisation)?.organisation_name || formData.organisation}
                        disabled
                        className="border border-gray-300 rounded-lg p-3 w-full bg-gray-50 text-gray-500"
                      />
                    ) : (
                      <select
                        id="organisation"
                        name="organisation_name"
                        value={formData.organisation}
                        onChange={handleFormChange}
                        required={modalMode !== "view"}
                        disabled={modalMode === "view"}
                        className={`border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          modalMode === "view" ? "bg-gray-50 text-gray-500" : ""
                        }`}
                      >
                        <option value="">Select an organisation</option>
                        {organisations.map((org) => (
                          <option key={org.organisation_id} value={org.organisation_id}>
                            {org.organisation_name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        id="isActive"
                        name="isActive"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={handleFormChange}
                        disabled={modalMode === "view"}
                        className="sr-only"
                      />
                      <div className={`block w-10 h-6 rounded-full ${
                        formData.isActive ? 'bg-blue-500' : 'bg-gray-300'
                      } ${modalMode === "view" ? 'opacity-70' : ''}`}>
                      </div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                        formData.isActive ? 'transform translate-x-4' : ''
                      }`}>
                      </div>
                    </div>
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      {formData.isActive ? "Active" : "Inactive"}
                    </label>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    {modalMode === "view" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEdit(categories.find(cat => cat.category_id === selectedCategoryId))}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCategoryModal(false)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Close
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowCategoryModal(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                          disabled={loading}
                        >
                          {loading && (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          {loading ? 
                            (modalMode === "add" ? "Adding..." : "Updating...") : 
                            (modalMode === "add" ? "Add Category" : "Update Category")}
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
      <ChatbotPopup />
      <ToastContainer />
    </div>
  );
}

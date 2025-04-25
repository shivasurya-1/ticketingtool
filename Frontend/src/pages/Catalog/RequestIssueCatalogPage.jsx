import React, { useState, useEffect } from "react";
import { ChevronRight, Search, X, FileQuestion, Layers } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import ChatbotPopup from "../../components/ChatBot";
import { setActiveCategory, setSelectedService } from "../../store/Slices/issueSelectionSlice";
 
import {
  appSupportImage,
  itImage,
  softwareLicenses,
  itAssets,
  payroll,
  fieldServiceImage,
  sapImage,
  dataAnalyticsImage,
  microsoftImage,
  oracleImage,
  hrmsImage,
} from "../../assets/assets.js";
 
const RequestIssueCatalogPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
 
  const [activeCategory, setActiveCategoryState] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [highlightedItem, setHighlightedItem] = useState(null);
 
  const mainCategories = [
    {
      title: "Applications Support",
      description:
        "Issues with business applications such as login problems, errors, or functionality concerns.",
      icon: (
        <img src={appSupportImage} alt="Applications" className="w-6 h-6" />
      ),
      id: "app-support",
      hasSubcategories: true,
    },
    {
      title: "IT Infrastructure",
      description:
        "Issues related to servers, networks, VPN access, email services, or other IT infrastructure.",
      icon: <img src={itImage} alt="IT" className="w-6 h-6" />,
      id: "it-support",
      hasSubcategories: false,
    },
    {
      title: "Software Licenses",
      description:
        "Request new licenses, renew existing ones, or report license activation issues.",
      icon: <img src={softwareLicenses} alt="Software" className="w-6 h-6" />,
      id: "software-licenses",
      hasSubcategories: false,
    },
    {
      title: "IT Assets",
      description:
        "Request new IT hardware, report malfunctions, or request device upgrades.",
      icon: <img src={itAssets} alt="Assets" className="w-6 h-6" />,
      id: "it-assets",
      hasSubcategories: false,
    },
    {
      title: "Payroll",
      description:
        "Concerns regarding salary payments, tax deductions, payslips, or payroll discrepancies.",
      icon: <img src={payroll} alt="Payroll" className="w-6 h-6" />,
      id: "payroll",
      hasSubcategories: false,
    },
    {
      title: "Field Service Agent",
      description:
        "Request on-site IT support for hardware installations, maintenance, or troubleshooting.",
      icon: (
        <img src={fieldServiceImage} alt="Field Service" className="w-6 h-6" />
      ),
      id: "field-service",
      hasSubcategories: false,
    },
  ];
 
  const appSupportItems = [
    {
      title: "SAP",
      description:
        "SAP-related issues including login problems, system errors, configuration support, or access requests.",
      icon: <img src={sapImage} alt="SAP" className="w-6 h-6" />,
      link: "/request-issue/application-support/sap/create-issue",
      disabled: false,
      id: "sap",
    },
    {
      title: "Data Analytics",
      description:
        "Issues related to data visualization, reporting tools, dashboards, or data processing errors.",
      icon: (
        <img
          src={dataAnalyticsImage}
          alt="Data Analytics"
          className="w-6 h-6"
        />
      ),
      link: "/data-analytics/create-issue",
      disabled: true,
      id: "data-analytics",
    },
    {
      title: "Microsoft",
      description:
        "Support for Microsoft applications such as Office 365, Teams, Outlook, SharePoint, or Windows.",
      icon: <img src={microsoftImage} alt="Microsoft" className="w-6 h-6" />,
      link: "/microsoft/create-issue",
      disabled: true,
      id: "microsoft",
    },
    {
      title: "Oracle",
      description:
        "Assistance for Oracle database issues, ERP solutions, access management, or troubleshooting.",
      icon: <img src={oracleImage} alt="Oracle" className="w-6 h-6" />,
      link: "/oracle/create-issue",
      disabled: true,
      id: "oracle",
    },
    {
      title: "HRMS",
      description:
        "HRMS-related concerns, including employee records, leave management, payroll integration.",
      icon: <img src={hrmsImage} alt="HRMS" className="w-6 h-6" />,
      link: "/hrms/create-issue",
      disabled: true,
      id: "hrms",
    },
  ];
 
  // Create a flattened array of all searchable items
  const allItems = [
    ...mainCategories,
    ...appSupportItems.map((item) => ({
      ...item,
      parentCategory: "app-support",
      parentCategoryTitle: "Applications Support",
    })),
  ];
 
  // Search functionality - updated to filter by title only
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
 
    const filteredResults = allItems.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
 
    setSearchResults(filteredResults);
    setShowSearchResults(true);
  }, [searchTerm]);
 
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0 },
  };
 
  const breadcrumbVariants = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.4, delay: 0.1 } },
  };
 
  const handleCategoryClick = (categoryId) => {
    const newActiveCategory = activeCategory === categoryId ? null : categoryId;
    setActiveCategoryState(newActiveCategory);
   
    // Find the category object for Redux store
    if (newActiveCategory) {
      const categoryObj = mainCategories.find(cat => cat.id === newActiveCategory);
      if (categoryObj) {
        dispatch(setActiveCategory({
          id: categoryObj.id,
          title: categoryObj.title
        }));
      }
    } else {
      dispatch(setActiveCategory(null));
    }
   
    setHighlightedItem(null);
  };
 
  const handleItemClick = (link, disabled, itemId = null) => {
    if (!disabled) {
      if (itemId) {
        setHighlightedItem(itemId);
       
        // Find the item by ID for Redux store
        const selectedItem = appSupportItems.find(item => item.id === itemId);
        if (selectedItem) {
          // Store the active category and selected service in Redux
          const activeCategoryObj = mainCategories.find(cat => cat.id === activeCategory);
         
          if (activeCategoryObj) {
            dispatch(setActiveCategory({
              id: activeCategoryObj.id,
              title: activeCategoryObj.title
            }));
          }
         
          dispatch(setSelectedService({
            id: selectedItem.id,
            title: selectedItem.title,
            description: selectedItem.description
          }));
        }
      }
      navigate(link);
    }
  };
 
  const handleSearchItemClick = (item) => {
    if (item.parentCategory) {
      // It's a subcategory item
      setActiveCategoryState(item.parentCategory);
      setHighlightedItem(item.id);
     
      // Find the parent category object for Redux
      const parentCategoryObj = mainCategories.find(cat => cat.id === item.parentCategory);
      if (parentCategoryObj) {
        dispatch(setActiveCategory({
          id: parentCategoryObj.id,
          title: parentCategoryObj.title
        }));
      }
     
      // Set the selected service if it's not disabled
      if (!item.disabled) {
        dispatch(setSelectedService({
          id: item.id,
          title: item.title,
          description: item.description
        }));
      }
    } else {
      // It's a main category
      setActiveCategoryState(item.id);
      setHighlightedItem(null);
     
      // Store category in Redux
      dispatch(setActiveCategory({
        id: item.id,
        title: item.title
      }));
      dispatch(setSelectedService(null));
    }
 
    setSearchTerm("");
    setShowSearchResults(false);
  };
 
  // Get the title of the active category
  const getActiveCategoryTitle = () => {
    if (activeCategory) {
      const category = mainCategories.find((cat) => cat.id === activeCategory);
      return category ? category.title : "";
    }
    return "";
  };
 
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex h-screen bg-gray-50 overflow-hidden"
    >
      {/* Left Sidebar - Reduced width */}
      <div className="w-1/6 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="py-2 px-3">
          <h2 className="text-lg font-bold text-[#1a4789] mb-2">Categories</h2>
          <ul className="space-y-0.5">
            {mainCategories.map((category) => (
              <li key={category.id}>
                <button
                  className={`w-full text-left py-2 px-2 rounded-md flex items-center space-x-2 hover:bg-gray-100 text-sm
                    ${
                      activeCategory === category.id
                        ? "bg-gray-100 font-semibold text-[#1a4789]"
                        : ""
                    }`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div className="flex-shrink-0">{category.icon}</div>
                  <div className="flex-1">{category.title}</div>
                  {category.hasSubcategories && (
                    <ChevronRight
                      className={`w-3 h-3 transition-transform ${
                        activeCategory === category.id
                          ? "transform rotate-90"
                          : ""
                      }`}
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
 
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb with reduced padding */}
        <motion.nav
          variants={breadcrumbVariants}
          initial="initial"
          animate="animate"
          className="bg-white py-2 px-3 border-b border-gray-200 flex justify-between items-center"
        >
          <div className="flex items-center text-sm">
            <Link
              to="/"
              className="hover:text-blue-600 font-bold text-[#224D86]"
            >
              <motion.div whileHover={{ scale: 1.05 }}>Home</motion.div>
            </Link>
            <ChevronRight className="mx-1 w-3 h-3 text-gray-500" />
            <Link
              to="/request-issue"
              className="hover:text-blue-600 font-bold text-[#224D86]"
            >
              <motion.div whileHover={{ scale: 1.05 }}>
                Request Issue
              </motion.div>
            </Link>
            {activeCategory && (
              <>
                <ChevronRight className="mx-1 w-3 h-3 text-gray-500" />
                <span className="font-semibold text-gray-800">
                  {getActiveCategoryTitle()}
                </span>
              </>
            )}
          </div>
 
          {/* Compact search field */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-6 py-1 border border-gray-300 rounded-md w-72 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
            <Search className="absolute left-2 top-1.5 w-3.5 h-3.5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setShowSearchResults(false);
                }}
                className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
 
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-56 overflow-auto">
                {searchResults.map((item, index) => (
                  <div
                    key={index}
                    className="py-2 px-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0 text-sm"
                    onClick={() => handleSearchItemClick(item)}
                  >
                    <div className="flex items-center">
                      <div className="mr-2 flex-shrink-0">{item.icon}</div>
                      <div className="flex flex-col">
                        <h4 className="font-medium text-gray-800">
                          {item.title}
                        </h4>
                        {item.parentCategoryTitle && (
                          <p className="text-xs text-gray-500">
                            in {item.parentCategoryTitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.nav>
 
        {/* Content with optimized spacing */}
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            {activeCategory === "app-support" ? (
              <div>
                {/* Category Title - more compact */}
                <h1 className="font-bold text-xl text-gray-800 mb-3">
                  {getActiveCategoryTitle()}
                </h1>
 
                {/* Grid with more columns on larger screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {appSupportItems.map((item, idx) => (
                    <div
                      key={idx}
                      id={item.id}
                      className={`border border-gray-200 ${
                        item.disabled ? "opacity-75" : ""
                      } bg-white shadow-sm hover:shadow transition-shadow ${
                        item.disabled ? "cursor-not-allowed" : "cursor-pointer"
                      } ${
                        highlightedItem === item.id
                          ? "ring-1 ring-blue-500"
                          : ""
                      }`}
                      onClick={() =>
                        handleItemClick(item.link, item.disabled, item.id)
                      }
                    >
                      <div className="p-2 border-b border-gray-200 bg-[#f5f5f5] flex items-center gap-2">
                        {item.icon}
                        <h3 className="font-semibold text-[#1a4789] text-sm">
                          {item.title}
                        </h3>
                      </div>
                      <div className="p-2">
                        <p className="text-gray-600 text-xs">
                          {item.description}
                        </p>
                        <div className="mt-2 text-right">
                          {item.disabled ? (
                            <span className="bg-yellow-500 text-black px-1.5 py-0.5 rounded-full text-xs font-bold">
                              Coming Soon
                            </span>
                          ) : (
                            <button
                              className="text-[#1a4789] font-medium hover:underline text-xs"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent double firing with parent onClick
                                handleItemClick(item.link, item.disabled, item.id);
                              }}
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeCategory ? (
              <div className="text-center py-8">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded text-sm">
                  <p className="font-bold">Coming Soon</p>
                  <p>This service category is currently under development.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                {/* Smaller welcome graphic */}
                <div className="flex justify-center items-center mb-4">
                  <FileQuestion size={60} className="text-[#1a4789] mr-3" />
                  <Layers size={60} className="text-[#1a4789]" />
                </div>
                <h2 className="text-xl font-bold text-[#1a4789] mb-2">
                  Welcome to the Service Catalog
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-sm">
                  Please select a category from the sidebar to view available
                  services and submit your request.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
 
      <ChatbotPopup />
    </motion.div>
  );
};
 
export default RequestIssueCatalogPage;
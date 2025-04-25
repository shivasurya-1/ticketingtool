import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setActivePage } from "../store/Slices/uiSlice";
import { logout } from "../store/Slices/auth/authenticationSlice";

import {
  User,
  ChevronDown,
  Bell,
  Settings,
  LogOut,
  Loader2
} from "lucide-react";

const navItems = [
  { name: "My Actions", path: "/actions" },
  { name: "Helpful Links", path: "/links" },
  { name: "Other Portals", path: "/portals" },
];

const Navbar = ({ isLoading = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activePage = useSelector((state) => state.ui.activePage);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userProfile = useSelector((state) => state.userProfile.user);

  const handleNavItemClick = (item) => {
    if (!isLoading) {
      dispatch(setActivePage(item.name));
    }
  };

  const toggleProfileDropdown = () => {
    if (!isLoading) {
      setIsProfileDropdownOpen(!isProfileDropdownOpen);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onClickSignOutBtn = () => {
    if (!isLoading) {
      dispatch(logout()); // Dispatch the logout action
      navigate("/login"); // Redirect to the login page
    }
  };

  return (
    <div className={`relative ${isLoading ? "cursor-not-allowed" : ""}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="mt-2 font-medium text-blue-800">Work in progress...</span>
          </div>
        </div>
      )}
      
      <header className="w-full shadow-md my-1 rounded-lg bg-white">
        <div className="container mx-auto">
          <nav className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link
                to="/"
                className={`text-3xl font-bold text-blue-800 hover:text-blue-600 transition-colors flex items-center ${isLoading ? "pointer-events-none" : ""}`}
                onClick={() => !isLoading && handleNavItemClick("Home")}
              >
                <span className="bg-blue-600 text-white px-2 py-1 rounded-md mr-1">
                  Nx
                </span>
                <span className="text-blue-600">
                  Desk
                </span>
              </Link>

              {/* Navigation and Profile Section */}
              <div className="hidden md:flex items-center justify-between space-x-6">
                {/* Navigation Items */}
                <ul className="flex space-x-1">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => handleNavItemClick(item)}
                        className={`
                          px-3 py-2 rounded-md transition-all text-base font-medium
                          ${isLoading ? "pointer-events-none opacity-70" : ""}
                          ${
                            activePage === item.name
                              ? "bg-blue-50 text-blue-800 border-b-2 border-blue-600"
                              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          }
                        `}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Notification Icon */}
                <div className="flex items-center">
                  <button 
                    className={`relative p-2 rounded-full hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors ${isLoading ? "pointer-events-none opacity-70" : ""}`}
                    disabled={isLoading}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                </div>
              </div>

              {/* Profile Section */}
              <div className="relative" ref={dropdownRef}>
                <div
                  className={`flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100 ${isLoading ? "pointer-events-none opacity-70" : ""}`}
                  onClick={toggleProfileDropdown}
                >
                  <div className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden shadow-sm ring-2 ring-blue-400 ring-offset-2">
                    {userProfile && userProfile.profile_pic ? (
                      <img
                        src={userProfile.profile_pic}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium text-sm leading-tight">
                      {userProfile ? userProfile.first_name : "Guest"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {userProfile ? userProfile.role || "User" : "Sign in"}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Enhanced Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 border border-blue-100 overflow-hidden">
                    <div className="p-4 border-b border-blue-50 bg-white">
                      <p className="font-medium text-gray-800">
                        {userProfile
                          ? `${userProfile.first_name} ${
                              userProfile.last_name || ""
                            }`
                          : "Guest User"}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {userProfile
                          ? userProfile.email || "No email provided"
                          : "Please sign in"}
                      </p>
                    </div>

                    <div className="py-2">
                      <div
                        className={`px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer flex items-center ${isLoading ? "pointer-events-none opacity-70" : ""}`}
                        onClick={() => {
                          if (!isLoading) {
                            navigate("/profile");
                            setIsProfileDropdownOpen(false);
                          }
                        }}
                      >
                        <User className="w-4 h-4 mr-2 text-blue-500" />
                        Your Profile
                      </div>
                      <div
                        className={`px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer flex items-center ${isLoading ? "pointer-events-none opacity-70" : ""}`}
                        onClick={() => {
                          if (!isLoading) {
                            navigate("/settings");
                            setIsProfileDropdownOpen(false);
                          }
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2 text-blue-500" />
                        Settings
                      </div>
                      <div className="border-t border-blue-50 my-1"></div>
                      <div className={`px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer flex items-center ${isLoading ? "pointer-events-none opacity-70" : ""}`}>
                        <LogOut className="w-4 h-4 mr-2 text-red-500" />
                        <button 
                          type="button" 
                          onClick={onClickSignOutBtn}
                          disabled={isLoading}
                          className="focus:outline-none"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Mobile Menu - with improved styling */}
          {isMenuOpen && (
            <div className="md:hidden bg-white py-4 border-t border-blue-50 rounded-b-lg">
              <ul className="space-y-2 px-4">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => {
                        if (!isLoading) {
                          handleNavItemClick(item);
                          setIsMenuOpen(false);
                        }
                      }}
                      className={`
                        block px-4 py-2 rounded-md text-base font-medium
                        ${isLoading ? "pointer-events-none opacity-70" : ""}
                        ${
                          activePage === item.name
                            ? "bg-blue-50 text-blue-800 border-l-4 border-blue-600"
                            : "text-gray-700 hover:bg-blue-50"
                        }
                      `}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="border-t border-blue-50 my-3"></div>

              {/* Mobile Profile Section */}
              <div className="px-4">
                <div className="flex items-center space-x-3 mb-4 p-2">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-blue-400 object-cover">
                    {userProfile && userProfile.profile_pic ? (
                      <img
                        src={userProfile.profile_pic}
                        alt="Profile"
                        className="w-full h-full rounded-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">
                      {userProfile ? userProfile.first_name : "Guest"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {userProfile
                        ? userProfile.email || "No email provided"
                        : "Please sign in"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div
                    className={`px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md cursor-pointer flex items-center ${isLoading ? "pointer-events-none opacity-70" : ""}`}
                    onClick={() => {
                      if (!isLoading) {
                        navigate("/profile");
                        setIsMenuOpen(false);
                      }
                    }}
                  >
                    <User className="w-4 h-4 mr-2 text-blue-500" />
                    Your Profile
                  </div>
                  <div
                    className={`px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md cursor-pointer flex items-center ${isLoading ? "pointer-events-none opacity-70" : ""}`}
                    onClick={() => {
                      if (!isLoading) {
                        navigate("/settings");
                        setIsMenuOpen(false);
                      }
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2 text-blue-500" />
                    Settings
                  </div>
                  <div 
                    className={`px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer flex items-center ${isLoading ? "pointer-events-none opacity-70" : ""}`}
                    onClick={onClickSignOutBtn}
                  >
                    <LogOut className="w-4 h-4 mr-2 text-red-500" />
                    Sign out
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default Navbar;
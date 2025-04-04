import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setActivePage } from "../store/Slices/uiSlice";
import { User } from "lucide-react";
import { Menu, X } from "lucide-react";


const Navbar = ({ navItems }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activePage = useSelector((state) => state.ui.activePage);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const username = useSelector((state) => state.user.username);
  const profilePic = useSelector((state) => state.user.profilePic);

  // const handleNavItemClick = (pageName) => {
  //   dispatch(setActivePage(pageName));
  // };

  const handleNavItemClick = (item) => {
    if (item.action) {
      item.action(); // Call the logout function
    } else {
      dispatch(setActivePage(item.name));
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full bg-[#E3E3E3] my-4">
      <nav className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-3xl font-bold text-[#0c2367] hover:text-[#1a3891] transition-colors"
            onClick={() => handleNavItemClick("Home")}
          >
            NxDesk
          </Link>

          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-2xl">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          <div className="hidden md:flex items-center justify-between flex-1 ml-48">
            <ul className="flex space-x-6 gap-3">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => handleNavItemClick(item)}
                    className={`
                      px-2 py-1 rounded-md transition-colors text-base
                      ${
                        activePage === item.name
                          ? "text-blue-600 font-medium"
                          : "text-black hover:text-blue-600"
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center space-x-3 cursor-pointer"
            onClick={()=> navigate("/profile")}
            >
              <div className="w-16 h-16 object-contain rounded-full bg-gray-300 flex items-center justify-center ">
                {/* <User className="w-6 h-6 text-gray-600" /> */}
                
                <img
          src={profilePic}
          alt="Profile"
          className="w-16 h-16 rounded-full object-contain"
        />
              </div>
              <span className="text-gray-700">{username}</span>
            </div>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden flex flex-col items-center bg-[#E3E3E3] py-4">
          <ul className="flex flex-col items-center space-y-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => handleNavItemClick(item.name)}
                  className={`
                    px-2 py-1 rounded-md text-lg
                    ${
                      activePage === item.name
                        ? "text-blue-600 font-medium"
                        : "text-black hover:text-blue-600"
                    }
                  `}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-center space-y-4 mt-6">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-600" />
            </div>
            <span className="text-gray-700">User Profile</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

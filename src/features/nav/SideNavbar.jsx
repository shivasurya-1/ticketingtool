import React from 'react';
import { useSelector } from 'react-redux';
import { selectNavItems } from './NavSlice';
import { Link } from 'react-router-dom';
import 'react-router-dom';

const SideNavbar = () => {
  const navItems = useSelector(selectNavItems);

  return (
    <div className="w-64 h-screen flex flex-col pt-6">
      <div className="pb-4 text-2xl font-bold text-center text-blue-900">
        <a href="https://sriainfotech.com">NxDesk</a>
      </div>
      <div className="p-4 flex-1 bg-blue-800 mb-6 min-h-fit text-white rounded-r-3xl"> 
        {navItems.map((item, index) => (
          <Link key={index} to={item.link} className="block py-2 text-lg hover:bg-blue-600">
            {/* <Link key={index} to={item.link} className="block relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-white after:left-0 after:bottom-0 after:transition-width after:duration-300 hover:after:w-full"> */}
            {item.icon} {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SideNavbar;

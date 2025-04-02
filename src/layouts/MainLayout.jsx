import React from 'react';
import TopNavbar from '../components/TopNavbar';
import SideNavbar from '../features/nav/SideNavbar';

const MainLayout = ({ children }) => {
    return (
        <div className='flex bg-gray-100'>
            <SideNavbar />
            <div className='flex flex-col'>
                <TopNavbar />
                <div className='p-6'>
                    <main>{children}</main>
                </div>
            </div>

        </div>
    );
};

export default MainLayout;

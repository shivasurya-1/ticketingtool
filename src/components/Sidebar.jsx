import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Sidebar() {
     const profilePic = useSelector((state) => state.user.profilePic);
    const sidebarItems = [
        { name: "Dashboard", route: "/dashboard" },
        // { name: "Incidents", route: "/request-issue/application-support/request-issue/application-support/details" },
        { name: "Incidents", route: "/request-issue/application-support/request-issue/application-support/list-of-incidents" },
        // { name: "Create Inscident", route: "/request-issue/application-support/request-issue/application-support/assigned-me" },
        { name: "Create Inscident", route: "/request-issue/application-support/request-issue/application-support/create-issue" },
        { name: "Assigned to me", route: "/request-issue/application-support/request-issue/application-support/assigned-me" },
        { name: "Open activity", route: "/request-issue/application-support/request-issue/application-support/solution" },
        { name: "All activity", route: "/request-issue/application-support/request-issue/application-support/list-of-incidents" },
        { name: "Knowledge Article", route: "/request-issue/application-support/request-issue/application-support/knowledge-article" },
        { name: "Open Incident", route: "/planned-exception" },
        { name: "Resolved Incidents", route: "/incident-location" },
        { name: "Escalated INcidents", route: "/change-tickets" },
        { name: "Problem Tickets", route: "/create-ticket" },
        { name: "Create Problem Tickets", route: "/support-pm" },
        { name: "Link Incident to SR", route: "/link-incident-to-sr" },
        { name: "Download SR form", route: "/download-sr-form" },
        { name: "Employee", route: "/employee" },
        { name: "Link Incidents to PBI", route: "/link-incidents-to-pbi" },
        { name: "Resolved PBI", route: "/resolved-pbi" },
        { name: "Escalation", route: "/escalation" },
        { name: "Support", route: "/support" } 
    
    ];

    return (
        <div>
            <div>
                <aside className="bg-primary text-white p-4 items-center text-center bg-[#2e6ec0] w-[300px] rounded-r-3xl">
                    <div className="mb-6 flex items-center gap-5">
                        <div className="bg-white rounded-full w-16 h-16">
                        <img
          src={profilePic}
          alt="Profile"
          className="w-16 h-16 rounded-full object-contain"
        />
                        </div>
                        <div className=" ">
                            <h2 className="text-xl font-bold">My Project</h2>
                            <p className="text-sm opacity-80">Software Project</p>
                        </div>
                    </div>
                    <hr className="border-t-2 border-gray-300 w-full" />

                    <nav className="space-y-1">
                        {sidebarItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.route} 
                                className="block px-4 py-2 rounded hover:bg-primary-foreground/10 transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </aside>
            </div>
        </div>
    );
}

export default Sidebar;

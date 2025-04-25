import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  User, 
  LayoutDashboard, 
  AlertTriangle, 
  PlusCircle, 
  UserCheck, 
  Activity,
  List,
  FileText,

  Bug,
  Link as LinkIcon,
  Download,
  Users,
  Briefcase,
  CheckCircle,
  ArrowUp,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  RollerCoaster,
  UserIcon,
  Cog,
  MonitorCheck,
  Ticket
} from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const userProfile = useSelector((state) => state.userProfile.user);
  
  // Track open sections
  const [openSections, setOpenSections] = useState({
    overview: true,
    incidents: true,
    activities: false,
    problems: false,
    references: false,
    management: false,
    admin: true
  });

  // Configure which links are disabled (all enabled by default)
  const [disabledLinks, setDisabledLinks] = useState({
    // Set to true to disable specific links
    //menu false
    dashboard: false,
    incidents: false,
    createIncident: false,
    myTickets: false,
    assignedToMe: false,
    projects: false,

    openActivity: true,
    allActivity: true,
    problemTickets: true,
    createProblemTickets: true,
    knowledgeArticle: false,
    linkIncidentToSR: true,
    downloadSRForm: true,
    linkIncidentsToPBI: true,
    resolvedPBI: true,
    employee: false,
    escalation: true,
    support: true
  });

  // Example function to toggle link disabled state (for demonstration)
  // In a real application, you might call this from a settings panel or admin area
  const toggleLinkState = (linkId, isDisabled) => {
    setDisabledLinks(prev => ({
      ...prev,
      [linkId]: isDisabled
    }));
  };

  // Toggle section visibility
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Organize sidebar items into logical groups with corresponding disabled state keys
  const sidebarGroups = [
    {
      id: "overview",
      title: "Overview",
      items: [
        { 
          id: "dashboard",
          name: "Dashboard", 
          route: "/request-issue/application-support/request-issue/application-support/Dashborad", 
          icon: <LayoutDashboard size={16} /> 
        },
        { 
          id: "grouptickets",
          name: "grouptickets", 
          route: "/request-issue/application-support/request-issue/application-support/grouptickets", 
          icon: <Ticket size={16} /> 
        },
      ]
    },
    {
      id: "incidents",
      title: "Incidents",
      items: [
        { 
          id: "incidents",
          name: "Incidents", 
          route: "/request-issue/application-support/request-issue/application-support/list-of-incidents", 
          icon: <AlertTriangle size={16} /> 
        },
        { 
          id: "createIncident",
          name: "Create Incident", 
          route: "http://localhost:3000/request-issue/application-support/sap/create-issue", 
          icon: <PlusCircle size={16} /> 
        },
        { 
          id: "myTickets",
          name: "My Tickets", 
          route: "/request-issue/application-support/request-issue/application-support/my-tickets", 
          icon: <UserCheck size={16} /> 
        },
        { 
          id: "assignedToMe",
          name: "Assigned to Me", 
          route: "/request-issue/application-support/request-issue/application-support/assigned-me", 
          icon: <User size={16} /> 
        },
        { 
          id: "projects",
          name: "Projects", 
          route: "/projects", 
          icon: <LayoutDashboard size={16} /> 
        },
        

        // { 
        //   id: "openIncident",
        //   name: "Open Incident", 
        //   route: "/planned-exception", 
        //   icon: <AlertOctagon size={16} /> 
        // },
        // { 
        //   id: "resolvedIncidents",
        //   name: "Resolved", 
        //   route: "/incident-location", 
        //   icon: <CheckSquare size={16} /> 
        // },
        // { 
        //   id: "escalatedIncidents",
        //   name: "Escalated", 
        //   route: "/change-tickets", 
        //   icon: <ArrowUpRight size={16} /> 
        // },
      ]
    },
    {
      id: "activities",
      title: "Activities",
      items: [
        // { 
        //   id: "openActivity",
        //   name: "Open Activity", 
        //   route: "/request-issue/application-support/request-issue/application-support/solution", 
        //   icon: <Activity size={16} /> 
        // },
        { 
          id: "allActivity",
          name: "All Activities", 
          route: "/request-issue/application-support/request-issue/application-support/list-of-incidents", 
          icon: <List size={16} /> 
        },
      ]
    },
    {
      id: "problems",
      title: "Problems",
      items: [
        { 
          id: "problemTickets",
          name: "Problem Tickets", 
          route: "/create-ticket", 
          icon: <Bug size={16} /> 
        },
        { 
          id: "createProblemTickets",
          name: "Create Problem", 
          route: "/support-pm", 
          icon: <PlusCircle size={16} /> 
        },
      ]
    },
    {
      id: "Oganization",
      title: "Organization",
      items: [
        { 
          id: "employee",
          name: "Employee", 
          route: "/employee", 
          icon: <Users size={16} /> 
        },
        { 
          id: "Solution",
          name: "Solution-Group", 
          route: "/solutionGrp", 
          icon: <Users size={16} /> 
        },

        { 
          id: "organization",
          name: "Organization",
          route: "/organisations",
          icon: <ArrowUp size={16} /> 
        },
        { 
          id: "organizationTree",
          name: "organizationTree",
          route: "/orgtree",
          icon: <ArrowUp size={16} /> 
        },

        { 
          id: "Category",
          name: "Category", 
          route: "/category", 
          icon: <HelpCircle size={16} /> 
        },
      ]
    },
    {
      id: "references",
      title: "Resources",
      items: [
        { 
          id: "knowledgeArticle",
          name: "Knowledge Base", 
          route: "/request-issue/application-support/request-issue/application-support/knowledge-article", 
          icon: <FileText size={16} /> 
        },
        { 
          id: "linkIncidentToSR",
          name: "Link to SR", 
          route: "/link-incident-to-sr", 
          icon: <LinkIcon size={16} /> 
        },
        { 
          id: "downloadSRForm",
          name: "Download SR Form", 
          route: "/download-sr-form", 
          icon: <Download size={16} /> 
        },
        { 
          id: "linkIncidentsToPBI",
          name: "Link to PBI", 
          route: "/link-incidents-to-pbi", 
          icon: <LinkIcon size={16} /> 
        },
        { 
          id: "resolvedPBI",
          name: "Resolved PBI", 
          route: "/resolved-pbi", 
          icon: <CheckCircle size={16} /> 
        },
      ]
    },
    {
      id: "management",
      title: "Management",
      items: [
        { 
          id: "employee",
          name: "Employee", 
          route: "/employee", 
          icon: <Users size={16} /> 
        },
        { 
          id: "escalation",
          name: "Escalation", 
          route: "/escalation", 
          icon: <ArrowUp size={16} /> 
        },
        { 
          id: "support",
          name: "Support", 
          route: "/support", 
          icon: <HelpCircle size={16} /> 
        },
      ]
    },
    {
      id: "admin",
      title: "admin",
      items: [
        // { 
        //   id: "Role Management",
        //   name: "Role Management", 
        //   route: "/manage-role", 
        //   icon: <Users size={16} /> 
        // },
        { 
          id: "User Role",
          name: "User Role",
          route: "/user-role",
          icon: <RollerCoaster size={16} /> 
        },
        { 
          id: "Roles",
          name: "Roles",
          route: "/roles",
          icon: <UserIcon size={16} /> 
        },
        { 
          id: "Permission",
          name: "Permission",
          route: "/permission",
          icon: <Cog size={16} /> 
        },
        { 
          id: "Dispatcher",
          name: "Dispatcher",
          route: "/dispatcher",
          icon: <MonitorCheck size={16} /> 
        },
      ]
    },
   
  ];

  // Check if current route is in a section to auto-expand it
  useEffect(() => {
    sidebarGroups.forEach(group => {
      const isActiveSection = group.items.some(item => item.route === location.pathname);
      if (isActiveSection) {
        setOpenSections(prev => ({...prev, [group.id]: true}));
      }
    });
  }, [location.pathname]);

  // Render link with disabled state handling
  const renderLink = (item) => {
    const isActive = location.pathname === item.route;
    const isDisabled = disabledLinks[item.id];
    
    const linkClasses = `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${
      isDisabled 
        ? "opacity-50 cursor-not-allowed text-blue-200" 
        : isActive 
          ? "bg-white/20 text-white" 
          : "hover:bg-blue-700/40 text-blue-100"
    }`;
    
    if (isDisabled) {
      return (
        <div key={item.id} className={linkClasses} title="This feature is currently disabled">
          {item.icon}
          <span className="flex-grow truncate">{item.name}</span>
          <Lock size={12} className="ml-auto opacity-70" />
        </div>
      );
    }
    
    return (
      <Link
        key={item.id}
        to={item.route}
        className={linkClasses}
      >
        {item.icon}
        <span className="flex-grow truncate">{item.name}</span>
        {isActive && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white"></span>
        )}
      </Link>
    );
  };

  return (
    <div className="h-screen sticky top-0">
      <aside className="bg-[#2e6ec0] text-white h-full w-64 rounded-tr-xl rounded-br-xl flex flex-col shadow-lg">
        {/* Header with user profile */}
        <div className="p-3 flex items-center gap-3 border-b border-blue-400/30">
          <div className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden shadow-md ring-1 ring-blue-400 ring-offset-1 ring-offset-blue-600">
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
            <h2 className="text-base font-bold">My Project</h2>
            <p className="text-xs text-blue-100">Software Project</p>
          </div>
        </div>

        {/* Navigation with collapsible sections */}
        <nav className="flex-1 py-2 px-2 overflow-y-auto scrollbar-hide">
          {sidebarGroups.map((group) => (
            <div key={group.id} className="mb-1">
              <button
                onClick={() => toggleSection(group.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-blue-100 hover:bg-blue-700/50 transition-all duration-200"
              >
                <span className="text-sm font-medium">{group.title}</span>
                {openSections[group.id] ? 
                  <ChevronUp size={14} /> : 
                  <ChevronDown size={14} />
                }
              </button>
              
              {/* Collapsible content */}
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openSections[group.id] ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-0.5 pl-2 pr-1 pb-1">
                  {group.items.map(item => renderLink(item))}
                </div>
              </div>
            </div>
          ))}
        </nav>
        
        {/* Footer */}
        <div className="p-2 text-center text-xs text-blue-200 border-t border-blue-400/30">
          <Briefcase size={12} className="inline mr-1" />
          Software Support Portal
        </div>
      </aside>

      {/* Add global CSS for hiding scrollbars */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default Sidebar;
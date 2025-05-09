
"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Ticket,
  AlertCircle,
  CheckCircle,
  Play,
  Bell,
  Users,
  BarChart,
  Settings,
  FileText,
  Menu,
  ChevronRight,
} from "lucide-react";
import { axiosInstance } from "../../utils/axiosInstance";
import Sidebar from "../../components/Sidebar"
// Create axios instance


export default function Dashboard() {
  const [timeFields, setTimeFields] = useState(null);
  const [ticketCounts, setTicketCounts] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [latestTickets, setLatestTickets] = useState([]);
  const [latestTicketsCount, setLatestTicketsCount] = useState(5);
  const totalTickets = ticketCounts?.total_tickets || 1; // Avoid division by zero
const criticalPercent = ((ticketCounts?.critical || 0) / totalTickets) * 100;
const mediumPercent = ((ticketCounts?.medium || 0) / totalTickets) * 100;
const lowPercent = ((ticketCounts?.low || 0) / totalTickets) * 100;
const criticalEnd = criticalPercent;
const mediumEnd = criticalPercent + mediumPercent;
const accessToken = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch time fields
        const timeFieldsResponse = await axiosInstance.get("/ticket/timefield/",{
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setTimeFields(timeFieldsResponse.data);

        // Fetch ticket counts
        const ticketCountsResponse = await axiosInstance.get("/ticket/tickets/total/count",{
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setTicketCounts(ticketCountsResponse.data);

        // Fetch announcements
        const announcementsResponse = await axiosInstance.get("/five_notifications/announcements/",{
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setAnnouncements(announcementsResponse.data);

        // Fetch organization
        const organizationResponse = await axiosInstance.get("/org/organisation/",{
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setOrganization(organizationResponse.data[0]);

        const TicketResponse = await axiosInstance.get("/ticket/all/",{
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const allTickets = TicketResponse.data.results?.all_tickets || TicketResponse.data.results?.all_ticket || [];

        setLatestTickets(allTickets.slice(0, 5));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickLinks = [
    { name: "Create Ticket", path: "/request-issue/application-support/sap/create-issue", icon: <FileText size={16} /> },
    { name: "Employee Management", path: "/orgtree", icon: <Users size={16} /> },
    { name: "Incident Report", path: "/request-issue/application-support/request-issue/application-support/list-of-incidents", icon: <BarChart size={16} /> },
    { name: "Organisations", path: "/organisations", icon: <Settings size={16} /> },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Format time string for better display
  const formatTime = (timeString) => {
    if (!timeString) return "00:00:00";
    return timeString;
  };

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component (User-provided) */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Navigation */}
      

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 mr-4 bg-blue-100 rounded-full">
                  <Ticket className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                  <h3 className="text-2xl font-bold">{ticketCounts?.total_tickets || 0}</h3>
                </div>

              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 mr-4 bg-green-100 rounded-full">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Resolved</p>
                  <h3 className="text-2xl font-bold">{ticketCounts?.resolved || 0}</h3>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 mr-4 bg-yellow-100 rounded-full">
                  <Play className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">In Progress</p>
                  <h3 className="text-2xl font-bold">{ticketCounts?.inprogress || 0}</h3>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 mr-4 bg-red-100 rounded-full">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Critical</p>
                  <h3 className="text-2xl font-bold">{ticketCounts?.critical || 0}</h3>
                </div>
              </div>
            </div>
          </div>
          {/* Ticket Priority Distribution (Smaller) */}
{/* <div className="grid grid-cols-1 gap-6 mb-6">
  <div className="p-4 bg-white rounded-lg shadow-sm">
    <h3 className="mb-3 text-base font-semibold">Ticket Priority Distribution</h3>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="relative p-3 overflow-hidden border rounded-md bg-red-50 border-red-100">
        <div className="relative z-10">
          <p className="text-xs font-medium text-red-800">Critical</p>
          <h4 className="mt-1 text-lg font-bold text-red-900">{ticketCounts?.critical || 0}</h4>
          <p className="mt-1 text-xs text-red-700">
            {ticketCounts ? Math.round((ticketCounts.critical / ticketCounts.total_tickets) * 100) : 0}% of total
          </p>
        </div>
        <div
          className="absolute bottom-0 left-0 w-full h-1 bg-red-200"
          style={{
            width: ticketCounts ? `${(ticketCounts.critical / ticketCounts.total_tickets) * 100}%` : "0%",
          }}
        ></div>
      </div>

      <div className="relative p-3 overflow-hidden border rounded-md bg-yellow-50 border-yellow-100">
        <div className="relative z-10">
          <p className="text-xs font-medium text-yellow-800">Medium</p>
          <h4 className="mt-1 text-lg font-bold text-yellow-900">{ticketCounts?.medium || 0}</h4>
          <p className="mt-1 text-xs text-yellow-700">
            {ticketCounts ? Math.round((ticketCounts.medium / ticketCounts.total_tickets) * 100) : 0}% of total
          </p>
        </div>
        <div
          className="absolute bottom-0 left-0 w-full h-1 bg-yellow-200"
          style={{
            width: ticketCounts ? `${(ticketCounts.medium / ticketCounts.total_tickets) * 100}%` : "0%",
          }}
        ></div>
      </div>

      <div className="relative p-3 overflow-hidden border rounded-md bg-green-50 border-green-100">
        <div className="relative z-10">
          <p className="text-xs font-medium text-green-800">Low</p>
          <h4 className="mt-1 text-lg font-bold text-green-900">{ticketCounts?.low || 0}</h4>
          <p className="mt-1 text-xs text-green-700">
            {ticketCounts ? Math.round((ticketCounts.low / ticketCounts.total_tickets) * 100) : 0}% of total
          </p>
        </div>
        <div
          className="absolute bottom-0 left-0 w-full h-1 bg-green-200"
          style={{
            width: ticketCounts ? `${(ticketCounts.low / ticketCounts.total_tickets) * 100}%` : "0%",
          }}
        ></div>
      </div>
    </div>
  </div>
</div> */}
<div className="col-span-2 p-6 bg-white rounded-lg shadow-sm">
    <h3 className="mb-4 text-lg font-semibold">Ticket Time Metrics</h3>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="p-4 border rounded-md bg-gray-50">
        <div className="flex items-center mb-2">
          <Clock size={18} className="mr-2 text-blue-600" />
          <h4 className="text-sm font-medium">Avg. Solve Time</h4>
        </div>
        <p className="text-xl font-bold">{formatTime(timeFields?.avg_solve_time)}</p>
      </div>

      <div className="p-4 border rounded-md bg-gray-50">
        <div className="flex items-center mb-2">
          <Clock size={18} className="mr-2 text-yellow-600" />
          <h4 className="text-sm font-medium">Avg. Paused Time</h4>
        </div>
        <p className="text-xl font-bold">{formatTime(timeFields?.avg_paused_time)}</p>
      </div>

      <div className="p-4 border rounded-md bg-gray-50">
        <div className="flex items-center mb-2">
          <Clock size={18} className="mr-2 text-green-600" />
          <h4 className="text-sm font-medium">Avg. Resume Time</h4>
        </div>
        <p className="text-xl font-bold">{formatTime(timeFields?.avg_resume_time)}</p>
      </div>

      <div className="p-4 border rounded-md bg-gray-50">
        <p className="text-sm font-medium text-gray-500">Total Tickets</p>
        <h3 className="text-2xl font-bold">{ticketCounts?.total_tickets || 0}</h3>
      </div>
    </div>
  </div>
{/* Ticket Priority Distribution */}
<div className="grid grid-cols-1 gap-6 mb-6">

</div>
{/* Time Metrics, Total Tickets & Quick Links */}
<div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
<div className="p-4 bg-white rounded-lg shadow-sm">
    <h3 className="mb-3 text-base font-semibold">Ticket Priority Distribution</h3>
    <div className="flex flex-col items-center">
      <div
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          position: 'relative',
          background: `conic-gradient(
            #f87171 0% ${criticalEnd}%,
            #facc15 ${criticalEnd}% ${mediumEnd}%,
            #4ade80 ${mediumEnd}% 100%
          )`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '50px',
            height: '50px',
            background: 'white',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        ></div>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="flex items-center text-sm">
          <span className="w-4 h-4 mr-2 bg-red-400 rounded"></span>
          Critical: {ticketCounts?.critical || 0} ({Math.round(criticalPercent)}%)
        </div>
        <div className="flex items-center text-sm">
          <span className="w-4 h-4 mr-2 bg-yellow-400 rounded"></span>
          Medium: {ticketCounts?.medium || 0} ({Math.round(mediumPercent)}%)
        </div>
        <div className="flex items-center text-sm">
          <span className="w-4 h-4 mr-2 bg-green-400 rounded"></span>
          Low: {ticketCounts?.low || 0} ({Math.round(lowPercent)}%)
        </div>
      </div>
    </div>
  </div>
  <div className="p-4 bg-white rounded-lg shadow-sm">
  <h3 className="mb-3 text-base font-semibold">Ticket Priority Distribution</h3>
  <div className="flex flex-col items-center">
    <div className="flex justify-center w-full max-w-md h-48 gap-4">
      {/* Critical */}
      <div className="flex flex-col items-center h-40 justify-end">
        <div
          className="w-16 bg-red-500 rounded-t transition-all duration-500"
          style={{
            height: `${
              ticketCounts?.total_tickets
                ? (ticketCounts.critical / ticketCounts.total_tickets) * 100
                : 0
            }%`,
          }}
        ></div>
        <p className="mt-2 text-xs text-gray-600">Critical</p>
      </div>

      {/* Medium */}
      <div className="flex flex-col items-center h-40 justify-end">
        <div
          className="w-16 bg-yellow-500 rounded-t transition-all duration-500"
          style={{
            height: `${
              ticketCounts?.total_tickets
                ? (ticketCounts.medium / ticketCounts.total_tickets) * 100
                : 0
            }%`,
          }}
        ></div>
        <p className="mt-2 text-xs text-gray-600">Medium</p>
      </div>

      {/* Low */}
      <div className="flex flex-col items-center h-40 justify-end">
        <div
          className="w-16 bg-green-500 rounded-t transition-all duration-500"
          style={{
            height: `${
              ticketCounts?.total_tickets
                ? (ticketCounts.low / ticketCounts.total_tickets) * 100
                : 0
            }%`,
          }}
        ></div>
        <p className="mt-2 text-xs text-gray-600">Low</p>
      </div>
    </div>

    {/* Legend */}
    <div className="flex gap-4 mt-4">
      <div className="flex items-center text-sm">
        <span className="w-4 h-4 mr-2 rounded" style={{ backgroundColor: '#ef4444' }}></span>
        Critical: {ticketCounts?.critical || 0} ({Math.round(criticalPercent)}%)
      </div>
      <div className="flex items-center text-sm">
        <span className="w-4 h-4 mr-2 rounded" style={{ backgroundColor: '#f59e0b' }}></span>
        Medium: {ticketCounts?.medium || 0} ({Math.round(mediumPercent)}%)
      </div>
      <div className="flex items-center text-sm">
        <span className="w-4 h-4 mr-2 rounded" style={{ backgroundColor: '#22c55e' }}></span>
        Low: {ticketCounts?.low || 0} ({Math.round(lowPercent)}%)
      </div>
    </div>
  </div>
</div>


  <div className="p-6 bg-white rounded-lg shadow-sm">
    <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
    <ul className="space-y-3">
      {quickLinks.map((link, index) => (
        <li key={index}>
          <a
            href={link.path}
            className="flex items-center justify-between p-3 transition-colors border rounded-md hover:bg-blue-50 hover:border-blue-200 group"
          >
            <div className="flex items-center">
              <span className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-md text-blue-600">
                {link.icon}
              </span>
              <span className="font-medium">{link.name}</span>
            </div>
            <ChevronRight
              size={16}
              className="text-gray-400 transition-transform group-hover:text-blue-500 group-hover:translate-x-1"
            />
          </a>
        </li>
      ))}
    </ul>
  </div>
</div>

<div className="p-6 bg-white rounded-lg shadow-sm">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-white text-left">
       
            <th className="py-3 px-4 font-medium text-gray-500">Ticket</th>
            <th className="py-3 px-4 font-medium text-gray-500">Type</th>
            <th className="py-3 px-4 font-medium text-gray-500">Summary</th>
            <th className="py-3 px-4 font-medium text-gray-500">Status</th>
            <th className="py-3 px-4 font-medium text-gray-500">Priority</th>

          </tr>
        </thead>
        <tbody>
          {latestTickets.map((ticket) => (
            <tr key={ticket.ticket_id} className="border-t border-gray-200 hover:bg-gray-50">
            
              <td className="py-3 px-4">
                <a href="#" className="text-blue-600 hover:underline">{ticket.ticket_id}</a>
              </td>
              <td className="py-3 px-4 text-amber-800">{ticket.issue_type}</td>
              <td className="py-3 px-4">{ticket.summary}</td>
              <td className="py-3 px-4">
                <span className={ticket.status === 'Open' ? 'text-blue-600' : 'text-amber-700'}>
                  {ticket.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={ticket.priority === 'Minor' ? 'text-green-700' : 'text-red-600'}>
                  {ticket.priority}
                </span>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>

          {/* Time Metrics & Quick Links */}
          {/* <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
            <div className="col-span-2 p-6 bg-white rounded-lg shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Ticket Time Metrics</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-md bg-gray-50">
                  <div className="flex items-center mb-2">
                    <Clock size={18} className="mr-2 text-blue-600" />
                    <h4 className="text-sm font-medium">Avg. Solve Time</h4>
                  </div>
                  <p className="text-xl font-bold">{formatTime(timeFields?.avg_solve_time)}</p>
                </div>

                <div className="p-4 border rounded-md bg-gray-50">
                  <div className="flex items-center mb-2">
                    <Clock size={18} className="mr-2 text-yellow-600" />
                    <h4 className="text-sm font-medium">Avg. Paused Time</h4>
                  </div>
                  <p className="text-xl font-bold">{formatTime(timeFields?.avg_paused_time)}</p>
                </div>

                <div className="p-4 border rounded-md bg-gray-50">
                  <div className="flex items-center mb-2">
                    <Clock size={18} className="mr-2 text-green-600" />
                    <h4 className="text-sm font-medium">Avg. Resume Time</h4>
                  </div>
                  <p className="text-xl font-bold">{formatTime(timeFields?.avg_resume_time)}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.path}
                      className="flex items-center justify-between p-3 transition-colors border rounded-md hover:bg-blue-50 hover:border-blue-200 group"
                    >
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-md text-blue-600">
                          {link.icon}
                        </span>
                        <span className="font-medium">{link.name}</span>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-gray-400 transition-transform group-hover:text-blue-500 group-hover:translate-x-1"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div> */}

          {/* Announcements */}
 

          {/* Ticket Priority Distribution */}
          {/* <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Announcements</h3>
                <a href="/announcements" className="text-sm text-blue-600 hover:underline">
                  View all
                </a>
              </div>

              {announcements.length > 0 ? (
                <ul className="space-y-4">
                  {announcements.map((announcement) => (
                    <li key={announcement.id} className="p-4 border rounded-md">
                      <h4 className="font-medium">{announcement.title}</h4>
                      <p className="mt-1 text-sm text-gray-600">{announcement.content}</p>
                      <p className="mt-2 text-xs text-gray-500">{formatDate(announcement.created_at)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed rounded-md">
                  <Bell size={24} className="mb-2 text-gray-400" />
                  <p className="text-gray-500">No recent announcements</p>
                </div>
              )}
            </div>
          </div> */}
          

          {/* Organization Info */}
          {organization && (
            <div className="p-6 mt-2  bg-white rounded-lg shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Organization Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 border rounded-md">
                  <p className="text-sm font-medium text-gray-500">Organization Name</p>
                  <p className="mt-1 text-lg font-semibold">{organization.organisation_name}</p>
                </div>

                <div className="p-4 border rounded-md">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-lg font-semibold">{organization.organisation_mail}</p>
                </div>

                <div className="p-4 border rounded-md">
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="mt-1 text-lg font-semibold">{formatDate(organization.created_at)}</p>
                </div>

                <div className="p-4 border rounded-md">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="flex items-center mt-1">
                    <span
                      className={`inline-block w-2 h-2 mr-2 rounded-full ${
                        organization.is_active ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    <p className="text-lg font-semibold">{organization.is_active ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 mt-auto text-sm text-center text-gray-500 border-t">
          <p>© {new Date().getFullYear()} Nxdesk. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

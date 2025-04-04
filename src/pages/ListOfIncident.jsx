import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { ArrowRight, ChevronsUp, Search, Filter, Clock, AlertCircle, CheckCircle, Calendar, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import ChatbotPopup from '../components/ChatBot';
import { axiosInstance } from '../utils/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';

const IncidentTrackingSystem = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIncident, setExpandedIncident] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  const navigate = useNavigate()

  // Sample history data
  const historyData = [
    { user: 'John Smith', date: 'May 17, 2024 at 3:15 PM', oldStatus: 'In Progress', newStatus: 'Done', avatar: 'JS' },
    { user: 'Emma Davis', date: 'May 16, 2024 at 1:45 PM', oldStatus: 'Open', newStatus: 'In Progress', avatar: 'ED' },
    { user: 'Michael Lee', date: 'May 15, 2024 at 10:20 AM', oldStatus: 'New', newStatus: 'Open', avatar: 'ML' },
    { user: 'Sarah Johnson', date: 'May 14, 2024 at 4:30 PM', oldStatus: 'In Progress', newStatus: 'Blocked', avatar: 'SJ' },
    { user: 'David Wilson', date: 'May 13, 2024 at 9:15 AM', oldStatus: 'Blocked', newStatus: 'In Progress', avatar: 'DW' },
    { user: 'Alex Thompson', date: 'May 12, 2024 at 2:00 PM', oldStatus: 'In Progress', newStatus: 'Done', avatar: 'AT' }
  ];

  // Sample articles data
  const articles = [
    {
      title: 'Incident Resolution Best Practices',
      description: 'Learn how to effectively resolve incidents with minimal downtime and customer impact.',
      icon: 'CheckCircle'
    },
    {
      title: 'SLA Management Guidelines',
      description: 'Understanding SLA requirements and ensuring compliance across all incident types.',
      icon: 'Clock'
    },
    {
      title: 'Escalation Procedures',
      description: 'When and how to escalate incidents to the appropriate teams or management.',
      icon: 'ChevronsUp'
    },
    {
      title: 'Root Cause Analysis Framework',
      description: 'A systematic approach to determine underlying causes of incidents.',
      icon: 'Search'
    }
  ];

  // State for active tab
  const [activeTab, setActiveTab] = useState('History');
  const [activeMainTab, setActiveMainTab] = useState('List of Incidents');

  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await axiosInstance.get('/ticket/all/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Incidents:', response.data.results);
        // Add some sample data for visualization if needed
        const enhancedData = response.data.results.map(incident => ({
          ...incident,
          priority: incident.priority || ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
          assignee: incident.assignee || ['John Doe', 'Jane Smith', 'Alex Wilson'][Math.floor(Math.random() * 3)],
          department: incident.department || ['IT', 'HR', 'Finance', 'Operations'][Math.floor(Math.random() * 4)],
        }));

        setIncidents(enhancedData);
      } catch (error) {
        console.error('Error fetching incidents:', error);
        // Add sample data for development/preview
        setIncidents([
          { ticket_id: 'INC-20240520-001', summary: 'Server outage in production environment', status: 'Open', date: 'May 20, 2024', sla: '4 hours', resolvedIn: 'Pending', priority: 'High', assignee: 'John Doe', department: 'IT' },
          { ticket_id: 'INC-20240519-002', summary: 'Login page not working for external users', status: 'Work In Progress', date: 'May 19, 2024', sla: '8 hours', resolvedIn: 'Pending', priority: 'Medium', assignee: 'Jane Smith', department: 'IT' },
          { ticket_id: 'INC-20240518-003', summary: 'Data sync issues between systems', status: 'Work In Progress', date: 'May 18, 2024', sla: '24 hours', resolvedIn: 'Pending', priority: 'Medium', assignee: 'Alex Wilson', department: 'IT' },
          { ticket_id: 'INC-20240517-004', summary: 'Email notification system failure', status: 'Resolved', date: 'May 17, 2024', sla: '4 hours', resolvedIn: '3h 45m', timeForResolution: '3h 45m', priority: 'High', assignee: 'John Doe', department: 'IT' },
          { ticket_id: 'INC-20240516-005', summary: 'Dashboard displaying incorrect metrics', status: 'Resolved', date: 'May 16, 2024', sla: '12 hours', resolvedIn: '10h 15m', timeForResolution: '10h 15m', priority: 'Low', assignee: 'Jane Smith', department: 'Operations' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Work In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Open':
        return 'bg-orange-100 text-orange-800';
      case 'Blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // Filter incidents based on search term and status
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.ticket_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || incident.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle incident click
  const handleIncidentClick = (incident) => {
    if (expandedIncident === incident.ticket_id) {
      setExpandedIncident(null);
    } else {
      setExpandedIncident(incident.ticket_id);
      setSelectedIncident(incident);
    }
  };

  // Icon component map
  const IconMap = {
    'CheckCircle': CheckCircle,
    'Clock': Clock,
    'ChevronsUp': ChevronsUp,
    'Search': Search
  };
  const handleClick = () => {
    // Directly navigating to the full path
    navigate('/request-issue/application-support/request-issue/application-support/create-issue');
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex-1 overflow-auto px-12">
        <div className="container mx-auto py-6 px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">List Of Incidents</h1>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              onClick={handleClick}
              >
                <AlertCircle size={16} />
                New Incident
              </button>
              <button className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Search and filter bar */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search incidents by ID or description..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="Work In Progress">Work In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Blocked">Blocked</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Priorities</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main tabs */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {['List of Incidents', 'Linked Issues', 'Child Issues'].map((tab) => (
                  <button
                    key={tab}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeMainTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    onClick={() => setActiveMainTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Incidents list */}
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredIncidents.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No incidents found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIncidents.map((incident, index) => (
                    <div
                      key={incident.ticket_id}
                      className={`border rounded-lg overflow-hidden transition-all duration-200 ${expandedIncident === incident.ticket_id ? 'shadow-md' : 'hover:shadow-sm'
                        }`}
                    >
                      <div
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 cursor-pointer bg-white"
                        onClick={() => handleIncidentClick(incident)}
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-4 flex-grow">
                          <div className="flex gap-3 items-center">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500 block">
                                {incident.ticket_id}
                              </span>
                              <span className="text-xs text-gray-400">
                                <Calendar className="inline h-3 w-3 mr-1" /> {incident.date}
                              </span>
                            </div>
                          </div>

                          <div className="flex-grow mt-2 md:mt-0">
                            <h3 className="font-medium text-gray-900 flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${getPriorityColor(incident.priority).replace('text-', 'bg-')}`}></span>
                              {incident.summary}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                                {incident.impact}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {incident.issue_type}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {incident.assignee}  {/* temp now */}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 mt-4 md:mt-0">
                          <div className="text-right text-sm">
                            <div className="flex items-center text-gray-500">
                              <Clock size={14} className="mr-1" />
                              <span>SLA: <span className={incident.status === 'Resolved' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>{incident.sla}</span></span>
                            </div>
                            <div className="text-gray-500">
                              {incident.status === 'Resolved' ? (
                                <span className="text-green-600">Resolved in {incident.resolvedIn}</span>
                              ) : (
                                <span className="text-amber-600">Resolution pending</span>
                              )}
                            </div>
                          </div>

                          {expandedIncident === incident.ticket_id ? (
                            <ChevronDown size={20} className="text-gray-400" />
                          ) : (
                            <ChevronRight size={20} className="text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded content */}
                      {expandedIncident === incident.ticket_id && (
                        <div className="border-t p-4 bg-gray-50">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                              {/* Incident details */}
                              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                                <div className=' flex items-center justify-between'>
                                  <h4 className="font-medium text-gray-800 mb-3">Incident Details</h4>
                                  <div>
                                    <Link
                                      to={`/request-issue/application-support/request-issue/application-support/details/${incident.ticket_id}`}
                                      className="text-blue-600 text-sm">
                                      View Details
                                    </Link>
                                  </div>

                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-500">Ticket ID</p>
                                    <p className="font-medium">{incident.ticket_id}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Created Date</p>
                                    <p className="font-medium">{incident.date}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Status</p>
                                    <p className={`font-medium ${getPriorityColor(incident.status)}`}>{incident.status}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Priority</p>
                                    <p className={`font-medium ${getPriorityColor(incident.priority)}`}>{incident.priority}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Assigned To</p>
                                    <p className="font-medium">{incident.assignee}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Department</p>
                                    <p className="font-medium">{incident.department}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Activity tabs */}
                              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="border-b">
                                  <nav className="flex space-x-4 px-4">
                                    {['History', 'Comments', 'Worklog', 'Hierarchy', 'All'].map((tab) => (
                                      <button
                                        key={tab}
                                        className={`py-3 px-2 border-b-2 text-sm ${activeTab === tab
                                          ? 'border-blue-500 text-blue-600 font-medium'
                                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                          }`}
                                        onClick={() => setActiveTab(tab)}
                                      >
                                        {tab}
                                      </button>
                                    ))}
                                  </nav>
                                </div>

                                <div className="p-4 max-h-64 overflow-auto">
                                  {historyData.map((item, index) => (
                                    <div key={index} className="flex mb-4 pb-4 border-b last:border-0">
                                      <div className="mr-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-medium">
                                          {item.avatar}
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                          <div className="text-sm font-medium">{item.user} changed the status</div>
                                          <div className="text-xs text-gray-500">{item.date}</div>
                                        </div>
                                        <div className="flex items-center text-sm">
                                          <span className={`px-2 py-1 rounded ${getStatusColor(item.oldStatus)}`}>
                                            {item.oldStatus}
                                          </span>
                                          <ArrowRight className="mx-2 text-gray-400" size={16} />
                                          <span className={`px-2 py-1 rounded ${getStatusColor(item.newStatus)}`}>
                                            {item.newStatus}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Related articles */}
                            <div>
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                                  <Search size={16} className="mr-2" />
                                  Related Articles
                                </h4>
                                <div className="space-y-3">
                                  {articles.map((article, index) => {
                                    const IconComponent = IconMap[article.icon];
                                    return (
                                      <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start">
                                          <div className="mr-3 mt-1">
                                            <IconComponent size={16} className="text-blue-500" />
                                          </div>
                                          <div>
                                            <h5 className="font-medium text-gray-800 text-sm">{article.title}</h5>
                                            <p className="text-gray-500 text-xs mt-1">{article.description}</p>
                                            <a href="#" className="text-blue-600 text-xs mt-2 inline-flex items-center hover:underline">
                                              View article
                                              <ExternalLink size={12} className="ml-1" />
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Help section */}
          <div className="mt-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Need help with incident management?</h3>
              <p className="text-gray-600 mb-4">Our support team is available 24/7 to help you resolve issues faster.</p>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                  Contact Support
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatbotPopup />
    </div>
  );
};

export default IncidentTrackingSystem;
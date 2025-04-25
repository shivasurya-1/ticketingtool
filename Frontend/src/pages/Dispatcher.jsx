import { useState, useEffect, useRef } from "react";
import { axiosInstance } from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";
import ChatbotPopup from "../components/ChatBot";
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";

export default function DispatcherPage() {
  // State for page data
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(5);
  const [unassignedTickets, setUnassignedTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [availableSolutionGroups, setAvailableSolutionGroups] = useState([]);


  const [currentEntries, setCurrentEntries] = useState({
    start: 0,
    end: 0
  });
  const [searchTerm, setSearchTerm] = useState("");

  // State for assignment modal
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [supportStaff, setSupportStaff] = useState([]);
  const [supportOrganizations, setSupportOrganizations] = useState([]);
  const [solutionGroups, setSolutionGroups] = useState([]);
  const [assignmentData, setAssignmentData] = useState({
    assigneeId: "",
    supportOrgId: "",
    solutionGroupId: ""
  });
  const [assignLoading, setAssignLoading] = useState(false);
  const accessToken = localStorage.getItem("access_token");

  const searchInputRef = useRef(null);

  // Fetch unassigned tickets on component mount - using real API
  useEffect(() => {
    fetchUnassignedTickets();
    fetchSupportData();
  }, []);

  // Handle filtering and pagination
  const filteredTickets = unassignedTickets.filter(ticket => {
    if (!searchTerm.trim()) return true;

    const searchTermLower = searchTerm.toLowerCase().trim();
    return (
      ticket.ticket_id?.toString().toLowerCase().includes(searchTermLower) ||
      ticket.summary?.toLowerCase().includes(searchTermLower) ||
      ticket.issue_type?.toLowerCase().includes(searchTermLower) ||
      ticket.requester_email?.toLowerCase().includes(searchTermLower) ||
      ticket.created_by?.toLowerCase().includes(searchTermLower)
    );
  });

  // Calculate pagination values
  const pageCount = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const offset = currentPage * pageSize;
  const currentItems = filteredTickets.slice(offset, offset + pageSize);

  // Update current entries information when filteredTickets changes
  useEffect(() => {
    const start = filteredTickets.length > 0 ? offset + 1 : 0;
    const end = Math.min(offset + pageSize, filteredTickets.length);
    setCurrentEntries({ start, end });
    setTotalEntries(filteredTickets.length);
  }, [filteredTickets.length, offset, pageSize]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // Fetch unassigned tickets from API
  const fetchUnassignedTickets = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.get('/ticket/dispatcher/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const allTickets = response.data.results?.all_tickets || response.data.results?.all_ticket || [];
      setUnassignedTickets(allTickets);
      setCurrentPage(0);
    } catch (error) {
      console.error("Error fetching unassigned tickets:", error);
      toast.error("Failed to load unassigned tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      const [staffRes, orgsRes, solutionsRes] = await Promise.all([
        axiosInstance.get('user/api/assignee/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axiosInstance.get('org/autoAssignee/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axiosInstance.get('/solution_grp/tickets/', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      ]);

      setSupportStaff(staffRes.data);

      const cleanedOrgData = orgsRes.data.map((item) => ({
        username: item.username,
        organisation_name: item.organisation_name,
        solutiongroup: item.solutiongroup
      }));
      setSupportOrganizations(cleanedOrgData);

      setSolutionGroups(solutionsRes.data);
    } catch (error) {
      console.error("Error fetching support data:", error);
      toast.error("Failed to load support data. Some functions may be limited.");
      setSupportStaff([]);
      setSupportOrganizations([]);
      setSolutionGroups([]);
    }
  };
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(0);
  };
  const handleSolutionGroupChange = (e) => {
    const solutionGroupId = e.target.value;
    setAssignmentData(prev => ({ ...prev, solutionGroupId }));
  };
  const openAssignmentModal = (ticket) => {
    setSelectedTicket(ticket);
    setAssignmentData({ assigneeId: "", supportOrgId: "", solutionGroupId: "" });
    setShowAssignmentModal(true);
  };

  const handleAssigneeChange = (e) => {
    const assigneeId = e.target.value;

    setAssignmentData(prev => ({ ...prev, assigneeId }));

    // Find the selected staff member
    const selectedStaff = supportStaff.find(staff =>
      staff.id?.toString() === assigneeId

    );

    if (selectedStaff) {
      // Find matching organization data
      const staffOrg = supportOrganizations.find(org =>
        org.username === selectedStaff.username
      );

      if (staffOrg) {
        // Set organization
        setAssignmentData(prev => ({
          ...prev,
          assignee: selectedStaff.username,
          supportOrgId: staffOrg.organisation_name,
          solutionGroupId: "" // Reset solution group selection
        }));

        // Set available solution groups for dropdown
        if (Array.isArray(staffOrg.solutiongroup)) {
          setAvailableSolutionGroups(staffOrg.solutiongroup);
        } else if (staffOrg.solutiongroup) {
          setAvailableSolutionGroups([staffOrg.solutiongroup]);
        } else {
          setAvailableSolutionGroups([]);
        }
      }
    } else {
      // Reset if no staff selected
      setAvailableSolutionGroups([]);
      setAssignmentData(prev => ({
        ...prev,
        supportOrgId: "",
        solutionGroupId: ""
      }));
    }
  };

  const handleAssignTicket = async (e) => {
    e.preventDefault();

    if (!assignmentData.assigneeId) {
      toast.error("Please select an assignee");
      return;
    }

    setAssignLoading(true);

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Access token missing. Please log in.");
      return;
    }
    console.log(assignmentData);
    try {
      await axiosInstance.put(
        `/ticket/dispatcher/`,
        {
          ticket_id: selectedTicket.ticket_id,
          developer_organization: assignmentData.supportOrgId,
          is_active: true,
          assignee: assignmentData.assignee,
          solution_grp: assignmentData.solutionGroupId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const updatedTickets = unassignedTickets.filter(ticket => ticket.ticket_id !== selectedTicket.ticket_id);

      setUnassignedTickets(updatedTickets);
      toast.success(`Ticket #${selectedTicket.ticket_id} assigned successfully`);

      setShowAssignmentModal(false);
    } catch (error) {
      console.error("Error assigning ticket:", error);
      toast.error("Failed to assign ticket. Please try again.");
    } finally {
      setAssignLoading(false);
    }
  };

  const getOrganizationName = (orgId) => {
    if (!orgId) return "Not assigned";

    // If orgId is already a name
    if (typeof orgId === 'string') {
      return orgId;
    }

    // Otherwise try to find by ID
    const org = supportOrganizations.find(org =>
      org.organisation_id?.toString() === orgId.toString() ||
      org.id?.toString() === orgId.toString()
    );

    return org ? org.organisation_name : "Unknown Organization";
  };
  const getSolutionGroupName = (sgId) => {
    if (!sgId) return "Not assigned";
    const sg = solutionGroups.find(sg => sg.solution_id?.toString() === sgId.toString());
    return sg ? sg.group_name : "Unknown Solution Group";
  };
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get priority badge class
  const getPriorityBadgeClass = (priority) => {
    if (!priority) return "bg-gray-100 text-gray-800";

    const priorityLower = priority.toLowerCase();
    if (priorityLower === "high" || priorityLower === "critical")
      return "bg-red-100 text-red-800";
    if (priorityLower === "medium")
      return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 mx-4 md:mx-16">
        <div className="p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-3xl md:text-[39px] font-semibold text-gray-800">Dispatcher Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Assign unassigned tickets to support staff members
            </p>
          </div>

          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative w-full md:w-64">
              <input
                ref={searchInputRef}
                type="text"
                className="border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="Search Tickets"
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={fetchUnassignedTickets}
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center shadow-sm hover:bg-blue-700 transition-colors w-full md:w-auto justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Refresh Tickets
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Assignment Modal */}
          {showAssignmentModal && selectedTicket && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="relative bg-white p-6 md:p-8 rounded-lg shadow-xl w-[90%] md:w-[45%] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                  <h1 className="text-lg font-semibold">
                    Assign Ticket #{selectedTicket.ticket_id}
                  </h1>
                  <button
                    onClick={() => setShowAssignmentModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <hr className="my-4 border-t border-gray-300" />

                <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                  <p><span className="font-medium">Summary:</span> {selectedTicket.summary}</p>
                  <p><span className="font-medium">Issue Type:</span> {selectedTicket.issue_type}</p>
                  <p><span className="font-medium">Requested by:</span> {selectedTicket.created_by} ({selectedTicket.requester_email})</p>
                  <p>
                    <span className="font-medium">Priority:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPriorityBadgeClass(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </p>
                  {selectedTicket.description && (
                    <div>
                      <p className="font-medium">Description:</p>
                      <div className="text-sm mt-1 p-3 bg-white rounded border border-gray-200 max-h-32 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: selectedTicket.description }} />
                    </div>
                  )}
                </div>

                <form onSubmit={handleAssignTicket} className="space-y-6 pt-4 mt-4">
                  <div className="flex flex-col">
                    <label htmlFor="assignee" className="font-medium mb-2">
                      Assignee <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="assignee"
                      value={assignmentData.assigneeId}
                      onChange={handleAssigneeChange}
                      className="border p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select an assignee</option>
                      {supportStaff.map(staff => (
                        <option key={staff.id} value={staff.id?.toString()}>
                          {staff.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="supportOrg" className="font-medium mb-2">
                      Support Organization
                    </label>
                    <input
                      id="supportOrg"
                      value={getOrganizationName(assignmentData.supportOrgId)}
                      className="border p-3 w-full rounded-md bg-gray-100"
                      disabled
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="solutionGroup" className="font-medium mb-2">
                      Solution Group
                    </label>
                    {availableSolutionGroups.length > 0 ? (
                      <select
                        id="solutionGroup"
                        value={assignmentData.solutionGroupId}
                        onChange={handleSolutionGroupChange}
                        className="border p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a solution group</option>
                        {availableSolutionGroups.map((group, index) => (
                          <option key={index} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="solutionGroup"
                        value="No solution groups available"
                        className="border p-3 w-full rounded-md bg-gray-100"
                        disabled
                      />
                    )}
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setShowAssignmentModal(false)}
                      className="border p-2 rounded-md hover:bg-gray-100 transition-colors"
                      disabled={assignLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="border p-2 rounded-md bg-[#2E6EC0] text-white hover:bg-[#2555a0] transition-colors flex items-center justify-center min-w-[120px]"
                      disabled={assignLoading}
                    >
                      {assignLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Assigning...
                        </>
                      ) : "Assign Ticket"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Status indicator */}
          {loading && (
            <div className="w-full bg-blue-50 border border-blue-200 p-4 rounded-md mb-4 flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading unassigned tickets...</span>
            </div>
          )}

          {/* Tickets Table */}
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            {!loading && !filteredTickets.length ? (
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchTerm ? "No matching tickets found" : "No unassigned tickets available"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "All tickets are currently assigned or there are no tickets in the system."}
                </p>
                <div className="mt-6">
                  <button
                    onClick={fetchUnassignedTickets}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Refresh Tickets
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Type</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requestor</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((ticket, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {ticket.ticket_id}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                            {ticket.summary}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {ticket.issue_type}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadgeClass(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {ticket.created_by}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatDate(ticket.created_at)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => openAssignmentModal(ticket)}
                              className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              Assign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Pagination and Page Size Controls */}
          {filteredTickets.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 bg-white p-4 rounded-lg border shadow-sm">
              <div className="mb-4 md:mb-0 flex items-center flex-wrap gap-2">
                <div className="flex items-center">
                  <label htmlFor="pageSize" className="mr-2 text-sm text-gray-700">
                    Items per page:
                  </label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="border rounded-md p-1 text-sm"
                  >
                    <option value="2">2</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>
                {totalEntries > 0 && (
                  <span className="text-sm text-gray-700">
                    Showing {currentEntries.start} to {currentEntries.end} of{" "}
                    {totalEntries} entries
                  </span>
                )}
              </div>

              <ReactPaginate
                previousLabel={"← Previous"}
                nextLabel={"Next →"}
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={1}
                pageRangeDisplayed={2}
                onPageChange={handlePageClick}
                forcePage={currentPage}
                containerClassName="flex space-x-1"
                pageClassName="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-100 text-sm"
                activeClassName="bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                previousClassName="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-100 text-sm"
                nextClassName="px-3 py-1 border rounded-md cursor-pointer hover:bg-gray-100 text-sm"
                disabledClassName="opacity-50 cursor-not-allowed"
                breakClassName="px-3 py-1 border rounded-md text-sm"
              />
            </div>
          )}
        </div>
      </main>
      <ChatbotPopup />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
    </div>
  );
}
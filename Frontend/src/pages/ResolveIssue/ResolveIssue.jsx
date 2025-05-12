import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { formatDate } from "../../utils/formatDate";
import "react-toastify/dist/ReactToastify.css";
import { ChevronLeft, X, Paperclip, Trash2 } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import ChatbotPopup from "../../components/ChatBot";
import QuillTextEditor from "../CreateIssue/Components/QuillTextEditor";
import { axiosInstance } from "../../utils/axiosInstance";
import ResolutionInfo from "../ResolutionInfo";
import ChatUI from "./ChatUI";
import QuestionToUserModal from "./components/QuestionToUserModal";

export default function ResolveIssue() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const userProfile = useSelector((state) => state.userProfile.user);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editableStatus, setEditableStatus] = useState("");
  const [statusChoices, setStatusChoices] = useState([]);
  const [impactChoices, setImpactChoices] = useState([]);
  const [priorityChoices, setPriorityChoices] = useState([]);
  const [supportTeamChoices, setSupportTeamChoices] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [expandEditor, setExpandEditor] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    assigneeId: "",
    assignee: "",
    supportOrgId: "",
    solutionGroupId: "",
  });
  const [currentTab, setCurrentTab] = useState("Notes");
  const [questionData, setQuestionData] = useState({
    ticket: "",
    comment: "",
    commentHTML: "",
    attachments: [],
  });
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Reference to ChatUI component - will be used to access its methods
  const chatUIRef = useRef(null);

  // Refs for content scrolling
  const mainContentRef = useRef(null);
  const tabContentRef = useRef(null);

  // Initialize editable status when ticket data is loaded
  useEffect(() => {
    if (ticket) {
      setEditableStatus(ticket.status || "Open");
    }
  }, [ticket]);

  // Fetch ticket details
  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `ticket/tickets/${ticketId}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        console.log("Ticket Details", response);
        setTicket(response.data);
        setQuestionData((prev) => ({
          ...prev,
          ticket: response.data.ticket_id,
        }));

        // Initialize assignment data
        setAssignmentData({
          assigneeId: "",
          assignee: response.data.assignee || "",
          supportOrgId: response.data.developer_organization || "",
          solutionGroupId: response.data.solution_grp || "",
        });
      } catch (error) {
        console.error("Error fetching ticket details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [ticketId]);

  // Fetch ticket choices for dropdowns
  useEffect(() => {
    const fetchTicketChoices = async () => {
      try {
        const response = await axiosInstance.get(`ticket/ticket/choices/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        console.log("All choices", response);
        setPriorityChoices(response.data.priority_choices || []);
        setImpactChoices(response.data.impact_choices || []);
        setStatusChoices(response.data.status_choices || []);
        setSupportTeamChoices(response.data.support_team_choices || []);
      } catch (error) {
        console.error("Error fetching ticket choices:", error);
      }
    };

    fetchTicketChoices();
  }, []);

  // Fetch attachments
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!ticketId || !ticket) return;

      try {
        const response = await axiosInstance.get("ticket/attachments/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          params: { ticket: ticketId },
        });

        // Filter attachments for the current ticket
        const ticketAttachments = response.data.filter(
          (attachment) => attachment.ticket === ticket.ticket_id
        );

        setAttachments(ticketAttachments);
      } catch (error) {
        console.error("Error fetching attachments:", error);
      }
    };

    if (ticket) {
      fetchAttachments();
    }
  }, [ticket, ticketId]);

  // Scroll to content when tab changes
  useEffect(() => {
    if (tabContentRef.current) {
      // Ensure the tab content is visible
      tabContentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentTab]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleQuestionToUser = () => {
    setIsQuestionModalOpen(true);
  };

  const updateTicketStatus = (newStatus) => {
    setTicket((prev) => ({ ...prev, status: newStatus }));
    setEditableStatus(newStatus);
  };

  // Helper function to get impact code from label
  const getImpactCode = (impactLabel) => {
    if (!impactLabel || !impactChoices.length) return null;

    const impactItem = impactChoices.find((item) => item[1] === impactLabel);
    return impactItem ? impactItem[0] : null;
  };

  // Helper function to get priority ID from label
  const getPriorityId = (priorityLabel) => {
    if (!priorityLabel || !priorityChoices.length) return null;

    const priorityItem = priorityChoices.find(
      (item) => item.urgency_name === priorityLabel
    );
    return priorityItem ? priorityItem.priority_id : null;
  };

  console.log("Assignee ", ticket?.assignee?.toLowerCase());
  console.log("Username", userProfile?.username?.toLowerCase());

  // Handle Start Work button click
  const handleStartWork = async () => {
    try {
      // Get the correct impact code and priority ID
      const impactCode = getImpactCode(ticket?.impact);
      const priorityId = getPriorityId(ticket?.priority);

      // Make sure we have valid values before sending
      if (!impactCode) {
        console.error("Invalid impact value:", ticket?.impact);
        return;
      }

      if (!priorityId) {
        console.error("Invalid priority value:", ticket?.priority);
        return;
      }

      const response = await axiosInstance.put(
        `ticket/tickets/${ticketId}/`,
        {
          status: "Working in Progress",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setTicket(response.data);
      setEditableStatus("Working in Progress");
      toast.success("Status updated to Working in Progress!");
    } catch (error) {
      console.error("Failed to update status:", error);
     
    }
  };

  const tabs = ["Notes", "RelatedRecords"];

  // Case 1: If the ticket status is "Resolved", always include "ResolutionInfo"
  if (ticket?.status === "Resolved") {
    tabs.push("ResolutionInfo");
  }
  // Case 2: If the status is NOT "Resolved", only include "ResolutionInfo" if the logged-in user is the assignee
  else if (
    ticket?.assignee?.toLowerCase() === userProfile?.username?.toLowerCase()
  ) {
    tabs.push("ResolutionInfo");
  }

  const renderField = (label, value, additionalClasses = "") => {
    const displayValue = value || "N/A";
    const fieldClasses = `bg-gray-50 border rounded px-2 py-1 w-[50%] cursor-not-allowed outline-none text-sm ${
      !value ? "italic text-gray-400" : ""
    } ${additionalClasses}`;

    return (
      <div className="flex items-center mb-2">
        <label className="w-36 text-black text-sm font-medium">{label}</label>
        <div className={fieldClasses}>{displayValue}</div>
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div
          className={`fixed md:static top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          <Sidebar />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-xl font-semibold">Loading ticket details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      <div
        className={`fixed md:static top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 max-h-screen overflow-hidden">
        {/* Sub Header - Compact */}
        <div className="bg-white border-b flex items-center justify-between p-2 shadow-sm">
          <div className="flex items-center">
            <button
              className="p-1 border rounded mr-2 hover:bg-gray-100"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-1 text-gray-500">≡</span>
            <div>
              <div className="font-semibold text-base leading-tight">
                {ticket?.summary}
              </div>
              <div className="text-gray-600 text-xs">{ticket?.ticket_id}</div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {ticket.status === "Resolved" ? (
              <button
                type="button"
                className="border rounded px-2 py-0.5 text-xs bg-green-50 text-green-700 hover:bg-green-100"
              >
                Resolved
              </button>
            ) : (
              <>
                {ticket?.assignee?.toLowerCase() ===
                  userProfile?.username?.toLowerCase() && (
                  <>
                    {editableStatus !== "Working in Progress" ? (
                      <>
                        <button
                          type="button"
                          className="border rounded px-2 py-0.5 text-xs bg-gray-50 text-gray-700 hover:bg-gray-100"
                          onClick={handleStartWork}
                        >
                          Start Work
                        </button>
                        <button
                          type="button"
                          className="border rounded px-2 py-0.5 text-xs bg-gray-50 text-gray-700 hover:bg-gray-100"
                        >
                          Assign
                        </button>

                        <button
                          type="button"
                          className="border rounded px-2 py-0.5 text-xs bg-gray-50 text-gray-700 hover:bg-gray-100"
                        >
                          Change Priority
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="border rounded px-2 py-0.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
                          onClick={handleQuestionToUser}
                        >
                          Question to User
                        </button>
                        <button
                          type="button"
                          className="border rounded px-2 py-0.5 text-xs bg-gray-50 text-gray-700 hover:bg-gray-100"
                        >
                          Assign
                        </button>

                        <button
                          type="button"
                          className="border rounded px-2 py-0.5 text-xs bg-gray-50 text-gray-700 hover:bg-gray-100"
                        >
                          Change Priority
                        </button>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Main content area with scrolling */}
        <div className="flex-1 overflow-auto" ref={mainContentRef}>
          {/* Ticket Details Card */}
          <div className="bg-white p-3 rounded-md shadow-sm m-3">
            {/* Key details in 2 columns for better space utilization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              {/* Column 1 */}
              <div>
                {renderField("Number", ticket?.ticket_id)}
                {renderField("Requestor", ticket?.created_by)}
                {renderField("Project", ticket?.project)}
                {renderField("Service Domain", ticket?.service_domain)}
                {renderField("Service Type", ticket?.service_type)}
                {ticket?.contact_mode === "phone" &&
                  renderField("Contact Number", ticket?.customer_number)}
                {renderField("Impact", ticket?.impact)}
              </div>

              {/* Column 2 */}
              <div>
                {renderField("Status", editableStatus)}
                {renderField("Priority", ticket?.priority)}
                {renderField("Product", ticket?.product)}
                {renderField("Assignee", ticket?.assignee)}
                {renderField("Solution Group", ticket?.solution_grp)}
                {renderField(
                  "Created On",
                  formatDate(ticket?.created_at) || "N/A"
                )}
              </div>
            </div>

            {/* Reference Ticket - if exists */}
            {ticket?.reference_tickets &&
              ticket.reference_tickets.length > 0 && (
                <div className="flex items-center mt-2">
                  <label className="w-36 text-black text-sm font-medium">
                    Reference Ticket
                  </label>
                  <div className="border rounded px-2 py-1 text-sm bg-gray-50 flex-1">
                    {ticket.reference_tickets.join(", ")}
                  </div>
                </div>
              )}

            {/* Summary and Description - Compact */}
            <div className="mt-3 space-y-2">
              <div className="flex">
                <label className="w-36 text-black text-sm font-medium">
                  Description
                </label>
                <div
                  className="border rounded px-2 py-1 text-sm flex-1 bg-gray-50 max-h-28 overflow-auto"
                  dangerouslySetInnerHTML={{
                    __html: ticket?.description || "No description provided",
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Professional Tab System */}
          <div className="sticky top-0 bg-white z-10 px-3 border-b shadow-sm">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 font-medium relative transition-all duration-200 ${
                    currentTab === tab
                      ? "text-blue-700"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setCurrentTab(tab)}
                >
                  {tab}
                  {currentTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-700"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content with reference for scrolling */}
          <div className="p-4 bg-white" ref={tabContentRef}>
            {currentTab === "Notes" && (
              <ChatUI ref={chatUIRef} ticketId={ticket?.ticket_id} />
            )}

            {currentTab === "RelatedRecords" && (
              <div className="p-2">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-lg">Attachments</h3>
                  </div>

                  <div className="border rounded">
                    {/* Attachments Table */}
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border-b p-2 text-left">File</th>
                          <th className="border-b p-2 text-left">
                            Uploaded At
                          </th>
                          <th className="border-b p-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attachments && attachments.length > 0 ? (
                          attachments.map((attachment) => {
                            // Construct the correct backend URL
                            // Extract just the path portion from the file_url
                            const urlPath = attachment.file_url.replace(
                              /^https?:\/\/[^\/]+/,
                              ""
                            );
                            // Construct the correct backend URL
                            const backendUrl =
                              process.env.REACT_APP_API_BASE_URL ||
                              "http://localhost:8000";
                            const fullUrl = `${backendUrl}${urlPath}`;

                            return (
                              <tr
                                key={attachment.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="border-b p-2">
                                  <div className="flex items-center">
                                    <Paperclip
                                      size={16}
                                      className="mr-2 text-gray-500"
                                    />
                                    <span className="text-gray-700">
                                      {attachment.file_name}
                                    </span>
                                  </div>
                                </td>
                                <td className="border-b p-2">
                                  {new Date(
                                    attachment.uploaded_at
                                  ).toLocaleString()}
                                </td>
                                <td className="border-b p-2">
                                  <div className="flex space-x-2">
                                    <a
                                      href={fullUrl}
                                      className="text-blue-500 hover:underline"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      View
                                    </a>
                                    <a
                                      href={fullUrl}
                                      className="text-blue-500 hover:underline"
                                      download={attachment.file_name}
                                    >
                                      Download
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan="3"
                              className="p-4 text-center text-gray-500"
                            >
                              No attachments found for this ticket
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {currentTab === "ResolutionInfo" && (
              <ResolutionInfo ticketDetails={ticket} />
            )}
          </div>
        </div>

        <QuestionToUserModal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          ticketId={ticket?.ticket_id}
          ticketStatus={editableStatus}
          updateTicketStatus={updateTicketStatus}
          refreshChatMessages={() => {
            if (
              chatUIRef.current &&
              typeof chatUIRef.current.fetchMessages === "function"
            ) {
              chatUIRef.current.fetchMessages(ticket.ticket_id);
            }
          }}
        />

        {/* Toast Container and Chatbot */}
        <ChatbotPopup />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ fontSize: "14px" }}
        />
      </div>
    </div>
  );
}

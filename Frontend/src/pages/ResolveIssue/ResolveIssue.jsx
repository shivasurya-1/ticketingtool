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
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionData, setQuestionData] = useState({
    ticket: "",
    comment: "",
    attachments: [],
  });
  const [expandEditor, setExpandEditor] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    assigneeId: "",
    assignee: "",
    supportOrgId: "",
    solutionGroupId: "",
  });
  const [currentTab, setCurrentTab] = useState("Notes");

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
        toast.error("Failed to load ticket details");
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
        toast.error("Failed to load ticket choices");
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
        toast.error("Failed to load attachments");
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

  // Handle save assignment
  const handleSaveAssignment = async () => {
    try {
      // Get the correct impact code and priority ID
      const impactCode = getImpactCode(ticket?.impact);
      const priorityId = getPriorityId(ticket?.priority);
      console.log("Priority", priorityId)
      const response = await axiosInstance.put(
        `ticket/tickets/${ticketId}/`,
        {
          assignee: assignmentData.assignee,
          solution_grp: assignmentData.solutionGroupId,
          developer_organization: assignmentData.supportOrgId,
          status: editableStatus,
          impact: impactCode, // Send code instead of label
          priority: priorityId, // Send ID instead of label
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setTicket(response.data);
      toast.success("Assignment updated successfully!");
    } catch (error) {
      console.error("Failed to update assignment:", error);
      toast.error("Failed to update assignment.");
    }
  };

  // Handle Start Work button click
  const handleStartWork = async () => {
    try {
      // Get the correct impact code and priority ID
      const impactCode = getImpactCode(ticket?.impact);
      const priorityId = getPriorityId(ticket?.priority);

      // Make sure we have valid values before sending
      if (!impactCode) {
        console.error("Invalid impact value:", ticket?.impact);
        toast.error("Invalid impact value. Cannot update ticket.");
        return;
      }

      if (!priorityId) {
        console.error("Invalid priority value:", ticket?.priority);
        toast.error("Invalid priority value. Cannot update ticket.");
        return;
      }

      const response = await axiosInstance.put(
        `ticket/tickets/${ticketId}/`,
        {
          ...ticket,
          status: "Working in Progress",
          impact: impactCode, // Send code instead of label
          priority: priorityId, // Send ID instead of label
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
      toast.error(
        `Failed to update status: ${
          error.response?.data
            ? JSON.stringify(error.response.data)
            : error.message
        }`
      );
    }
  };

  // Handle Question to User button click
  const handleQuestionToUser = () => {
    setIsQuestionModalOpen(true);
  };

  // Handle question form input changes
  const handleQuestionInputChange = (e) => {
    // If e is an event object with target
    if (e && e.target) {
      const { name, value } = e.target;
      setQuestionData((prev) => ({ ...prev, [name]: value }));
    }
    // If direct name/value params are passed (for QuillTextEditor)
    else if (arguments.length === 2) {
      const [name, value] = arguments;
      setQuestionData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "attachments") {
      // Handle multiple files
      const fileArray = Array.from(files);
      setQuestionData((prev) => ({
        ...prev,
        [name]: [...prev.attachments, ...fileArray],
      }));
    } else {
      setQuestionData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  // Remove a specific attachment
  const handleRemoveAttachment = (index) => {
    setQuestionData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  // Handle question form submission
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("ticket", ticket.ticket_id); // Make sure to use ticket.ticket_id directly
      formData.append("username", userProfile.username);
      formData.append("comment", questionData.comment);

      // Add multiple attachments
      if (questionData.attachments && questionData.attachments.length > 0) {
        questionData.attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      // Debug FormData contents properly
      console.log("Form Data being submitted:");
      for (let pair of formData.entries()) {
        console.log(
          pair[0] + ": " + (pair[1] instanceof File ? pair[1].name : pair[1])
        );
      }

      // First submit the question
      const questionResponse = await axiosInstance.post(
        "ticket/ticket-comments/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Question submission response:", questionResponse.data);

      // Then update the ticket status to "Waiting for User Response"
      // Get the correct impact code and priority ID to include in the update
      const impactCode = getImpactCode(ticket?.impact);
      const priorityId = getPriorityId(ticket?.priority);

      const ticketUpdateResponse = await axiosInstance.put(
        `ticket/tickets/${ticketId}/`,
        {
          ...ticket,
          status: "Waiting for User Response",
          impact: impactCode,
          priority: priorityId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setTicket(ticketUpdateResponse.data);
      setEditableStatus("Waiting for User Response");

      toast.success("Question submitted successfully! Ticket status updated.");
      setIsQuestionModalOpen(false);

      // Reset form
      setQuestionData({
        ticket: ticket.ticket_id,
        comment: "",
        attachments: [],
      });
      setExpandEditor(false);
    } catch (error) {
      console.error("Failed to submit question:", error);
      console.error("Error details:", error.response?.data);
      toast.error(
        `Failed to submit question: ${
          error.response?.data
            ? JSON.stringify(error.response.data)
            : error.message
        }`
      );
    }
  };

  // Helper function to render read-only field
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
            {editableStatus !== "Working in Progress" ? (
              <button
                type="button"
                className="border rounded px-2 py-0.5 text-xs bg-gray-50 text-gray-700 hover:bg-gray-100"
                onClick={handleStartWork}
              >
                Start Work
              </button>
            ) : (
              <button
                type="button"
                className="border rounded px-2 py-0.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
                onClick={handleQuestionToUser}
              >
                Question to User
              </button>
            )}
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
            <button
              className="bg-blue-500 text-white px-2 py-0.5 text-xs rounded hover:bg-blue-600"
              onClick={handleSaveAssignment}
            >
              Save Changes
            </button>
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
              {[ "Notes", "RelatedRecords","ResolutionInfo"].map((tab) => (
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
            {currentTab === "Notes" && <ChatUI />}
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
                        {/* We'll fetch attachments in useEffect */}
                        {attachments && attachments.length > 0 ? (
                          attachments.map((attachment) => (
                            <tr
                              key={attachment.id}
                              className="hover:bg-gray-50"
                            >
                              <td className="border-b p-2">
                                <a
                                  href={attachment.file_url}
                                  className="flex items-center text-blue-600 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Paperclip size={16} className="mr-2" />
                                  {attachment.file_name}
                                </a>
                              </td>
                              <td className="border-b p-2">
                                {new Date(
                                  attachment.uploaded_at
                                ).toLocaleString()}
                              </td>
                              <td className="border-b p-2">
                                <div className="flex space-x-2">
                                  <button
                                    className="text-blue-500 hover:underline"
                                    onClick={() =>
                                      window.open(attachment.file_url, "_blank")
                                    }
                                  >
                                    View
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
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

        {/* Question to User Modal */}
        {isQuestionModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Ask Question to User</h3>
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleQuestionSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment
                  </label>
                  <div className="w-full">
                    {!expandEditor ? (
                      <input
                        type="text"
                        name="comment"
                        value={questionData.comment}
                        onFocus={() => {
                          setExpandEditor(true);
                        }}
                        onChange={handleQuestionInputChange}
                        className="w-full border rounded-md p-2 text-sm"
                        placeholder="Enter your question or comment here..."
                      />
                    ) : (
                      <QuillTextEditor
                        name="comment"
                        value={questionData.comment}
                        onChange={(name, value) =>
                          handleQuestionInputChange(name, value)
                        }
                        className="bg-white border rounded"
                      />
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attachments
                  </label>
                  <div className="border rounded-md p-2">
                    <input
                      type="file"
                      name="attachments"
                      onChange={handleFileChange}
                      className="hidden"
                      id="attachment-upload"
                      multiple
                    />
                    <label
                      htmlFor="attachment-upload"
                      className="flex items-center cursor-pointer text-sm text-blue-500 hover:text-blue-600"
                    >
                      <Paperclip size={16} className="mr-1" />
                      Upload files
                    </label>

                    {/* Display selected files */}
                    {questionData.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {questionData.attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 p-1 rounded"
                          >
                            <div className="flex items-center text-xs">
                              <Paperclip
                                size={14}
                                className="mr-1 text-gray-500"
                              />
                              <span className="truncate max-w-[250px]">
                                {file.name}
                              </span>
                              <span className="text-gray-400 ml-1">
                                ({Math.round(file.size / 1024)} KB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuestionModalOpen(false);
                      setExpandEditor(false);
                    }}
                    className="px-4 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                  >
                    Submit Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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

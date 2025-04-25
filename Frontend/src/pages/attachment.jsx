import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from "react-redux";

import { Search, Paperclip, Image, Send, X, FileText } from 'lucide-react';
import { axiosInstance } from "../utils/axiosInstance";
import { toast } from "react-toastify";

const ChatUI = () => {
  // State management
  const [currentTab, setCurrentTab] = useState("Chat");
  const userProfile = useSelector((status) => status.userProfile.user);

  const { ticketId } = useParams();
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const accessToken = localStorage.getItem("access_token");
  const imageInputRef = useRef(null);
  const authHeaders = { headers: { Authorization: `Bearer ${accessToken}` } };
  const chatEndRef = useRef(null);
  const [formData, setFormData] = useState({
    number: "",
    requestor: "",
    customerCountry: "india",
    supportOrgName: "",
    assignee: "",
    solutionGroup: "",
    referenceTicket: [],
    description: "",
    summary: "",
    issueType: "",
    impact: "",
    supportTeam: "",
    project: "",
    product: "",
    priority: "",
    email: "",
    developerOrganization: "",
    // contactNumber: "",
    // contactMode: "",
    search: "",
    resolutionCode: "",
    resolutionNotes: "",
    resolutionSummary: "",
    status: "",
    resolvedBy: "",
    resolvedDate: ""
  });

  // Fetch ticket details when component mounts
  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const ticketResponse = await axiosInstance.get(`ticket/tickets/${ticketId}/`, authHeaders);
        const ticketData = ticketResponse.data;

        setFormData({
          number: ticketData.ticket_id || "",
          requestor: ticketData.created_by || userProfile.first_name,
          customerCountry: ticketData.customer_country || "india",
          supportOrgName: "",
          assignee: ticketData.assignee || "",
          solutionGroup: ticketData.solution_grp || "",
          referenceTicket: ticketData.reference_tickets || [],
          description: ticketData.description || "",
          summary: ticketData.summary || "",
          issueType: ticketData.issue_type || "",
          impact: ticketData.impact || "",
          supportTeam: ticketData.support_team || "",
          project: ticketData.project || "",
          product: ticketData.product || "",
          priority: ticketData.priority || "",
          email: ticketData.requester_email || userProfile.email,
          developerOrganization: ticketData.developer_organization || "",
          contactNumber: ticketData.customer_number || "",
          contactMode: ticketData.contact_mode || "",
          search: `Issue - ${ticketData.ticket_id}`,
          resolutionCode: ticketData.resolution_code || "",
          resolutionNotes: ticketData.resolution_notes || "",
          resolutionSummary: ticketData.resolution_summary || "",
          status: ticketData.status || "",
          resolvedBy: ticketData.resolved_by || "",
          resolvedDate: ticketData.resolved_date || "",
        });
      } catch (error) {
        console.error("Error fetching ticket details:", error);
        toast.error("Failed to load ticket details");
      }
    };

    if (ticketId) {
      fetchTicketDetails();
    }
  }, [ticketId, userProfile.first_name, userProfile.email]);

  // Fetch messages (ticket notes) when ticket number changes
  useEffect(() => {
    if (formData.number) {
      fetchMessages(formData.number);
    }
  }, [formData.number]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (ticketId) => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        toast.error("Access token missing. Please log in.");
        return;
      }

      if (!ticketId) {
        setLoading(false);
        return;
      }

      // Fetch ticket notes/messages
      const response = await axiosInstance.get(`/ticket/reports/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { ticket: ticketId }
      });

      // Transform ticket notes into message format
      const messageData = response.data.map(note => ({
        id: note.id,
        text: note.title || note.content,
        timestamp: new Date(note.created_at).toLocaleString(),
        isCurrentUser: note.username === userProfile.username || note.username === userProfile.first_name,
        user: note.username || "System",
        attachments: note.report_attachments ? note.report_attachments.map(att => ({
          id: att.id,
          name: getFileNameFromUrl(att.file_url),
          type: getFileTypeFromUrl(att.file_url),
          url: att.file_url,
          uploaded_at: att.uploaded_at
        })) : []
      }));
      console.log(messageData)

      setMessages(messageData);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract filename from URL
  const getFileNameFromUrl = (url) => {
    if (!url) return "Unknown file";
    const urlParts = url.split('/');
    const fileNameWithParams = urlParts[urlParts.length - 1];
    // Remove any query parameters if present
    return fileNameWithParams.split('?')[0];
  };

  // Helper function to guess file type from URL or filename
  const getFileTypeFromUrl = (url) => {
    if (!url) return "application/octet-stream"; // default binary

    const fileName = getFileNameFromUrl(url).toLowerCase();

    if (fileName.match(/\.(jpeg|jpg|png|gif|bmp|webp)$/)) return "image/" + fileName.split('.').pop();
    if (fileName.match(/\.(pdf)$/)) return "application/pdf";
    if (fileName.match(/\.(doc|docx)$/)) return "application/msword";
    if (fileName.match(/\.(xls|xlsx)$/)) return "application/vnd.ms-excel";
    if (fileName.match(/\.(ppt|pptx)$/)) return "application/vnd.ms-powerpoint";
    if (fileName.match(/\.(zip|rar|7z)$/)) return "application/zip";
    if (fileName.match(/\.(txt)$/)) return "text/plain";

    // Fallback
    return "application/octet-stream";
  };

  // Updated sendMessage function with clearer messaging
  const sendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        toast.error("Access token missing. Please log in.");
        return;
      }

      // First, upload any local files
      let uploadedAttachments = [];
      for (const attachment of attachments) {
        if (attachment.isLocal) {
          const fileFormData = new FormData();
          fileFormData.append('attachments', attachment.file);
          fileFormData.append('ticket', formData.number);
          fileFormData.append('title', newMessage || "Attachment Added");

          const response = await axiosInstance.post('/ticket/reports/', fileFormData, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'multipart/form-data',
            },
          });

          // Assuming the response contains the uploaded file details
          const uploadedFile = response.data;
          uploadedAttachments.push({
            id: uploadedFile.id,
            name: attachment.name,
            type: attachment.type,
            url: uploadedFile.file_url,
          });
        } else {
          uploadedAttachments.push(attachment); // Already uploaded files
        }
      }

      // Create array of attachment IDs for the API request
      const attachmentIds = uploadedAttachments
        .map((att) => att.id)
        .filter((id) => typeof id === 'number');

      // Add message to UI immediately for responsive feeling
      const tempMessage = {
        id: `temp-${Date.now()}`,
        text: newMessage,
        timestamp: 'Sending...',
        isCurrentUser: true,
        user: userProfile.first_name || 'You',
        attachments: [...uploadedAttachments],
      };

      setMessages((prev) => [...prev, tempMessage]);

      // Call the API to add a new note/message with all content
      // if (attachments.length != 0) {
      // await axiosInstance.post(
      //   "/ticket/reports/",
      //   {
      //     title: newMessage,
      //     ticket: formData.number,
      //     attachments: attachmentIds, // Send attachment IDs
      //   },
      //   { headers: { Authorization: `Bearer ${accessToken}` } }
      // );


      // Clear the input field and attachments after successful send
      setNewMessage("");
      setAttachments([]);

      // Revoke object URLs to prevent memory leaks
      attachments.forEach((att) => {
        if (att.previewUrl && att.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(att.previewUrl);
        }
      });

      // Refresh messages to ensure we have the latest data
      fetchMessages(formData.number);

      // toast.success("Message and attachments sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message and attachments");

      // Remove the temp message if sending failed
      setMessages((prev) => prev.filter((msg) => msg.id !== `temp-${Date.now()}`));
    }
  };

  const handleFileAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleImageAttachment = () => {
    imageInputRef.current?.click();
  };

  // Enhanced file handling with clearer preview
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => {
        const objectUrl = URL.createObjectURL(file); // Create a local URL for preview
        return {
          id: `local-${Date.now()}-${Math.random()}`, // Temporary ID for local files
          name: file.name,
          type: file.type,
          size: file.size,
          file: file, // Store the actual File object for later upload
          previewUrl: objectUrl, // URL for preview
          isLocal: true, // Flag to indicate this is a local file
        };
      });

      setAttachments((prev) => [...prev, ...newFiles]);
      toast.success("Files ready for preview. Send to upload.");
    }

    // Reset the file input so the same file can be selected again
    e.target.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments((prev) =>
      prev.filter((att) => {
        if (att.id === id) {
          // Revoke object URL to prevent memory leaks
          if (att.previewUrl && att.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(att.previewUrl);
          }
          return false;
        }
        return true;
      })
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Enhanced file preview renderer with clearer presentation
  const renderFilePreview = (file) => {
    if (file.type?.startsWith('image/')) {
      return (
        <div className="relative group">
          <img
            src={file.previewUrl || file.url}
            alt={file.name}
            className="max-h-32 max-w-full rounded border border-gray-200"
          />
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
              onClick={() => window.open(file.previewUrl || file.url, '_blank')}
            >
              <Search size={14} />
            </button>
          </div>
        </div>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="flex items-center bg-gray-100 p-2 rounded">
          <FileText size={24} className="text-red-500 mr-2" />
          <div className="flex-1 truncate text-sm">{file.name}</div>
          <a
            href={file.previewUrl || file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-500 hover:underline text-sm"
          >
            View PDF
          </a>
        </div>
      );
    } else {
      return (
        <div className="flex items-center bg-gray-100 p-2 rounded">
          <Paperclip size={18} className="text-gray-500 mr-2" />
          <div className="flex-1 truncate text-sm">{file.name}</div>
          {(file.previewUrl || file.url) && (
            <a
              href={file.previewUrl || file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-500 hover:underline text-sm"
              download={file.name}
            >
              Download
            </a>
          )}
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main content area - Chat */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="bg-white p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold">Customer Communication</h2>
              <div className="text-sm text-gray-600">Case #{formData.number}</div>
            </div>
            <div className="flex space-x-2">
              <button
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
                onClick={() => fetchMessages(formData.number)}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Chat messages area */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <div className="mt-2 text-gray-600">Loading messages...</div>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg max-w-3xl ${msg.isCurrentUser
                    ? "bg-blue-100 ml-auto"
                    : "bg-white border border-gray-200 mr-auto"
                    }`}
                >
                  <div className="flex items-center mb-1">
                    <div className={`w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs ${msg.isCurrentUser ? "order-last ml-2" : "mr-2"
                      }`}>
                      {msg.user?.charAt(0) || '?'}
                    </div>
                    <div className="font-medium text-sm">{msg.user}</div>
                    <div className={`text-xs text-gray-500 ${msg.isCurrentUser ? "mr-auto pr-2" : "ml-auto pl-2"
                      }`}>
                      {msg.timestamp}
                    </div>
                  </div>

                  <div className="text-sm whitespace-pre-wrap">{msg.text}</div>

                  {/* Show attachments if any */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.attachments.map((file, fileIdx) => (
                        <div key={fileIdx} className="text-xs">
                          {file.type?.startsWith('image/') ? (
                            <div className="mt-1">
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="max-h-32 rounded border border-gray-200 mb-1 hover:opacity-90 transition-opacity"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/150?text=Image+Not+Available";
                                  }}
                                />
                              </a>
                              <div className="text-xs text-gray-500 flex justify-between">
                                <span className="truncate">{file.name}</span>
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline ml-2"
                                  download
                                >
                                  Download
                                </a>
                              </div>
                            </div>
                          ) : file.type === 'application/pdf' ? (
                            <div className="flex items-center bg-gray-50 p-2 rounded">
                              <FileText size={18} className="text-red-500 mr-2" />
                              <span className="truncate max-w-xs">{file.name}</span>
                              <div className="ml-auto flex space-x-2">
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  View
                                </a>
                                <a
                                  href={file.url}
                                  download={file.name}
                                  className="text-blue-500 hover:underline"
                                >
                                  Download
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center bg-gray-50 p-2 rounded">
                              <Paperclip size={16} className="mr-2 text-gray-500" />
                              <span className="truncate max-w-xs">{file.name}</span>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto text-blue-500 hover:underline"
                                download={file.name}
                              >
                                Download
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-gray-400 mb-2">No messages yet</div>
              <div className="text-sm text-gray-500">
                Start the conversation by sending a message below
              </div>
            </div>
          )}
        </div>

        {/* Attachment preview area with clear labeling */}
        {attachments.length > 0 && (
          <div className="bg-white p-3 border-t">
            <div className="text-sm font-medium mb-2">
              Ready to send: {attachments.length} {attachments.length === 1 ? 'attachment' : 'attachments'}
            </div>
            <div className="flex flex-wrap gap-3">
              {attachments.map(file => (
                <div key={file.id} className="relative group">
                  {renderFilePreview(file)}
                  <button
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                    onClick={() => removeAttachment(file.id)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message input with clearer send button */}
        <div className="bg-white p-3 border-t">
          <div className="flex items-center">
            <button
              className="p-2 text-gray-500 hover:bg-gray-100 rounded"
              onClick={handleFileAttachment}
              title="Attach files"
            >
              <Paperclip size={18} />
            </button>
            <button
              className="p-2 text-gray-500 hover:bg-gray-100 rounded"
              onClick={handleImageAttachment}
              title="Attach images"
            >
              <Image size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
            <div className="flex-1 mx-2">
              <textarea
                className="w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-300"
                rows="3"
                placeholder="Type your message here..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
              ></textarea>
            </div>
            <button
              className={`${newMessage.trim() || attachments.length > 0
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-300 cursor-not-allowed"
                } text-white p-2 rounded flex items-center justify-center`}
              onClick={sendMessage}
              disabled={!newMessage.trim() && attachments.length === 0}
              title={attachments.length > 0 ? "Send message with attachments" : "Send message"}
            >
              <Send size={18} />
              <span className="ml-1 hidden sm:inline">Send All</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;
"use client";
import { axiosInstance } from "../utils/axiosInstance";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Search } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ChatbotPopup from "../components/ChatBot";
import TicketDetails from "../components/common/TicketDetails";

export default function CreateIssueDetailPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true); // Initialize loading as true

  useEffect(() => {
    console.log("Ticket ID:", ticketId);
    const fetchTicketDetails = async () => {
      try {
        const response = await axiosInstance.get(`ticket/${ticketId}/`);
        setTicket(response.data);
      } catch (error) {
        console.error("Error fetching ticket details:", error);
      } finally {
        setLoading(false); // Ensure loading is set to false after fetching
      }
    };

    fetchTicketDetails();
  }, [ticketId]);

  console.log("Ticket Details:", ticket);

  const ticketFields = [
    // Basic Ticket Info
    { label: "Ticket Number", key: "ticket_id" },
    { label: "Summary", key: "summary" },
    { label: "Description", key: "description" },
  
    // Status & Priority
    { label: "Status", key: "status" },
    { label: "Priority", key: "priority" },
    { label: "Impact", key: "impact" },
    { label: "Issue Type", key: "issue_type" },
    
    // Assignment & Teams
    { label: "Assignee", key: "assignee" },
    { label: "Support Team", key: "support_team" },
    { label: "Solution Group", key: "solution_grp" },
  
    // Project & Product Details
    { label: "Project", key: "project" },
    { label: "Product", key: "product" },
    { label: "Developer Organization", key: "developer_organization" },
  
    // Customer & Contact Info
    { label: "Customer Number", key: "customer_number" },
    { label: "Customer Country", key: "customer_country" },
    { label: "Contact Mode", key: "contact_mode" },
  
    // References & Related Tickets
    { label: "Reference Tickets", key: "reference_tickets" },
  
    // Metadata (Created & Modified Info)
    { label: "Created By", key: "created_by" },
    { label: "Modified By", key: "modified_by" },
    { label: "Created At", key: "created_at" },
    { label: "Modified At", key: "modified_at" }
  ];
  
  

  // Show loading state
  if (loading) {
    return (
      <div className="flex w-full min-h-screen">
        <Sidebar />
        <div className="flex justify-center items-center min-h-screen w-full">
          <p className="text-xl font-semibold">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <main className="flex-1 mx-16">
        <div className="p-6">
          <div>
            <h1 className="text-3xl font-bold">Ticket Details</h1>
          </div>

          <div>
            <ul className="flex gap-6 items-center font-medium pt-5">
              <li>Problems</li>
              <li>New</li>
              <li>Search</li>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-3 rounded-xl border w-[192px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </ul>
          </div>
          <div className="bg-white p-4 px-7 my-10 rounded-xl">
            <TicketDetails ticket={ticket} ticketFields={ticketFields} />
          </div>
        </div>
      </main>
      <ChatbotPopup />
    </div>
  );
}

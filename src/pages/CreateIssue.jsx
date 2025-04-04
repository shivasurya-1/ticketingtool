"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatbotPopup from "../components/ChatBot";
import { axiosInstance } from "../utils/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import CreateIssuePageFormField from "../components/common/CreateIssuePageFormField";
import CreateIssuePageTextAreaField from "../components/common/CreateIssuePageTextAreaField";
import CreateIssuePageSelectField from "../components/common/CreateIssuePageSelectField";
import { useSelector } from "react-redux";

export default function CreateIssue() {
  const username = useSelector((state) => state.user.username);
  const [selected, setSelected] = useState("Comments");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    // number: "",
    requestor: username,
    ticket_id:"",
    customerCountry: "",
    supportOrgName: "",
    assignee: "",
    solutionGroup: "",
    supportTeam: "",
    referenceTicket: "",
    description: "",
    emailAddresses: ["", ""],
    summary: "",
    issue_type: "",
    impact: "",  // Added impact field
    support_team: "", // Added support_team field
    project: "",
    product: "",
    contact_mode: "",
    solution_grp: "", // Added solution_grp field
    developer_organization: 1
  });
const[ticektID,setTicketID]=useState([])
  const [solutionGroupList, setSolutionGroupList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);
  const [organizationsList, setOrganizationsList] = useState([]);
  const [supportTeamList, setSupportTeamList] = useState([]);
  const [issueTypeList, setIssueTypeList] = useState([]);
  const [activeUsersList, setActiveUsersList] = useState([]);
  const [impactList, setImpactList] = useState([
    { value: "A", label: "High" },
    { value: "B", label: "Medium" },
    { value: "C", label: "Low" }
  ]);
  const [contact_mode, setContactMode] = useState([
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
  ]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClick = (item) => {
    setSelected(item);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // if (name === "emailAddresses") {
    //   // Update email addresses array
    //   const index = parseInt(e.target.dataset.index);
    //   const updatedEmails = [...formData.emailAddresses];
    //   updatedEmails[index] = value;
    //   setFormData((prevState) => ({
    //     ...prevState,
    //     emailAddresses: updatedEmails,
    //   }));
    // } else 
    if (name === "solutionGroup") {
      // Update both solutionGroup and solution_grp fields
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
        solution_grp: value
      }));
    } else if (name === "supportTeam") {
      // Update both supportTeam and support_team fields
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
        support_team: value
      }));
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Make sure all required fields are filled
    const requiredFields = [
      "issue_type",
      "summary",
      "description",
      "impact",
      "support_team",
      "project",
      "product",
      "contact_mode",
      "solution_grp",
    ];

    // Map form fields to API expected fields
    const apiData = {
      ...formData,
      solution_grp: formData.solutionGroup || formData.solution_grp,
      support_team: formData.supportTeam || formData.support_team
    };

    const isValid = requiredFields.every((field) => apiData[field]);
    console.log("Form data to submit:", apiData);

    if (!isValid) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Access token is missing. Please login.");
      return;
    }

    try {
      const response = await axiosInstance.post("/ticket/create/", apiData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(response.data);
      toast.success("Issue created successfully");
    } catch (error) {
      console.error("Error creating issue:", error);
      toast.error("There was an error creating the issue.");
    }
  };

  const getAuthorizedHeaders = (accessToken) => {
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  };

  useEffect(() => {
    const fetchMultipleAPis = async () => {
      try {
        const accessToken = localStorage.getItem("access_token"); // Retrieve the access token
        console.log("Access Token", accessToken);
        if (!accessToken) {
          console.error("Access token not found.");
          return; // Exit if no token is found
        }
        const authHeaders = getAuthorizedHeaders(accessToken);
        const [subGroupsList, orgList, priorityList, choicesList, activeUsersList,ticketId] =
          await Promise.all([
            axiosInstance.get("solution_grp/create/", authHeaders),
            axiosInstance.get("org/organisation/", authHeaders),
            axiosInstance.get("priority/priority/", authHeaders),
            axiosInstance.get("ticket/ticket/choices/", authHeaders),
            axiosInstance.get("user/api/register/", authHeaders),
            axiosInstance.get("ticket/getId/",authHeaders)
      

          ]);
        console.log("Subgroups List", subGroupsList.data);
        console.log("Organizations List", orgList.data);
        console.log("Priority List", priorityList.data);
        console.log("Choices List", choicesList.data);
        console.log("Active Users List", activeUsersList.data);
        console.log("Impact List", impactList.data);
        console.log("getID",ticketId.data)
        setSolutionGroupList(subGroupsList.data);
        setPriorityList(priorityList.data);
        setOrganizationsList(orgList.data);
        setIssueTypeList(choicesList.data.issue_type_choices);
        setSupportTeamList(choicesList.data.support_team_choices);
        setActiveUsersList(activeUsersList.data);
        if (ticketId.data) {
          setFormData(prevState => ({
            ...prevState,
            ticket_id: ticketId.data  // Update ticket_id with API response
          }));
        }
   
setTicketID(ticektID.data)
        setFormData(prevState => ({
          ...prevState,
          // Set default values 
          issue_type: choicesList.data.issue_type_choices?.length > 0 ? choicesList.data.issue_type_choices[0][0] : "",
          impact: impactList.data?.length > 0 ? impactList.data[0].value : "A",
          contact_mode: contact_mode[0].value,
          supportOrgName: orgList.data?.length > 0 ? orgList.data[0].organisation_id : "",
          solutionGroup: subGroupsList.data?.length > 0 ? subGroupsList.data[0].solution_id : "",
          solution_grp: subGroupsList.data?.length > 0 ? subGroupsList.data[0].solution_id : "",
          supportTeam: choicesList.data.support_team_choices?.length > 0 ? choicesList.data.support_team_choices[0][0] : "",
          support_team: choicesList.data.support_team_choices?.length > 0 ? choicesList.data.support_team_choices[0][0] : "",
          assignee: activeUsersList.data?.length > 0 ? activeUsersList.data[0].id : ""
        }));

      } catch (error) {
        console.error("Error fetching APIs:", error);
        if (error.response) {
          console.error("Server responded with:", error.response.data);
          console.error("Server responded with status:", error.response.status);
          console.error(
            "Server responded with headers:",
            error.response.headers
          );
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Error setting up the request:", error.message);
        }
      }
    };
    fetchMultipleAPis();
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("sidebar");
      const toggleButton = document.getElementById("sidebar-toggle");

      if (sidebar &&
        !sidebar.contains(event.target) &&
        toggleButton &&
        !toggleButton.contains(event.target) &&
        isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  console.log("Form Data:", organizationsList, solutionGroupList, priorityList, issueTypeList, activeUsersList);

  return (
    <div className="flex min-h-screen relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar - Hidden on mobile by default */}
      <div
        id="sidebar"
        className={`fixed md:static top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        <Sidebar />
      </div>

      <main className="flex-1 mx-4 md:mx-16">
        {/* Mobile Sidebar Toggle Button */}
        <button
          id="sidebar-toggle"
          className="md:hidden fixed top-4 left-4 z-40 bg-blue-600 text-white p-2 rounded-md"
          onClick={toggleSidebar}
        >
          ☰
        </button>

        <div className="p-4 md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-[39px] font-semibold">CREATE ISSUE</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Required fields are marked with an asterisk (*)
              </p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:gap-40 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-4">
                {/* <CreateIssuePageFormField
                  label="Number"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                /> */}
                <CreateIssuePageFormField
                  label="Requestor"
                  id="requestor"
                  name="requestor"
                  value={formData.requestor}
                  onChange={handleChange}
                />
                <CreateIssuePageFormField
                  label="Project"
                  id="project"
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  required
                />
                <CreateIssuePageFormField
                  label="Contact Mode"
                  id="contact_mode"
                  name="contact_mode"
                  value={formData.contact_mode}
                  options={contact_mode}
                  onChange={handleChange}
                   valueKey="value"
                  labelKey="label"
                  required
                />
                <CreateIssuePageSelectField
                  label="Impact"
                  id="impact"
                  name="impact"
                  value={formData.impact}
                  onChange={handleChange}
                  options={impactList}
                  valueKey="value"
                  labelKey="label"
                  required
                />
                <CreateIssuePageFormField
                  label="Customer Country"
                  id="customerCountry"
                  name="customerCountry"
                  value={formData.customerCountry}
                  onChange={handleChange}
                />
                <CreateIssuePageSelectField
                  label="Support Org Name"
                  id="supportOrgName"
                  name="supportOrgName"
                  value={formData.supportOrgName}
                  onChange={handleChange}
                  options={organizationsList}
                  valueKey="organisation_id"
                  labelKey="organisation_name"
                />
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <CreateIssuePageSelectField
                  label="Issue Type"
                  id="issue_type"
                  name="issue_type"
                  value={formData.issue_type}
                  onChange={handleChange}
                  options={issueTypeList}
                  valueKey="0"
                  labelKey="1"
                  required
                />
                <CreateIssuePageSelectField
                  label="Assignee"
                  id="assignee"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  options={activeUsersList}
                  valueKey="id"
                  labelKey="username"
                />
                <CreateIssuePageSelectField
                  label="Solution Group"
                  id="solutionGroup"
                  name="solutionGroup"
                  value={formData.solutionGroup}
                  onChange={handleChange}
                  options={solutionGroupList}
                  valueKey="solution_id"
                  labelKey="group_name"
                  required
                />
                <CreateIssuePageSelectField
                  label="Support Team"
                  id="supportTeam"
                  name="supportTeam"
                  value={formData.supportTeam}
                  onChange={handleChange}
                  options={supportTeamList}
                  valueKey="0"
                  labelKey="1"
                  required
                />
                <CreateIssuePageFormField
                  label="Reference Ticket"
                  id="referenceTicket"
                  name="referenceTicket"
                  value={formData.referenceTicket}
                  onChange={handleChange}
                />
                <CreateIssuePageFormField
                  label="Product"
                  id="product"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  required
                />
                {/* <CreateIssuePageFormField
                  label="Email"
                  id="emailAddresses"
                  name="emailAddresses"
                  data-index="0"
                  value={formData.emailAddresses[0]}
                  onChange={handleChange}
                /> */}
              </div>
            </div>

            {/* Summary and Description */}
            <CreateIssuePageFormField
              label="Summary"
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              required
              className="w-full"
            />
            <CreateIssuePageTextAreaField
              label="Description"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />

            {/* Submit Button Section */}
            <div className="flex justify-end gap-4">
              <button type="button" className="border p-2 rounded-md">
                Cancel
              </button>
              <button
                type="submit"
                className="border p-2 rounded-md bg-blue-600 text-white"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>
      <ChatbotPopup />
      <ToastContainer />
    </div>
  );
}
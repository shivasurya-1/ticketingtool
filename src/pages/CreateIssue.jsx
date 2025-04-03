"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChatbotPopup from "../components/ChatBot";
import { axiosInstance } from "../utils/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import CreateIssuePageFormField from "../components/common/CreateIssuePageFormField";
import CreateIssuePageTextAreaField from "../components/common/CreateIssuePageTextAreaField";
import CreateIssuePageSelectField from "../components/common/CreateIssuePageSelectField";
import CountryListSelect from "../components/common/CountryListSelectField";
import SearchableSelectField from "../components/common/SearchableSelectField";

export default function CreateIssue() {
  const [selected, setSelected] = useState("Comments");
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    // number: "",
    requestor: "",
    customerCountry: "",
    supportOrgName: "",
    assignee: "",
    solutionGroup: "",
    referenceTicket: [
      "ec3f3765-9125-4810-af62-f37b06d91dc7",
      "378d3065-aa1e-4ee2-a53e-1a4b5bdbdfdb",
    ],
    description: "",
    summary: "",
    issueType: "",
    impact: "",
    supportTeam: "",
    project: "",
    product: "",
    priority: "",
    contactMode: "",
    developerOrganization: "",
    contactNumber: "",
  });

  const [solutionGroupList, setSolutionGroupList] = useState([]);
  const [organizationsList, setOrganizationsList] = useState([]);
  const [supportTeamList, setSupportTeamList] = useState([]);
  const [issueTypeList, setIssueTypeList] = useState([]);
  const [activeUsersList, setActiveUsersList] = useState([]);
  const [impactList, setImpactList] = useState([]);
  const [contactModeList, setContactModeList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClick = (item) => {
    setSelected(item);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const convertFormDataToSnakeCase = (data) => ({
    assignee: data.assignee,
    summary: data.summary,
    description: data.description,
    issue_type: data.issueType,
    solution_grp: data.solutionGroup,
    reference_tickets: data.referenceTicket,
    impact: data.impact,
    support_team: data.supportTeam,
    project: data.project,
    product: data.product,
    customer_country: data.customerCountry,
    developer_organization: data.developerOrganization,
    contact_mode: data.contactMode,
    priority: data.priority,
    customer_number: data.contactNumber,
    // created_by: requestor: data.requestor,
  });

  const handleSubmit = async (e) => {
    const formDataInSnakeCase = convertFormDataToSnakeCase(formData);
    console.log("formDataInSnakeCase", formDataInSnakeCase);
    e.preventDefault();
    // Make sure all required fields are filled
    const requiredFields = [
      "issueType",
      "summary",
      "description",
      "impact",
      "supportTeam",
      "project",
      "product",
      "contactMode",
      "solutionGroup",
    ];

    const isValid = requiredFields.every((field) => formData[field]);

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
      const response = await axiosInstance.post(
        "/ticket/create/",
        formDataInSnakeCase,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(response);
      toast.success("Issue created successfully");
      setTimeout(
        () =>
          navigate(
            `/request-issue/application-support/sap/ticket-details/${response.data.ticket_id}`
          ),
        2100
      );
    } catch (error) {
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
        const [
          subGroupsList,
          orgList,
          choicesList,
          activeUsersList,
          priorityList,
        ] = await Promise.all([
          axiosInstance.get("solution_grp/create/", authHeaders),
          axiosInstance.get("org/organisation/", authHeaders),
          axiosInstance.get("ticket/ticket/choices/", authHeaders),
          axiosInstance.get("user/api/register/", authHeaders),
          axiosInstance.get("priority/priority/", authHeaders),
        ]);
        setSolutionGroupList(subGroupsList.data);
        setOrganizationsList(orgList.data);
        setIssueTypeList(choicesList.data.issue_type_choices);
        setSupportTeamList(choicesList.data.support_team_choices);
        setImpactList(choicesList.data.impact_choices);
        setContactModeList(choicesList.data.contact_mode_choices);
        setActiveUsersList(activeUsersList.data);
        setPriorityList(priorityList.data);
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

      if (
        sidebar &&
        !sidebar.contains(event.target) &&
        toggleButton &&
        !toggleButton.contains(event.target) &&
        isSidebarOpen
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  console.log("priorityList", priorityList);

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
        className={`fixed md:static top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
              <h1 className="text-2xl md:text-[39px] font-semibold">
                CREATE ISSUE
              </h1>
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
                <CreateIssuePageSelectField
                  label="Contact Mode"
                  id="contactMode"
                  name="contactMode"
                  value={formData.contactMode}
                  onChange={handleChange}
                  options={contactModeList}
                  valueKey="0"
                  labelKey="1"
                  required
                />
                {formData.contactMode === "phone" && (
                  <CreateIssuePageFormField
                    label="Contact Number"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber || ""}
                    onChange={handleChange}
                    required
                  />
                )}
                <CreateIssuePageSelectField
                  label="Impact"
                  id="impact"
                  name="impact"
                  value={formData.impact}
                  onChange={handleChange}
                  options={impactList}
                  valueKey="0"
                  labelKey="1"
                  required
                />
                <CreateIssuePageSelectField
                  label="Priority"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  options={priorityList}
                  valueKey="priority_id"
                  labelKey="urgency_name"
                  required
                />
                <CountryListSelect
                  label="Customer Country"
                  id="customerCountry"
                  name="customerCountry"
                  value={formData.customerCountry}
                  onChange={handleChange}
                  required
                />

                <CreateIssuePageSelectField
                  label="Support Org Name"
                  id="developerOrganization"
                  name="developerOrganization"
                  value={formData.developerOrganization}
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
                  id="issueType"
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  options={issueTypeList}
                  valueKey="0"
                  labelKey="1"
                  required
                />
                
                <SearchableSelectField
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

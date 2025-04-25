// MAIN APP JS FILE

import React from "react";
import { Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import ProtectedRoute from "./components/ProtectedRoute";
import UserSideLayout from "./layouts/UserSideLayout";
import MainLayout from "./layouts/MainLayout";

import LoginForm from "./components/auth/LoginForm";
import ForgotPassword from "./components/forgot-password/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import Register from "./components/auth/Register";

import Home from "./components/Home";
import Timeline from "./components/Timeline";
import Backlog from "./components/Backlog";
import CreateIssueForm from "./components/ticket/CreateIssuePage";
import Profile from "./pages/User/Profile";
import Catalog from "./pages/Catalog/RequestIssueCatalogPage";
import Details from "./pages/User/Tickets/TicketDetails";
import AssignedToMe from "./pages/User/Tickets/AssignedToMe";
import KnowledgeArticle from "./pages/KnowledgeArticle";
import Solution from "./pages/Solution";
import ListOfIncident from "./pages/ListOfIncident";
import Organisations from "./pages/Admin/Organisations";
import Priority from "./pages/Admin/Priority";
import Categorys from "./pages/Admin/Category";
import Roles from "./pages/Admin/Roles";
import SolutionGroup from "./pages/Admin/SolutionGropup";
import CreateIssueDetailPage from "./pages/User/Tickets/CreateIssueDetailsPage";
import ListAllTickets from "./pages/ListAllTickets";
import Dashboard from "./pages/User/Dashboard";
import { fetchUserDetails } from "./store/actions/userActions";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import MyTickets from "./pages/User/Tickets/MyTickets";
import OrganisationsTree from "./pages/Admin/OrgTree";
import ManageRoles from "./pages/Admin/ManageRoles";
import UserRoles from "./pages/Admin/UserRoles";
import Permissions from "./pages/Admin/Permissions";
import Employee from "./pages/Admin/Employee";
import DispatcherPage from "./pages/Dispatcher";
import ResolveIssue from "./pages/ResolveIssue";
import Projects from "./pages/Admin/Projects";
import GroupTickets from "./pages/GroupTickets";
import CreateIssue from "./pages/CreateIssue/CreateIssue";

const App = () => {
 const dispatch= useDispatch() 
  
  let accessToken =localStorage.getItem("access_token")
  useEffect(()=>{
    
        dispatch(fetchUserDetails(accessToken));
    
  },[accessToken])
  

  return (
    <div className="flex bg-[#E3E3E3] h-screen">
      <Analytics />
      <div className="flex-1 flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <UserSideLayout>
                <LoginForm />
              </UserSideLayout>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <UserSideLayout>
                <ForgotPassword />
              </UserSideLayout>
            }
          />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route
              path="/reset-password"
              element={
                <UserSideLayout>
                  <ResetPassword />
                </UserSideLayout>
              }
            />
            <Route
              path="/register"
              element={
                <UserSideLayout>
                  <Register />
                </UserSideLayout>
              }
            />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/backlog" element={<Backlog />} />
            <Route path="/create-issue" element={<CreateIssueForm />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-ticket" element={<CreateIssue />} />
            <Route path="/request-issue" element={<Catalog />} />
            
            <Route
              path="/request-issue/application-support/sap/create-issue"
              element={<CreateIssue />}
            />
            <Route
              path="/request-issue/application-support/sap/resolve-issue/:ticketId"
              element={<ResolveIssue />}
            />
            <Route
              path="/request-issue/application-support/sap/ticket-details/:ticketId"
              element={<CreateIssueDetailPage />}
            />
            <Route
              path="/request-issue/application-support/request-issue/application-support/details/:ticket_Id"
              element={<Details />}
            />
            <Route
              path="/request-issue/application-support/request-issue/application-support/assigned-me"
              element={<AssignedToMe />}
            />
            <Route
              path="/request-issue/application-support/request-issue/application-support/my-tickets"
              element={<MyTickets />}
            />
            <Route
              path="/request-issue/application-support/request-issue/application-support/knowledge-article"
              element={<KnowledgeArticle />}
            />
            <Route
              path="/request-issue/application-support/request-issue/application-support/details/:ticket_Id/solution"
              element={<Solution />}
            />
            <Route
              path="/request-issue/application-support/request-issue/application-support/list-of-incidents"
              element={<ListOfIncident />}
            />
            {/* New route added from second file */}
            <Route
              path="/request-issue/application-support/request-issue/application-support/Dashborad"
              element={<Dashboard />}
            />
             <Route
              path="/request-issue/application-support/request-issue/application-support/grouptickets"
              element={<GroupTickets />}
            />
            <Route path="/organisations" element={<Organisations />} />
            <Route path="/orgtree" element={<OrganisationsTree />} />
            <Route path="/manage-role" element={<ManageRoles/>} />
            <Route path="/user-role" element={<UserRoles />} />
            <Route path="/permission" element={<Permissions />} />
            <Route path="/employee" element={<Employee />} />
            <Route path="/priority" element={<Priority />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/category" element={<Categorys />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/solutionGrp" element={<SolutionGroup />} />
            <Route path="/tickets" element={<ListAllTickets />} />
            <Route path="/dispatcher" element={<DispatcherPage />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default App;
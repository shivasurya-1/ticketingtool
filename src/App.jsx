import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./store/Slices/auth/authenticationSlice";
import Timeline from "./components/Timeline";
import Backlog from "./components/Backlog";
import LoginForm from "./components/auth/LoginForm";
import CreateIssueForm from "./components/ticket/CreateIssuePage";
import TopNavbar from "./components/TopNavbar";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./components/ticket/TicketDashboard";
import YourWork from "./components/ticket/YourWork";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import ForgotPassword from "./components/forgot-password/ForgotPassword";
import UserSideLayout from "./layouts/UserSideLayout";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import SideBarItems from "./components/SideBarItems";
import MainHomeContent from "./components/MainHomeContent";
import Request from "./pages/Request";
import Application from "./pages/Application";
import CreateIssue from "./pages/CreateIssue";
import { Analytics } from "@vercel/analytics/react";
import Details from "./pages/Details";
import AssignedMe from "./pages/AssignedMe";
import KnowledgeArticle from "./pages/KnowledgeArticle";
import Solution from "./pages/Solution";
import ListOfIncident from "./pages/ListOfIncident";
import ChatbotPopup from "./components/ChatBot";
import Organisations from "./pages/Organisations";
import Priority from "./pages/Priority";
import Categorys from "./pages/Category";
import Roles from "./pages/Roles";
import SolutionGroup from "./pages/SolutionGropup";
import Register from "./components/auth/Register";
import Profile from "./pages/Profile";

const App = () => {
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.authentication.isAuthenticated);
  const dispatch = useDispatch();
  const hideNavbarRoutes = ["/login", "/forgot-password", "/register"];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  const navItems = [
    { name: "My Actions", path: "/actions" },
    { name: "Helpful Links", path: "/links" },
    { name: "Other Portals", path: "/portals" },
    isAuthenticated
      ? { name: "Logout", path: "/login", action: () => dispatch(logout()) }
      : { name: "Login", path: "/login" },
  ];

  return (
    <div className="flex bg-[#E3E3E3] h-screen">
      <Analytics />
      <div className="flex-1 flex flex-col">
        {showNavbar && <Navbar navItems={navItems} />}
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
          <Route
            path="/register"
            element={
              <UserSideLayout>
                <Register />
              </UserSideLayout>
            }
          />

          {/* Protected Routes */}
          {/* <Route element={<ProtectedRoute />}> */}
            
            <Route
              path="/create-issue"
              element={
                <MainLayout>
                  <CreateIssueForm />
                </MainLayout>
              }
            />
            <Route path="/home" element={<Home />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/backlog" element={<Backlog />} />
            <Route path="/create-ticket" element={<CreateIssue />} />
            <Route path="/request-issue" element={<Request />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/request-issue/application-support"
              element={<Application />}
            />
            <Route
              path="/request-issue/application-support/request-issue/application-support/create-issue"
              element={<CreateIssue />}
            />
            <Route
              path="/request-issue/application-support/request-issue/application-support/details/:ticket_Id"
              element={<Details />}
            />
            <Route
              path="/request-issue/application-support/request-issue/application-support/assigned-me"
              element={<AssignedMe />}
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
            <Route path="/organisations" element={<Organisations />} />
            <Route path="/priority" element={<Priority />} />
            <Route path="/category" element={<Categorys />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/solutionGrp" element={<SolutionGroup />} />
            <Route path="*" element={<Home />} />
          {/* </Route> */}
        </Routes>
      </div>
    </div>
  );
};

export default App;
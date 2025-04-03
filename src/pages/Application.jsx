import React from "react";
import { ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ChatbotPopup from "../components/ChatBot";
import {
  sapImage,
  dataAnalyticsImage,
  microsoftImage,
  oracleImage,
  hrmsImage,
} from "../assets/assets.js";

const serviceCategories = [
  {
    title: "SAP",
    description:
      "Raise a ticket for SAP-related issues, including login problems, system errors, configuration support, or access requests.",
    icon: <img src={sapImage} alt="SAP" className="w-10 h-10 text-black" />,
    link: "sap/create-issue",
  },
  {
    title: "Data Analytics",
    description:
      "Report issues related to data visualization, reporting tools, dashboards, or data processing errors in analytics platforms.",
    icon: <img src={dataAnalyticsImage} alt="DATA ANALYTICS" className="w-10 h-10 text-black" />,
    link: "/home",
  },
  {
    title: "Microsoft",
    description:
      "Seek support for Microsoft applications such as Office 365, Teams, Outlook, SharePoint, or Windows system-related issues.",
    icon: <img src={microsoftImage} alt="MICROSOFT" className="w-10 h-10 text-black" />,
    link: "/home",
  },
  {
    title: "Oracle",
    description:
      "Request assistance for Oracle database issues, ERP solutions, access management, or troubleshooting Oracle-based applications.",
    icon: <img src={oracleImage} alt="ORACLE" className="w-14 h-4 text-black" />,
    link: "/home",
  },
  {
    title: "HRMS",
    description:
      "Raise a request for HRMS-related concerns, including employee records. leave management, payroll integration, or system access.",
    icon: <img src={hrmsImage} alt="HRMS" className="w-10 h-10 text-black" />,
    link: "/home",
  },
];

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6 } },
  exit: { opacity: 0 },
};

const breadcrumbVariants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
};

const gridVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.5,
    },
  },
};

const cardVariants = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  hover: { y: -5, transition: { duration: 0.2 } },
};

// ServiceCard with navigation
const ServiceCard = ({ title, description, icon, link }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="relative bg-[#1a4789] rounded-lg p-6 text-white shadow-xl shadow-black/40 cursor-pointer mt-12"
      onClick={() => navigate(link)} // Navigation on click
    >
      <motion.div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg shadow-black/60">
        {icon}
      </motion.div>
      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-center mb-4 p-2 pt-4">
          {title}
        </h3>
        <p className="text-center text-white mx-5">{description}</p>
      </div>
    </motion.div>
  );
};

const Application = () => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="mx-40 p-8"
    >
      {/* Breadcrum */}
      <motion.nav
        variants={breadcrumbVariants}
        initial="initial"
        animate="animate"
        className="mb-8"
      >
        <div className="flex items-center font-bold text-[#224D86]">
          <Link to="/" className="hover:text-blue-600">
            <motion.div whileHover={{ scale: 1.05 }}>Home</motion.div>
          </Link>
          <ChevronRight className="mx-2 w-4 h-4" />
          <Link to="/request-issue" className="hover:text-blue-600">
            <motion.div whileHover={{ scale: 1.05 }}>
              Request an Issue
            </motion.div>
          </Link>
          <ChevronRight className="mx-2 w-4 h-4" />
          <span className="text-gray-600">Application Support</span>
        </div>
      </motion.nav>

      <motion.div
        variants={gridVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 mt-16 mx-16 place-items-center"
      >
        {serviceCategories.map((category, index) => (
          <ServiceCard key={index} {...category} />
        ))}
      </motion.div>
      <ChatbotPopup />
    </motion.div>
  );
};

export default Application;

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChatbotPopup from '../components/ChatBot';
import appSupportImage from "../assets/applications_support_image.png"
import itImage from "../assets/infrastructure_support_image.png"
import softwareLicenses from "../assets/software_license_image.png"
import itAssets from "../assets/it_asset_management_image.png"
import payroll from "../assets/payroll_image.png"
import fieldServiceImage from "../assets/field_service_agent_image.png"

// Ensure useNavigate hook is used correctly
const RequestIssuePage = () => {
  const navigate = useNavigate();  // Correct usage of useNavigate hook

  const serviceCategories = [
    {
      title: 'Applications Support',
      description:
        "If you are experiencing issues with business applications such as login problems, errors, or functionality concerns, raise a ticket here for assistance." ,
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-16 h-16 text-blue-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {/* <rect x="2" y="3" width="20" height="14" rx="2" />4 */}
          <image href={appSupportImage} x="2" y="3" width="20" height="20" />
        
        </svg>
      ),
      link: '/request-issue/application-support',
    },
    {
      title: 'IT Infrastructure Support',
      description:
        'Use this option to report issues related to servers, networks, VPN access, email services, or other IT infrastructure components.',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-16 h-16 text-blue-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {/* <path d="M22 12h-4l-3 9L9 3l-3 9H2" /> */}
          <image href={itImage} x="2" y="3" width="20" height="20" />
        </svg>
      ),
      link: '/request-issue/it-infrastructure-support',
    },
    {
      title: 'Software Licenses',
      description:
        'Request new software licenses, renew existing ones, or report issues related to license activation and compliance.',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-16 h-16 text-blue-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {/* <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M8 12h8" />
          <path d="M12 8v8" /> */}
          <image href={softwareLicenses} x="2" y="3" width="20" height="20" />
        </svg>
      ),
      link: '/request-issue/software-licenses',
    },
    {
      title: 'IT Assets',
      description:
        'Raise a request for new IT hardware, report hardware malfunctions, or request upgrades for company-provided devices.',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-16 h-16 text-blue-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {/* <path d="M20 7h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" /> */}
          <image href={itAssets} x="2" y="3" width="20" height="20" />
        </svg>
      ),
      link: '/request-issue/it-assets',
    },
    {
      title: 'Payroll',
      description:
        'If you have concerns regarding salary payments, tax deductions, payslips, or payroll discrepancies, submit a ticket for HR assistance.',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-16 h-16 text-blue-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {/* <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" /> */}
          <image href={payroll} x="2" y="3" width="20" height="20" />
        </svg>
      ),
      link: '/request-issue/payroll',
    },
    {
      title: 'Field Service Agent',
      description:
        'Request on-site IT support for hardware installations, maintenance, or troubleshooting at your workplace.',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-16 h-16 text-blue-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {/* <circle cx="12" cy="7" r="4" />
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> */}
          <image href={fieldServiceImage} x="2" y="3" width="20" height="20" />
        </svg>
      ),
      link: '/request-issue/field-service-agent',
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
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    hover: { y: -5, transition: { duration: 0.2 } },
  };

  const ServiceCard = ({ title, description, icon, link }) => (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="relative bg-[#1a4789] rounded-lg p-6 text-white shadow-xl shadow-black/40 cursor-pointer mt-12"
      onClick={() => navigate(link)} // Corrected the onClick handler
    >
      <motion.div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg shadow-black/60">
        {icon}
      </motion.div>
      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-center mb-4 p-2 pt-4">{title}</h3>
        <p className="text-center text-white mx-5">{description}</p>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="mx-40 p-8"
    >
      {/* Breadcrumb */}
      <motion.nav variants={breadcrumbVariants} initial="initial" animate="animate" className="mb-8">
        <div className="flex items-center font-bold text-[#224D86]">
          <Link to="/" className="hover:text-blue-600">
            <motion.div whileHover={{ scale: 1.05 }}>Home</motion.div>
          </Link>
          <ChevronRight className="mx-2 w-4 h-4" />
          <span className="text-gray-600">Request an Issue</span>
        </div>
      </motion.nav>

      {/* Service Cards Grid */}
      <motion.div
        variants={gridVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 mt-16 mx-16"
      >
        {serviceCategories.map((category, index) => (
          <ServiceCard key={index} {...category} />
        ))}
      </motion.div>
      <ChatbotPopup/>
    </motion.div>
  );
};

export default RequestIssuePage;

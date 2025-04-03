import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChatbotPopup from '../components/ChatBot';
import {
  appSupportImage,
  itImage,
  softwareLicenses,
  itAssets,
  payroll,
  fieldServiceImage,
} from "../assets/assets.js";

// Ensure useNavigate hook is used correctly
const RequestIssuePage = () => {
  const navigate = useNavigate();  // Correct usage of useNavigate hook

  const serviceCategories = [
    {
      title: 'Applications Support',
      description:
        'If you are experiencing issues with business applications such as login problems, errors, or functionality concerns, raise a ticket here for assistance.',
      icon: <img src={appSupportImage} alt="SAP" className="w-10 h-10 text-black" />,
      link: '/request-issue/application-support',
    },
    {
      title: 'IT Infrastructure Support',
      description:
        'Use this option to report issues related to servers, networks, VPN access, email services, or other IT infrastructure components.',
      icon: <img src={itImage} alt="SAP" className="w-10 h-10 text-black" />,
      link: '/request-issue/it-infrastructure-support',
    },
    {
      title: 'Software Licenses',
      description:
        'Request new software licenses, renew existing ones, or report issues related to license activation and compliance.',
      icon: <img src={softwareLicenses} alt="SAP" className="w-10 h-10 text-black" />,
      link: '/request-issue/software-licenses',
    },
    {
      title: 'IT Assets',
      description:
        'Raise a request for new IT hardware, report hardware malfunctions, or request upgrades for company-provided devices.',
      icon: <img src={itAssets} alt="SAP" className="w-10 h-10 text-black" />,
      link: '/request-issue/it-assets',
    },
    {
      title: 'Payroll',
      description:
        'If you have concerns regarding salary payments, tax deductions, payslips, or payroll discrepancies, submit a ticket for HR assistance.',
      icon: <img src={payroll} alt="SAP" className="w-10 h-10 text-black" />,
      link: '/request-issue/payroll',
    },
    {
      title: 'Field Service Agent',
      description:
        'Request on-site IT support for hardware installations, maintenance, or troubleshooting at your workplace.',
      icon: <img src={fieldServiceImage} alt="SAP" className="w-10 h-10 text-black" />,
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

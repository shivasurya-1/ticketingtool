import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChatbotPopup from '../components/ChatBot';

const serviceCategories = [
    {
        title: 'SAP',
        description: 'Lorem ipsum dolor sit amet. Et adipisci officia et nobis iure id voluptates saepe aut iste saepe non tenetur dolores non similique quibusdam.',
        icon: (
            <svg viewBox="0 0 24 24" className="w-16 h-16 text-black" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
            </svg>
        ),
        link: "request-issue/application-support/create-issue"
    },
    {
        title: 'Data Analytics',
        description: 'Lorem ipsum dolor sit amet. Et adipisci officia et nobis iure id voluptates saepe aut iste saepe non tenetur dolores non similique quibusdam.',
        icon: (
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        ),
        link: "request-issue/data-analytics/create-issue"
    },
    {
        title: 'Microsoft',
        description: 'Lorem ipsum dolor sit amet. Et adipisci officia et nobis iure id voluptates saepe aut iste saepe non tenetur dolores non similique quibusdam.',
        icon: (
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
            </svg>
        ),
        link: "request-issue/microsoft/create-issue"
    },
    {
        title: 'Oracle',
        description: 'Lorem ipsum dolor sit amet. Et adipisci officia et nobis iure id voluptates saepe aut iste saepe non tenetur dolores non similique quibusdam.',
        icon: (
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" />
            </svg>
        ),
        link: "request-issue/oracle/create-issue"
    },
    {
        title: 'HRMS',
        description: 'Lorem ipsum dolor sit amet. Et adipisci officia et nobis iure id voluptates saepe aut iste saepe non tenetur dolores non similique quibusdam.',
        icon: (
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
            </svg>
        ),
        link: "request-issue/hrms/create-issue"
    }
];

const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6 } },
    exit: { opacity: 0 }
};

const breadcrumbVariants = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.5, delay: 0.2 } }
};

const gridVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
            delayChildren: 0.5
        }
    }
};

const cardVariants = {
    initial: { y: 20, opacity: 0 },
    animate: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: { y: -5, transition: { duration: 0.2 } }
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
            <motion.div
                className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg shadow-black/60"
            >
                {icon}
            </motion.div>
            <div className="mt-8">
                <h3 className="text-2xl font-semibold text-center mb-4 p-2 pt-4">{title}</h3>
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
                        <motion.div whileHover={{ scale: 1.05 }}>Request an Issue</motion.div>
                    </Link>
                    <ChevronRight className="mx-2 w-4 h-4" />
                    <span className="text-gray-600">Request an Issue</span>
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
            <ChatbotPopup/>

        </motion.div>
    );
};

export default Application;

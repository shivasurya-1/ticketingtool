import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../utils/axiosInstance';
import { useParams, useNavigate } from "react-router-dom";

// Enhanced SLA Timer Component with Ticket ID Display
const SLATimer = ({ 
  initialData = null,
  style = 'standard', // 'standard' or 'compact'
  showLabel = true,
  showTicketId = true, // New prop to control ticket ID visibility
  className = '',
  refreshInterval = 60000 // Refresh SLA data every minute by default
}) => {
  // Move useParams() inside the component
  const { ticketId } = useParams();
  const [slaData, setSlaData] = useState(initialData);
  const [loading, setLoading] = useState(initialData === null);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({ 
    hours: 0, 
    minutes: 0, 
    seconds: 0, 
    totalSeconds: 0, 
    breached: false 
  });

  // Function to fetch SLA data for the ticket
  const fetchSlaData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.get(`/ticket/sla-timers/${ticketId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSlaData(response.data);
      setError(null);
      return response.data;
    } catch (error) {
      console.error(`Error fetching SLA data for ticket ${ticketId}:`, error);
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch SLA data on component mount and at specified intervals
  useEffect(() => {
    if (!initialData) {
      fetchSlaData();
    }

    // Set up periodic refresh of SLA data
    const dataRefreshInterval = setInterval(() => {
      fetchSlaData();
    }, refreshInterval);

    return () => clearInterval(dataRefreshInterval);
  }, [ticketId, refreshInterval]);

  // Calculate and update time remaining every second
  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!slaData || !slaData.sla_due_date) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, breached: false });
        return;
      }

      const now = new Date();
      const due = new Date(slaData.sla_due_date);
      const diffMs = due - now;

      if (diffMs <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, breached: true });
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeRemaining({ hours, minutes, seconds, totalSeconds, breached: false });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Then set up interval
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [slaData]);

  // Render ticket ID component
  const renderTicketId = () => {
    if (!showTicketId) return null;
    
    return (
      <div className="flex items-center mr-3">
        <span className="text-xs text-gray-500 mr-1">Ticket:</span>
        <span className="text-sm font-medium">{ticketId}</span>
      </div>
    );
  };

  // Handle loading state
  if (loading && !slaData) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-2"></div>
        <span className="text-sm text-gray-500">Loading SLA...</span>
      </div>
    );
  }

  // Handle error state
  if (error && !slaData) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {showTicketId && renderTicketId()}
        <div className="text-red-500 text-sm">SLA data unavailable</div>
      </div>
    );
  }

  // Standard style timer
  const renderStandardTimer = () => {
    const timerContent = timeRemaining.breached ? (
      <div className="text-red-600 font-medium">SLA Breached</div>
    ) : (
      <div className="flex items-center gap-1">
        {showLabel && <span className="text-gray-600">SLA:</span>}
        <div className="flex gap-1">
          <span className="font-medium">{timeRemaining.hours}</span>
          <span className="text-xs text-gray-500 self-end mb-0.5">h</span>
          <span className="font-medium">{String(timeRemaining.minutes).padStart(2, '0')}</span>
          <span className="text-xs text-gray-500 self-end mb-0.5">m</span>
          <span className="font-medium">{String(timeRemaining.seconds).padStart(2, '0')}</span>
          <span className="text-xs text-gray-500 self-end mb-0.5">s</span>
        </div>
      </div>
    );

    return (
      <div className={`flex items-center ${className}`}>
        {showTicketId && renderTicketId()}
        {timerContent}
      </div>
    );
  };

  // Compact style timer
  const renderCompactTimer = () => {
    const timerContent = timeRemaining.breached ? (
      <div className="inline-block px-2 py-1 bg-red-100 text-red-600 rounded font-medium text-sm">
        Breached
      </div>
    ) : (
      <div className="inline-flex items-center">
        {showLabel && <span className="text-xs text-gray-500 mr-1">SLA</span>}
        <div className={`px-2 py-0.5 rounded font-mono text-sm ${getColorClass()}`}>
          {formatTime()}
        </div>
      </div>
    );

    return (
      <div className={`flex items-center ${className}`}>
        {showTicketId && renderTicketId()}
        {timerContent}
      </div>
    );
  };

  // Helper function to determine color class based on time remaining
  const getColorClass = () => {
    if (timeRemaining.totalSeconds < 1800) { // Less than 30 min
      return 'bg-red-100 text-red-600';
    } else if (timeRemaining.totalSeconds < 3600) { // Less than 1 hour
      return 'bg-yellow-100 text-yellow-600';
    }
    return 'bg-green-100 text-green-600'; // Default: lots of time
  };

  // Helper function to format time
  const formatTime = () => {
    return `${String(timeRemaining.hours).padStart(2, '0')}:${String(timeRemaining.minutes).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}`;
  };

  return style === 'standard' ? renderStandardTimer() : renderCompactTimer();
};

export default SLATimer;
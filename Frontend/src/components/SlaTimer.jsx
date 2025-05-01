import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../utils/axiosInstance';
import { useParams } from "react-router-dom";

const SLATimer = ({
  initialData = null,
  style = 'standard',
  showLabel = true,
  showTicketId = true,
  className = '',
  refreshInterval = 60000
}) => {
  const { ticketId } = useParams();
  const [status, setStatus] = useState(null);
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
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  // Add a local tracker for pause time that might not be reflected in the backend yet
  const [localPauseTracker, setLocalPauseTracker] = useState({
    wasInPausedState: false,
    pauseStartTime: null,
    accumulatedLocalPausedTime: 0
  });

  const parsePausedTime = (pausedTimeStr) => {
    if (!pausedTimeStr || typeof pausedTimeStr !== 'string') return 0;
  
    let days = 0, hours = 0, minutes = 0, seconds = 0;
  
    // Check if it includes "day"
    if (pausedTimeStr.includes('day')) {
      const [dayPart, timePart] = pausedTimeStr.split(',').map(str => str.trim());
  
      // Extract days
      const dayMatch = dayPart.match(/(\d+)\s+days?/i);
      if (dayMatch) {
        days = parseInt(dayMatch[1], 10);
      }
  
      // Extract hours, minutes, seconds
      if (timePart) {
        const timeParts = timePart.split(':').map(Number);
        if (timeParts.length === 3) {
          hours = timeParts[0];
          minutes = timeParts[1];
          seconds = parseFloat(timeParts[2]);
        }
      }
    } else {
      // No "days" part, just time
      const timeParts = pausedTimeStr.split(':').map(Number);
      if (timeParts.length === 3) {
        hours = timeParts[0];
        minutes = timeParts[1];
        seconds = parseFloat(timeParts[2]);
      } else if (timeParts.length === 2) {
        minutes = timeParts[0];
        seconds = parseFloat(timeParts[1]);
      } else if (timeParts.length === 1) {
        seconds = parseFloat(timeParts[0]);
      }
    }
  
    const totalMilliseconds = (
      (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000
    );
  
    return isNaN(totalMilliseconds) ? 0 : totalMilliseconds;
  };

  const fetchSlaData = async (isInitialLoad = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.get(`/ticket/sla-timers/${ticketId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setSlaData(response.data);
      
      // Track status change to handle pause/resume
      const newStatus = response.data.sla_status;
      const oldStatus = status;
      setStatus(newStatus);
      
      // Handle status transitions for local pause tracking
      if (oldStatus === 'Paused' && newStatus !== 'Paused') {
        // Just unpaused - add accumulated pause time
        if (localPauseTracker.pauseStartTime) {
          const pauseDuration = Date.now() - localPauseTracker.pauseStartTime;
          setLocalPauseTracker(prev => ({
            wasInPausedState: false,
            pauseStartTime: null,
            accumulatedLocalPausedTime: prev.accumulatedLocalPausedTime + pauseDuration
          }));
        }
      } else if (oldStatus !== 'Paused' && newStatus === 'Paused') {
        // Just paused - start tracking
        setLocalPauseTracker(prev => ({
          wasInPausedState: true,
          pauseStartTime: Date.now(),
          accumulatedLocalPausedTime: prev.accumulatedLocalPausedTime
        }));
      } else if (newStatus === 'Resolved' || newStatus === 'Closed' || newStatus === 'Cancelled') {
        // Reset local tracking on terminal states
        setLocalPauseTracker({
          wasInPausedState: false,
          pauseStartTime: null,
          accumulatedLocalPausedTime: 0
        });
      }
      
      setError(null);
      
      // Update lastRefreshTime
      setLastRefreshTime(Date.now());
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching SLA data for ticket ${ticketId}:`, error);
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchSlaData(true);
    } else if (initialData.sla_status) {
      setStatus(initialData.sla_status);
      setSlaData(initialData);
    }

    const dataRefreshInterval = setInterval(() => {
      fetchSlaData(false);
    }, refreshInterval);

    return () => clearInterval(dataRefreshInterval);
  }, [ticketId, refreshInterval, initialData]);

  // Calculate the SLA due date if not provided
  const calculateDueDate = (data) => {
    if (!data || !data.start_time) return null;
    
    // If due date is explicitly provided, use it
    if (data.sla_due_date) return new Date(data.sla_due_date);
    
    // Otherwise, assume a default SLA of 24 hours from start time
    // You should replace this with your actual SLA duration logic
    const defaultSlaDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const startTime = new Date(data.start_time);
    
    // Add SLA duration to start time
    const calculatedDueDate = new Date(startTime.getTime() + defaultSlaDuration);
    
    return calculatedDueDate;
  };

  useEffect(() => {
    // We don't need to calculate time if ticket is resolved, closed, or cancelled
    if (status === 'Resolved' || status === 'Closed' || status === 'Cancelled') {
      return;
    }
    
    // Calculate time remaining
    const calculateTimeRemaining = () => {
      if (!slaData || !slaData.start_time) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, breached: false });
        return;
      }

      const now = new Date();
      const dueDate = calculateDueDate(slaData);
      
      if (!dueDate) {
        console.error("Could not calculate due date from SLA data:", slaData);
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, breached: false });
        return;
      }
      
      // First, calculate basic time difference
      let diffMs = dueDate - now;
      
      // Handle current pause if applicable
      if (status === 'Paused' && slaData.paused_time) {
        const pauseStartTime = new Date(slaData.paused_time);
        // Add the current pause duration
        const currentPauseDuration = now - pauseStartTime;
        diffMs += currentPauseDuration;
        console.log("Current pause duration (ms):", currentPauseDuration);
      }
      
      // Add historically accumulated paused time from the backend
      if (slaData.total_paused_time) {
        const historicalPausedMs = parsePausedTime(slaData.total_paused_time);
        diffMs += historicalPausedMs;
        console.log("Historical paused time from backend (ms):", historicalPausedMs);
      }
      
      // Add our locally tracked pause time that may not be reflected in the backend yet
      if (localPauseTracker.accumulatedLocalPausedTime > 0) {
        diffMs += localPauseTracker.accumulatedLocalPausedTime;
        console.log("Local tracked paused time (ms):", localPauseTracker.accumulatedLocalPausedTime);
      }
      
      // If we're currently in paused state but not captured in the backend yet
      if (status === 'Paused' && localPauseTracker.pauseStartTime && !slaData.paused_time) {
        const currentLocalPauseDuration = now - localPauseTracker.pauseStartTime;
        diffMs += currentLocalPauseDuration;
        console.log("Current local pause duration (ms):", currentLocalPauseDuration);
      }
      
      console.log("Final time diff (ms):", diffMs);

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

    // Calculate time once initially
    calculateTimeRemaining();
    
    // Set up interval for updates
    const intervalId = setInterval(calculateTimeRemaining, 1000);
    
    // Clear interval on cleanup
    return () => clearInterval(intervalId);
  }, [slaData, status, localPauseTracker]);

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

  // For debugging - log the current SLA data
  console.log("Current SLA data:", slaData);
  console.log("Current status:", status);
  console.log("Current time remaining:", timeRemaining);
  console.log("Local pause tracker:", localPauseTracker);

  // Handle resolved, closed, or cancelled status
  const isTerminalState = status === 'Resolved' || status === 'Closed' || status === 'Cancelled';
  
  // Standard style timer
  const renderStandardTimer = () => {
    // Handle terminal states (resolved, closed, cancelled)
    if (isTerminalState) {
      return (
        <div className={`flex items-center ${className}`}>
          {showTicketId && renderTicketId()}
          <div className="text-gray-600 font-medium">{status}</div>
        </div>
      );
    }

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
        {status === 'Paused' && (
          <div className="text-blue-600 font-medium mr-2">Paused</div>
        )}
        {timerContent}
      </div>
    );
  };

  // Compact style timer
  const renderCompactTimer = () => {
    // Handle terminal states (resolved, closed, cancelled)
    if (isTerminalState) {
      return (
        <div className={`flex items-center ${className}`}>
          {showTicketId && renderTicketId()}
          <div className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded font-medium text-sm">
            {status}
          </div>
        </div>
      );
    }

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
        {status === 'Paused' && (
          <div className="inline-block px-2 py-1 bg-blue-100 text-blue-600 rounded font-medium text-sm mr-2">
            Paused
          </div>
        )}
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
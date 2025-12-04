import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getRateLimitStatus } from '../utils/githubApi';
import './APIStatus.css';

const APIStatus = ({ showAlways = false }) => {
  const [rateLimitInfo, setRateLimitInfo] = useState({
    remaining: 60,
    limit: 60,
    resetTime: new Date()
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Update rate limit info periodically
    const updateRateLimit = () => {
      const status = getRateLimitStatus();
      setRateLimitInfo(status);
      
      // Show component when rate limit is low or when forced to show always
      setIsVisible(showAlways || status.remaining < 30);
    };

    updateRateLimit();
    
    // Update every 30 seconds
    const interval = setInterval(updateRateLimit, 30000);
    
    return () => clearInterval(interval);
  }, [showAlways]);

  if (!isVisible) return null;

  const isLowRemaining = rateLimitInfo.remaining < 10;
  const isCritical = rateLimitInfo.remaining < 5;

  return (
    <div className={`api-status ${isCritical ? 'critical' : isLowRemaining ? 'warning' : 'normal'}`}>
      <div className="api-status-content">
        <div className="api-status-header">
          <span className="api-status-icon">
            {isCritical ? '!' : isLowRemaining ? '⚠' : 'ℹ'}
          </span>
          <span className="api-status-title">
            GitHub API Status
          </span>
        </div>
        
        <div className="api-status-details">
          <div className="api-status-text">
            <span className="api-requests-remaining">
              {rateLimitInfo.remaining}/{rateLimitInfo.limit} requests remaining
            </span>
            
            {isLowRemaining && (
              <span className="api-reset-time">
                Resets at {rateLimitInfo.resetTime.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {isCritical && (
        <div className="api-status-warning">
          API rate limit reached. Some features may be temporarily unavailable, aside from recently cached profiles.
        </div>
      )}
    </div>
  );
};

APIStatus.propTypes = {
  showAlways: PropTypes.bool
};

export default APIStatus;

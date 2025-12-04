import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="spinner-wrapper">
          <div className="spinner">
            <div className="spinner-inner">
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
            </div>
          </div>
        </div>
        
        <div className="loading-text">
          <h3>Fetching Repositories</h3>
          <p>Analyzing GitHub timeline data...</p>
          
          <div className="loading-steps">
            <div className="step active">
              <span className="step-icon">🔍</span>
              <span className="step-text">Validating user</span>
            </div>
            <div className="step active">
              <span className="step-icon">📦</span>
              <span className="step-text">Fetching repositories</span>
            </div>
            <div className="step">
              <span className="step-icon">📊</span>
              <span className="step-text">Building timeline</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="loading-footer">
        <p>This may take a few seconds (or more!) for users with many repositories</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;

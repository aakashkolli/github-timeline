import React from 'react';
import PropTypes from 'prop-types';
import { LanguageIcon } from '../utils/languageIcons';
import '../main.css';

export const StatItem = ({ value, label }) => {
  const formattedValue =
    typeof value === 'number'
      ? value.toLocaleString()
      : value;
  return (
    <div className="stat-item">
      <div className="stat-value">{formattedValue}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};
StatItem.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
};

export const LanguagePill = ({ language }) => (
  <div className="language-pill">
    <LanguageIcon language={language} />
    <span className="language-name">{language}</span>
  </div>
);
LanguagePill.propTypes = {
  language: PropTypes.string.isRequired,
};

export const LoadingSpinner = () => (
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
      </div>
    </div>
  </div>
);

export const ErrorMessage = ({ error, username, onRetry }) => {
  const getErrorIcon = (errorType) => {
    switch (errorType) {
      case 'user_not_found':
        return '🔍';
      case 'rate_limit':
        return '⏱️';
      case 'network_error':
        return '🌐';
      case 'server_error':
        return '🔧';
      case 'no_repos':
        return '📦';
      default:
        return '⚠️';
    }
  };
  return (
    <div className="error-message">
      <span className="error-icon">{getErrorIcon(error?.type)}</span>
      <div className="error-details">
        <h3>Error</h3>
        <p>{error?.message}</p>
        {username && <p>User: <strong>{username}</strong></p>}
        {onRetry && <button onClick={onRetry}>Retry</button>}
      </div>
    </div>
  );
};
ErrorMessage.propTypes = {
  error: PropTypes.object,
  username: PropTypes.string,
  onRetry: PropTypes.func,
};

import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ error, username, onRetry }) => {

  const getErrorTitle = (errorType) => {
    switch (errorType) {
      case 'user_not_found':
        return 'User Not Found';
      case 'rate_limit':
        return 'Rate Limit Exceeded';
      case 'network_error':
        return 'Network Error';
      case 'server_error':
        return 'Server Error';
      case 'no_repos':
        return 'No Repositories';
      default:
        return 'Something Went Wrong';
    }
  };

  const getSuggestion = (errorType, error) => {
    switch (errorType) {
      case 'user_not_found':
        return 'Check the username and try again.';
      case 'rate_limit':
        return (
          <>
            <p>
              You have reached the GitHub API rate limit.
              Please try again later.
            </p>
          </>
        );
      case 'network_error':
        return 'Check your internet connection and try again.';
      case 'server_error':
        return 'Server error. Please try again later.';
      case 'no_repos':
        return 'This user has no public repositories.';
      default:
        return 'Please try again or contact support if the issue persists.';
    }
  };

  const errorType = typeof error === 'object' ? error.type : 'generic';
  // errorMessage variable removed (no longer used)

  return (
    <div className="error-container minimal-error">
      <div className="error-content">
        <div className="error-details">
          <h3 className="error-title minimal-error-title">
            {getErrorTitle(errorType)}
          </h3>
          <p className="error-message minimal-error-message">
            {getSuggestion(errorType, error)}
          </p>
          {errorType === 'rate_limit' && (
            <div className="minimal-error-info">
              <span className="minimal-error-red">API requests are temporarily limited.</span><br />
              {error?.rateLimit && (
                <>
                  <span className="minimal-error-status">
                    Limit: {error.rateLimit.limit} {error.rateLimit.authenticated ? '(authenticated)' : '(unauthenticated)'}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;

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
        return 'Double-check the username spelling or try a different user.';
      case 'rate_limit':
        const isAuthenticated = error?.rateLimit?.authenticated;
        const limit = error?.rateLimit?.limit;
        let suggestion = 'GitHub API rate limits have been reached. ';
        
        if (!isAuthenticated) {
          suggestion += 'The server is making unauthenticated requests (60 requests/hour limit). ';
          suggestion += 'Please wait 15-60 minutes before trying again.';
        } else {
          suggestion += `Even with authentication (${limit} limit), the rate limit has been exceeded. `;
          suggestion += 'Please wait a few minutes before making more requests.';
        }
        
        return suggestion;
      case 'network_error':
        return 'Check your internet connection and try again.';
      case 'server_error':
        return 'Our servers are experiencing issues. Please try again later.';
      case 'no_repos':
        return 'This user might have only private repositories or none at all.';
      default:
        return 'Please try again or contact support if the issue persists.';
    }
  };

  const errorType = typeof error === 'object' ? error.type : 'generic';
  const errorMessage = typeof error === 'object' ? error.message : error;

  return (
    <div className="error-container">
      <div className="error-content">

        
        <div className="error-details">
          <h3 className="error-title">
            {getErrorTitle(errorType)}
          </h3>
          
          <p className="error-message">
            {errorMessage}
          </p>
          
          <p className="error-suggestion">
            {getSuggestion(errorType, error)}
          </p>

          {/* Show additional suggestions from server */}
          {error?.suggestions && error.suggestions.length > 0 && (
            <div className="server-suggestions">
              <h5>Additional Information:</h5>
              <ul>
                {error.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Show rate limit information */}
          {error?.rateLimit && (
            <div className="rate-limit-info">
              <strong>Rate Limit Status:</strong> {error.rateLimit.limit} 
              {error.rateLimit.authenticated ? ' (authenticated)' : ' (unauthenticated)'}
            </div>
          )}
          
          {username && errorType !== 'no_repos' && (
            <div className="error-context">
              Attempted to fetch repositories for: <strong>{username}</strong>
            </div>
          )}
        </div>
      </div>
      
      <div className="error-actions">
        {onRetry && (
          <button 
            onClick={onRetry}
            className="retry-button"
          >
            Try Again
          </button>
        )}
        
        <div className="error-tips">
          <h4>Helpful Tips:</h4>
          <ul>
            <li>Make sure the GitHub username exists and is spelled correctly</li>
            <li>Only public repositories will be displayed</li>
            <li>Some users may not have any public repositories</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;

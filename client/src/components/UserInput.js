import React, { useState, useEffect } from 'react';
import './UserInput.css';

const UserInput = ({ onSubmit, initialValue = '', loading = false }) => {
  const [username, setUsername] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setUsername(initialValue);
  }, [initialValue]);

  const validateUsername = (value) => {
    // GitHub username validation rules
    const githubUsernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]){0,38}$/;
    return githubUsernameRegex.test(value);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    
    if (value.trim() === '') {
      setIsValid(true);
    } else {
      setIsValid(validateUsername(value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setIsValid(false);
      return;
    }
    
    if (!validateUsername(trimmedUsername)) {
      setIsValid(false);
      return;
    }
    
    onSubmit(trimmedUsername);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="user-input-container">
      <div className="user-input-content">
        <h2 className="input-title">Enter GitHub Username</h2>
        <p className="input-description">
          Discover the timeline of any GitHub user's public repositories
        </p>

        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <a
            href={`${process.env.REACT_APP_API_BASE || ''}/auth/github`}
            className="github-oauth-btn"
            rel="noopener noreferrer"
          >
            <span style={{ marginRight: '0.5rem' }}>🔑</span>Sign in with GitHub
          </a>
        </div>
        
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-group">
            <div className={`input-wrapper ${!isValid ? 'error' : ''}`}>
              <span className="input-prefix">github.com/</span>
              <input
                type="text"
                value={username}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="username"
                className="username-input"
                disabled={loading}
                autoComplete="off"
                spellCheck="false"
                maxLength={39}
              />
            </div>
            <button
              type="submit"
              className={`submit-button ${loading ? 'loading' : ''}`}
              disabled={loading || !username.trim() || !isValid}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Loading...
                </>
              ) : (
                <>
                  <span className="search-icon">🔍</span>
                  Generate Timeline
                </>
              )}
            </button>
          </div>
          
          {!isValid && username.trim() && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              Please enter a valid GitHub username (alphanumeric characters and hyphens only)
            </div>
          )}
          
          <div className="input-hints">
            <p className="hint">
              <strong>Examples:</strong> octocat, torvalds, gaearon, sindresorhus
            </p>
            <p className="hint-note">
              Only public repositories will be displayed
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserInput;

import React, { useState, useEffect } from 'react';
import UserInput from './components/UserInput';
import Timeline from './components/Timeline';
import ErrorMessage from './components/ErrorMessage';
import LoadingSpinner from './components/LoadingSpinner';
import ThemeToggle from './components/ThemeToggle';
import APIStatus from './components/APIStatus';
import RepositoryInsights from './components/RepositoryInsights/RepositoryInsights';
import DeveloperProfile from './components/DeveloperProfile/DeveloperProfile';
import TopContributors from './components/TopContributors/TopContributors';
import useGitHub from './hooks/useGitHub';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [theme, setTheme] = useState('dark');
  const { repositories, loading, error, fetchUserRepos } = useGitHub();

  useEffect(() => {
    // Check if there's a username in the URL params
    const urlParams = new URLSearchParams(window.location.search);
    const urlUsername = urlParams.get('user');
    if (urlUsername) {
      setUsername(urlUsername);
      setCurrentUser(urlUsername);
      fetchUserRepos(urlUsername);
    }

  // Always use dark mode as default
  setTheme('dark');
  document.body.setAttribute('data-theme', 'dark');
  }, [fetchUserRepos]);

  const handleUsernameSubmit = (submittedUsername) => {
    setUsername(submittedUsername);
    setCurrentUser(submittedUsername);
    fetchUserRepos(submittedUsername);
    
    // Update URL without refreshing the page
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('user', submittedUsername);
    window.history.pushState({}, '', newUrl);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('github-timeline-theme', newTheme);
  };

  const shareTimeline = () => {
    if (currentUser) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?user=${currentUser}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Timeline URL copied to clipboard!');
      });
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">
              GitHub Timeline
            </h1>
            <p className="app-subtitle">
              Discover the timeline of any GitHub user's public repositories
            </p>
          </div>
          <div className="header-controls">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button 
              className="share-button"
              onClick={shareTimeline}
              title="Share Timeline"
            >
              Share
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* API Status - Show when user has submitted a username */}
        {currentUser && (
          <APIStatus showAlways={false} />
        )}

        <section className="input-section">
          <UserInput 
            onSubmit={handleUsernameSubmit} 
            initialValue={username}
            loading={loading}
          />
        </section>

        {loading && (
          <section className="loading-section">
            <LoadingSpinner />
          </section>
        )}

        {error && !loading && (
          <section className="error-section">
            <ErrorMessage 
              error={error} 
              username={currentUser}
              onRetry={() => fetchUserRepos(currentUser)}
            />
          </section>
        )}

        {repositories.length > 0 && !loading && !error && (
          <>
            {/* Developer Profile - Positioned at top */}
            <section className="profile-section">
              <DeveloperProfile 
                repositories={repositories}
                username={currentUser}
              />
            </section>

            {/* Repository Timeline - Main Focus */}
            <section className="timeline-section">
              <div className="timeline-header">
                <h2>
                  {currentUser}'s Repository Timeline
                  <span className="repo-count">({repositories.length} repositories)</span>
                </h2>

              </div>
              <Timeline 
                repositories={repositories} 
                username={currentUser}
              />
            </section>

            {/* Metrics & Insights - Grouped Analytics */}
            <section className="metrics-section">
              <div className="metrics-stack">
                <RepositoryInsights 
                  repositories={repositories} 
                  username={currentUser}
                />
              </div>
            </section>


            {/* Top Contributors */}
            <section className="contributors-section">
              <TopContributors 
                repositories={repositories}
                username={currentUser}
              />
            </section>
          </>
        )}

        {!loading && !error && repositories.length === 0 && currentUser && (
          <section className="empty-section">
            <div className="empty-state">
              <h3>No Public Repositories Found</h3>
              <p>
                {currentUser} doesn't have any public repositories yet, 
                or the username might not exist.
              </p>
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>
            Built using the{' '}
            <a 
              href="https://docs.github.com/en/rest" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              GitHub REST API
            </a>
          </p>
          <p className="footer-note">
            Only public repositories are displayed
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

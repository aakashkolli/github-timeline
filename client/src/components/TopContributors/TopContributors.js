import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { StatItem, LanguagePill } from '../CommonComponents';
import '../../main.css';
import './TopContributors.css';

const TopContributors = ({ repositories = [], username }) => {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayMode, setDisplayMode] = useState('collaborators'); // collaborators, frequent, recent

  // Process repositories to find collaborative repositories and contributors
  const collaborativeRepos = useMemo(() => {
    return repositories.filter(repo => 
      !repo.fork && // Exclude forks
      repo.size > 0 && // Must have content
      (repo.stargazers_count > 0 || repo.forks_count > 0) // Has some activity
    ).sort((a, b) => {
      // Sort by activity score (stars + forks + recent updates)
      const scoreA = (a.stargazers_count || 0) + (a.forks_count || 0) + 
                    (new Date(a.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 10 : 0);
      const scoreB = (b.stargazers_count || 0) + (b.forks_count || 0) + 
                    (new Date(b.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 10 : 0);
      return scoreB - scoreA;
    }).slice(0, 8); // Top 8 collaborative repositories
  }, [repositories]);

  // Fetch contributors for collaborative repositories
  const fetchContributors = async () => {
    if (!collaborativeRepos.length) return;

    setLoading(true);
    setError(null);

    try {
      const contributorPromises = collaborativeRepos.map(async (repo) => {
        try {
          // Fetch contributors for this repository
          const response = await fetch(
            `https://api.github.com/repos/${username}/${repo.name}/contributors?per_page=10`,
            {
              headers: {
                'Accept': 'application/vnd.github.v3+json'
              }
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch contributors for ${repo.name}`);
          }

          const contributors = await response.json();
          
          // Filter out the owner and return contributors with repo context
          return contributors
            .filter(contributor => contributor.login.toLowerCase() !== username.toLowerCase())
            .slice(0, 5) // Top 5 contributors per repo
            .map(contributor => ({
              ...contributor,
              repository: repo.name,
              repository_url: repo.html_url,
              repository_stars: repo.stargazers_count,
              repository_language: repo.language,
              last_contribution_date: repo.updated_at
            }));
        } catch (err) {
          console.error(`Error fetching contributors for ${repo.name}:`, err);
          
          // Track individual repository failures for better error reporting
          if (err.message.includes('403') && !err.message.includes('rate limit')) {
            console.warn(`Repository ${repo.name} contributors are not accessible (possibly private)`);
          }
          
          return [];
        }
      });

      const allContributors = (await Promise.all(contributorPromises)).flat();
      
      // Aggregate contributors across repositories
      const contributorMap = new Map();
      
      allContributors.forEach(contributor => {
        if (contributorMap.has(contributor.login)) {
          const existing = contributorMap.get(contributor.login);
          existing.total_contributions += contributor.contributions;
          existing.repositories.push({
            name: contributor.repository,
            url: contributor.repository_url,
            contributions: contributor.contributions,
            stars: contributor.repository_stars,
            language: contributor.repository_language
          });
          // No collaboration score calculation needed
        } else {
          contributorMap.set(contributor.login, {
            login: contributor.login,
            avatar_url: contributor.avatar_url,
            html_url: contributor.html_url,
            total_contributions: contributor.contributions,
            repositories: [{
              name: contributor.repository,
              url: contributor.repository_url,
              contributions: contributor.contributions,
              stars: contributor.repository_stars,
              language: contributor.repository_language
            }],
            last_seen: contributor.last_contribution_date
          });
        }
      });

      const processedContributors = Array.from(contributorMap.values())
        .sort((a, b) => {
          switch (displayMode) {
            case 'frequent':
              return b.total_contributions - a.total_contributions;
            case 'recent':
              return new Date(b.last_seen) - new Date(a.last_seen);
            default: // collaborators
              return b.total_contributions - a.total_contributions; // Simplified sorting
          }
        })
        .slice(0, 12); // Top 12 contributors

      setContributors(processedContributors);
    } catch (err) {
      console.error('Error fetching contributors:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load contributors.';
      if (err.message.includes('rate limit') || err.message.includes('403')) {
        errorMessage = 'GitHub API rate limit exceeded. Please try again later.';
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        errorMessage = 'Network error occurred. Please check your connection and try again.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Repository contributor data is not accessible or repositories may be private.';
      } else {
        errorMessage = 'Unable to fetch contributor data. This may be due to repository privacy settings or API limitations.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collaborativeRepos.length > 0) {
      fetchContributors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collaborativeRepos, displayMode]);

  // Get display info based on current mode
  const getDisplayInfo = () => {
    switch (displayMode) {
      case 'frequent':
        return {
          title: 'Most Active Contributors',
          description: 'Contributors ranked by total contributions across repositories',
          emptyMessage: 'No frequent contributors found'
        };
      case 'recent':
        return {
          title: 'Recent Contributors',
          description: 'Contributors sorted by most recent activity',
          emptyMessage: 'No recent contributors found'
        };
      default:
        return {
          title: 'Top Collaborators',
          description: 'Key contributors to collaborative repositories',
          emptyMessage: 'No collaborators found'
        };
    }
  };

  const displayInfo = getDisplayInfo();

  if (collaborativeRepos.length === 0) {
    return (
      <div className="top-contributors">
        <div className="contributors-header">
          <h2 className="contributors-title">Top Contributors</h2>
          <p className="contributors-subtitle">
            Discover the people who collaborate with {username}
          </p>
        </div>
        <div className="empty-state">
          {/* Removed crane emoji */}
          <h4 className="empty-title">No Collaborative Repositories Found</h4>
          <p className="empty-description">
            {username}'s portfolio appears to consist mainly of personal projects or repositories 
            without significant collaborative activity.
          </p>
          <div className="empty-suggestions no-bg">
            <p>Collaborative repositories typically have:</p>
            <ul>
              <li>Multiple contributors beyond the owner</li>
              <li>Active stars or forks from the community</li>
              <li>Recent collaborative commits and updates</li>
              <li>Public visibility and contributor access</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="top-contributors">
      <div className="contributors-header">
        <h2 className="contributors-title">Top Contributors</h2>
        <p className="contributors-subtitle">
          Discover the people who collaborate with {username}
        </p>
        
        <div className="display-mode-controls">
          <button 
            className={`mode-btn ${displayMode === 'collaborators' ? 'active' : ''}`}
            onClick={() => setDisplayMode('collaborators')}
          >
            Collaborators
          </button>
          <button 
            className={`mode-btn ${displayMode === 'frequent' ? 'active' : ''}`}
            onClick={() => setDisplayMode('frequent')}
          >
            Most Active
          </button>
          <button 
            className={`mode-btn ${displayMode === 'recent' ? 'active' : ''}`}
            onClick={() => setDisplayMode('recent')}
          >
            Recent
          </button>
        </div>
      </div>

      <div className="contributors-content">
        <div className="section-info">
          <h3 className="section-title">{displayInfo.title}</h3>
          <p className="section-description">{displayInfo.description}</p>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading contributors...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchContributors} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && contributors.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h4 className="empty-title">{displayInfo.emptyMessage}</h4>
            <p className="empty-description">
              {displayMode === 'collaborators' ? 
                `${username} appears to work solo on most projects, or contributor data isn't available for these repositories.` :
                displayMode === 'frequent' ? 
                `No contributors with significant activity found across ${username}'s repositories.` :
                `No recent collaborative activity detected in ${username}'s repositories.`
              }
            </p>
            <div className="empty-suggestions">
              <p>This could happen when:</p>
              <ul>
                <li>Most repositories are personal projects</li>
                <li>Repositories are private and contributor data isn't accessible</li>
                <li>GitHub API rate limits are preventing data retrieval</li>
                <li>Projects haven't had recent collaborative activity</li>
              </ul>
            </div>
          </div>
        )}

        {!loading && !error && contributors.length > 0 && (
          <div className="contributors-grid">
            {contributors.map((contributor, index) => (
              <div key={contributor.login} className="contributor-card">
                <div className="contributor-header">
                  <div className="contributor-avatar">
                    <img 
                      src={contributor.avatar_url} 
                      alt={`${contributor.login}'s avatar`}
                      onError={(e) => {
                        e.target.src = `https://github.com/identicons/${contributor.login}.png`;
                      }}
                    />
                    <div className="contributor-rank">#{index + 1}</div>
                  </div>
                  <div className="contributor-info">
                    <a 
                      href={contributor.html_url}
                      className="contributor-name"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {contributor.login}
                    </a>
                    <div className="contributor-stats">
                      <StatItem value={contributor.total_contributions} label="Contributions" />
                      <StatItem value={contributor.repositories.length} label={contributor.repositories.length === 1 ? 'Repository' : 'Repositories'} />
                    </div>
                  </div>
                </div>

                <div className="contributor-repositories">
                  <h4 className="repos-title">Contributed to:</h4>
                  <div className="repos-list">
                    {contributor.repositories.slice(0, 3).map(repo => (
                      <div key={repo.name} className="repo-contribution">
                        <a href={repo.url} className="repo-name" target="_blank" rel="noopener noreferrer">
                          {repo.name}
                        </a>
                        <div className="repo-details">
                          <span className="contribution-count">{repo.contributions.toLocaleString()}</span>
                          {repo.language && (
                            <LanguagePill language={repo.language} />
                          )}
                          {repo.stars > 0 && (
                            <span className="repo-stars">★ {repo.stars.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {contributor.repositories.length > 3 && (
                      <div className="more-repos">
                        +{contributor.repositories.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                <div className="contributor-footer">
                  <div className="last-seen">
                    Last active: {new Date(contributor.last_seen).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

TopContributors.propTypes = {
  repositories: PropTypes.array.isRequired,
  username: PropTypes.string.isRequired
};

export default TopContributors;

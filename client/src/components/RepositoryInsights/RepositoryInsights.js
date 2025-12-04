
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
// import { LanguageIcon } from '../../utils/languageIcons';
import { getLanguageStats, sortRepositoriesByStars, getMostActiveYear } from '../../utils/repositoryAnalytics';
import { StatItem, LanguagePill } from '../CommonComponents';
import '../../main.css';
import './RepositoryInsights.css';

const RepositoryInsights = ({ repositories = [], username }) => {
  const analytics = useMemo(() => {
    if (!repositories.length) return null;

    let totalStars = 0;
    let totalForks = 0;

    repositories.forEach(repo => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
    });

    // Get top languages using shared utility
    const topLanguagesArr = getLanguageStats(repositories, 5);
    // Convert to [language, count] format for compatibility
    const topLanguages = topLanguagesArr.map(({ language, count }) => [language, count]);

    // Get most active year using shared utility
    const mostActiveYear = getMostActiveYear(repositories);

    // Get top starred repositories using shared utility
    const topStarredRepos = sortRepositoriesByStars(repositories, 3);

    // Calculate average update frequency (days since last update)
    const avgUpdateFrequency = repositories.reduce((acc, repo) => {
      const daysSinceUpdate = Math.floor(
        (new Date() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24)
      );
      return acc + daysSinceUpdate;
    }, 0) / repositories.length;

    return {
      totalRepos: repositories.length,
      totalStars,
      totalForks,
      topLanguages,
      mostActiveYear,
      topStarredRepos,
      avgUpdateFrequency: Math.floor(avgUpdateFrequency),
      publicRepos: repositories.filter(repo => !repo.private).length,
      forkedRepos: repositories.filter(repo => repo.fork).length
    };
  }, [repositories]);

  if (!analytics) {
    return (
      <div className="repository-insights">
        <div className="insights-placeholder">
          <h3>Repository Insights</h3>
          <p>Generate insights from repository data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="repository-insights">
      <div className="insights-header">
        <h3 className="insights-title">
          Repository Overview
        </h3>
        <p className="insights-subtitle">
          {analytics.totalRepos} repositories
        </p>
      </div>

      <div className="insights-grid">
        {/* Overview Stats */}
        <div className="insight-card overview-card">
          <h4 className="card-title">
            Overview Stats
          </h4>
          <div className="stats-grid">
            <StatItem value={analytics.totalRepos} label="Total Repositories" />
            <StatItem value={analytics.totalStars} label="Total Stars" />
            <StatItem value={analytics.totalForks} label="Total Forks" />
            <StatItem value={analytics.publicRepos} label="Public Repos" />
          </div>
        </div>

        {/* Top Languages */}
        <div className="insight-card languages-card">
          <h4 className="card-title">
            Top Languages
          </h4>
          <div className="languages-list">
            {analytics.topLanguages.map(([language, count], index) => (
              <div key={language} className="language-item">
                <div className="language-info">
                  <LanguagePill language={language} />
                  <span className="language-count">{count} repos</span>
                </div>
                <div className="language-bar">
                  <div 
                    className={`language-fill language-${language.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                    data-width={Math.round((count / analytics.topLanguages[0][1]) * 100)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Insights */}
        <div className="insight-card activity-card">
          <h4 className="card-title">
            Activity Insights
          </h4>
          <div className="activity-stats">
            <div className="activity-item">
              <span className="activity-label">Most Active Year</span>
              <span className="activity-value">{analytics.mostActiveYear}</span>
            </div>
            <div className="activity-item">
              <span className="activity-label">Avg. Update Frequency</span>
              <span className="activity-value">{analytics.avgUpdateFrequency} days ago</span>
            </div>
            <div className="activity-item">
              <span className="activity-label">Forked Repositories</span>
              <span className="activity-value">{analytics.forkedRepos}</span>
            </div>
          </div>
        </div>

        {/* Top Repositories */}
        <div className="insight-card top-repos-card">
          <h4 className="card-title">
            Top Repositories
          </h4>
          <div className="top-repos-list">
            {analytics.topStarredRepos.map((repo, index) => (
              <div key={repo.id} className="top-repo-item">
                <div className="repo-rank">#{index + 1}</div>
                <div className="repo-details">
                  <a 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="repo-name"
                  >
                    {repo.name}
                  </a>
                  <p className="repo-description">{repo.description}</p>
                  <div className="repo-stats">
                    <span className="repo-stars">{repo.stargazers_count.toLocaleString()} stars</span>
                    <span className="repo-forks">{repo.forks_count.toLocaleString()} forks</span>
                    {repo.language && (
                      <span className="repo-language">{repo.language}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

RepositoryInsights.propTypes = {
  repositories: PropTypes.array.isRequired,
  username: PropTypes.string.isRequired
};

export default RepositoryInsights;

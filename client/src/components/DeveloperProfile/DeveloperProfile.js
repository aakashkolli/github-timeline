
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import './DeveloperProfile.css';
import { StatItem, LanguagePill } from '../CommonComponents';
import '../../main.css';
import { getLanguageStats, getExpertiseAreas } from '../../utils/repositoryAnalytics';

const DeveloperProfile = ({ repositories = [], username }) => {
  const profileData = useMemo(() => {
    if (!repositories.length) return null;

    const languageStats = getLanguageStats(repositories, 8);
    const expertiseAreas = getExpertiseAreas(repositories, 5);

    // Calculate activity metrics - only include if value > 0
    const totalRepos = repositories.length;
    const totalStars = repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const collaborativeRepos = repositories.filter(repo => (repo.forks_count || 0) > 0).length;
    const collaborationScore = Math.round((collaborativeRepos / repositories.length) * 100);

    return {
      languageStats,
      expertiseAreas,
      totalRepos: totalRepos > 0 ? totalRepos : null,
      totalStars: totalStars > 0 ? totalStars : null,
      collaborationScore: collaborationScore > 0 ? collaborationScore : null
    };
  }, [repositories]);


  if (!profileData) {
    return null;
  }

  return (
    <div className="developer-profile">
      <div className="profile-container">
        <div className="profile-left">
          <div className="profile-header">
            <img 
              src={`https://github.com/${username}.png?size=120`}
              alt={`${username}'s profile`}
              className="profile-avatar"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h3 className="profile-username">@{username}</h3>
          </div>
          
          <div className="activity-metrics">
            {profileData.totalRepos && (
              <StatItem value={profileData.totalRepos} label="Repos" />
            )}
            {profileData.totalStars && (
              <StatItem value={profileData.totalStars.toLocaleString()} label="Stars" />
            )}
            {profileData.collaborationScore && (
              <StatItem value={`${profileData.collaborationScore}%`} label="Collab Rate" />
            )}
          </div>
        </div>

        <div className="profile-right">
          {profileData.languageStats.length > 0 && (
            <div className="languages-section">
              <h4 className="section-title">Top languages</h4>
              <div className="language-pills">
                {profileData.languageStats.map(({ language }) => (
                  <LanguagePill key={language} language={language} />
                ))}
              </div>
            </div>
          )}

          {profileData.expertiseAreas.length > 0 && (
            <div className="focus-section">
              <h4 className="section-title">Focus areas</h4>
              <ul className="focus-list">
                {profileData.expertiseAreas.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

DeveloperProfile.propTypes = {
  repositories: PropTypes.array.isRequired,
  username: PropTypes.string.isRequired
};

export default DeveloperProfile;



import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import './DeveloperProfile.css';
import { LanguagePill } from '../CommonComponents';
import '../../main.css';
import { getLanguageStats, getExpertiseAreas } from '../../utils/repositoryAnalytics';

const DeveloperProfile = ({ repositories = [], username, userProfile }) => {
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

  if (!profileData || !userProfile) {
    return null;
  }

  return (
    <>
      <div className="modern-profile-card flex flex-col md:flex-row items-center md:items-start gap-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 mb-12 animate-fade-in">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full blur opacity-40"></div>
          <img
            src={userProfile.avatar_url}
            alt={userProfile.login}
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-slate-950 shadow-xl"
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="profile-username-stack">
            <span className="profile-name">{userProfile.name}</span>
            <span className="profile-username">@{userProfile.login}</span>
          </div>
          {userProfile.bio && <p className="profile-bio">{userProfile.bio}</p>}

          <ul className="profile-stats-list minimal">
            {userProfile.location && (
              <li><span className="profile-stat-label">Location:</span> <span className="profile-stat-value">{userProfile.location}</span></li>
            )}
            {userProfile.blog && (
              <li><span className="profile-stat-label">Website:</span> <a href={userProfile.blog.startsWith('http') ? userProfile.blog : `https://${userProfile.blog}`}
                target="_blank" rel="noreferrer" className="profile-stat-link profile-stat-value">{userProfile.blog.replace(/^https?:\/\//, '')}</a></li>
            )}
            <li><span className="profile-stat-label">Followers:</span> <span className="profile-stat-value">{userProfile.followers}</span></li>
            <li><span className="profile-stat-label">Public repos:</span> <span className="profile-stat-value">{userProfile.public_repos}</span></li>
            <li className="profile-joined minimal"><span className="profile-stat-label">Joined:</span> <span className="profile-joined-date profile-stat-value">{new Date(userProfile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span></li>
          </ul>
        </div>

  {/* Removed duplicate join date section for minimalism */}
      </div>

      {/* Top languages and focus areas below the profile card */}
      <div className="profile-below-box">
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
    </>
  );
};

DeveloperProfile.propTypes = {
  repositories: PropTypes.array.isRequired,
  username: PropTypes.string.isRequired,
  userProfile: PropTypes.object.isRequired
};

export default DeveloperProfile;

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import './LanguageHighlights.css';

const LanguageHighlights = ({ repositories = [] }) => {
  const [timeFrame, setTimeFrame] = useState('all-time'); // 'all-time' or 'past-year'

  const languageData = useMemo(() => {
    if (!repositories.length) return { languages: [], topics: [], totalSize: 0 };

    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    // Filter repositories based on time frame
    const filteredRepos = timeFrame === 'past-year' 
      ? repositories.filter(repo => new Date(repo.updated_at) >= oneYearAgo)
      : repositories;

    const languageStats = {};
    const topicStats = {};
    let totalSize = 0;

    filteredRepos.forEach(repo => {
      // Count languages with size weighting (stars + forks as proxy for importance)
      if (repo.language) {
        const weight = (repo.stargazers_count || 0) + (repo.forks_count || 0) + 1;
        languageStats[repo.language] = (languageStats[repo.language] || 0) + weight;
        totalSize += weight;
      }

      // Count topics
      if (repo.topics && Array.isArray(repo.topics)) {
        repo.topics.forEach(topic => {
          topicStats[topic] = (topicStats[topic] || 0) + 1;
        });
      }
    });

    // Convert to sorted arrays
    const languages = Object.entries(languageStats)
      .map(([name, size]) => ({
        name,
        size,
        percentage: ((size / totalSize) * 100).toFixed(1)
      }))
      .sort((a, b) => b.size - a.size);

    const topics = Object.entries(topicStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Limit to top 20 topics

    return { languages, topics, totalSize };
  }, [repositories, timeFrame]);

  const getLanguageColor = (language) => {
    const colors = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#3178c6',
      'Python': '#3572A5',
      'Java': '#b07219',
      'CSS': '#563d7c',
      'HTML': '#e34c26',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Swift': '#fa7343',
      'Kotlin': '#A97BFF',
      'Dart': '#00B4AB',
      'Shell': '#89e051',
      'C': '#555555',
      'C++': '#f34b7d',
      'C#': '#239120',
      'Vue': '#4FC08D',
      'React': '#61DAFB',
      'Sass': '#a53b70',
      'Less': '#1d365d',
      'SCSS': '#c6538c'
    };
    return colors[language] || '#586069';
  };

  if (!repositories.length) {
    return (
      <div className="language-highlights">
        <div className="highlights-placeholder">
          <div className="placeholder-icon">🎨</div>
          <h3>Language & Skills</h3>
          <p>Language distribution and topic analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="language-highlights">
      <div className="highlights-header">
        <h2 className="highlights-title">
          <span className="highlights-icon">🎨</span>
          Language & skills
        </h2>
        <div className="time-toggle">
          <button 
            className={`toggle-btn ${timeFrame === 'all-time' ? 'active' : ''}`}
            onClick={() => setTimeFrame('all-time')}
          >
            All-Time
          </button>
          <button 
            className={`toggle-btn ${timeFrame === 'past-year' ? 'active' : ''}`}
            onClick={() => setTimeFrame('past-year')}
          >
            Past Year
          </button>
        </div>
      </div>

      <div className="highlights-grid">
        {/* Language Distribution */}
        <div className="highlight-section">
          <h3 className="section-title">
            <span className="section-icon">📊</span>
            Language distribution
          </h3>
          
          {languageData.languages.length > 0 ? (
            <>
              {/* Language Bar Chart */}
              <div className="language-bar-container">
                <div className="language-bar">
                  {languageData.languages.slice(0, 8).map((lang) => (
                    <div
                      key={lang.name}
                      className="language-segment"
                      style={{
                        backgroundColor: getLanguageColor(lang.name),
                        width: `${lang.percentage}%`
                      }}
                      title={`${lang.name}: ${lang.percentage}%`}
                    />
                  ))}
                </div>
              </div>

              {/* Language List */}
              <div className="language-list">
                {languageData.languages.slice(0, 8).map((lang, index) => (
                  <div key={lang.name} className="language-item">
                    <div className="language-indicator">
                      <div 
                        className="language-dot"
                        style={{ backgroundColor: getLanguageColor(lang.name) }}
                      />
                      <span className="language-name">{lang.name}</span>
                    </div>
                    <div className="language-stats">
                      <span className="language-percentage">{lang.percentage}%</span>
                      <span className="language-weight">{lang.size} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-data">
              <p>No language data available for {timeFrame.replace('-', ' ')}</p>
            </div>
          )}
        </div>

        {/* Topics Cloud */}
        <div className="highlight-section">
          <h3 className="section-title">
            <span className="section-icon">🏷️</span>
            Popular topics
          </h3>
          
          {languageData.topics.length > 0 ? (
            <div className="topics-cloud">
              {languageData.topics.map((topic, index) => {
                // Scale topic size based on count (1-3 size levels)
                const sizeClass = topic.count >= 3 ? 'large' : topic.count >= 2 ? 'medium' : 'small';
                return (
                  <span 
                    key={topic.name} 
                    className={`topic-tag ${sizeClass}`}
                    title={`Used in ${topic.count} repositories`}
                  >
                    {topic.name}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="no-data">
              <p>No topics found in repositories</p>
            </div>
          )}
        </div>

        {/* Expertise Level Indicator */}
        {languageData.languages.length > 0 && (
          <div className="highlight-section expertise-section">
            <h3 className="section-title">
              <span className="section-icon">🎯</span>
              Expertise profile
            </h3>
            
            <div className="expertise-analysis">
              {languageData.languages.length >= 5 ? (
                <div className="expertise-item polyglot">
                  <span className="expertise-badge">🌟</span>
                  <div className="expertise-content">
                    <span className="expertise-label">Polyglot Developer</span>
                    <span className="expertise-description">
                      Proficient in {languageData.languages.length} languages
                    </span>
                  </div>
                </div>
              ) : languageData.languages.length >= 3 ? (
                <div className="expertise-item versatile">
                  <span className="expertise-badge">🔧</span>
                  <div className="expertise-content">
                    <span className="expertise-label">Multi-Stack Developer</span>
                    <span className="expertise-description">
                      Works with {languageData.languages.length} main technologies
                    </span>
                  </div>
                </div>
              ) : (
                <div className="expertise-item focused">
                  <span className="expertise-badge">🎯</span>
                  <div className="expertise-content">
                    <span className="expertise-label">Focused Specialist</span>
                    <span className="expertise-description">
                      Specialized in {languageData.languages[0]?.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Top Language Mastery */}
              {languageData.languages[0] && (
                <div className="mastery-indicator">
                  <span className="mastery-language">{languageData.languages[0].name}</span>
                  <div className="mastery-bar">
                    <div 
                      className="mastery-fill"
                      style={{ 
                        width: `${Math.min(parseFloat(languageData.languages[0].percentage) * 2, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="mastery-level">Primary Language</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

LanguageHighlights.propTypes = {
  repositories: PropTypes.array.isRequired
};

export default LanguageHighlights;

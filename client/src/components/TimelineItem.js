import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { LanguageIcon } from '../utils/languageIcons';
import './TimelineItem.css';

const TimelineItem = ({ repository, index, isEven, sortBy }) => {
  // Removed unused isExpanded, setIsExpanded
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState('');
  const itemRef = useRef(null);

  // Intersection Observer for animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const refCopy = itemRef.current;
    if (refCopy) {
      observer.observe(refCopy);
    }

    return () => {
      if (refCopy) {
        observer.unobserve(refCopy);
      }
    };
  }, []);

  const formatDate = (dateString) => {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy');
  };

  const getRelativeTime = (dateString) => {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Removed unused getLanguageColor

  const cleanDescription = (description) => {
    if (!description) return '';
    // Remove problematic emojis that might not render well
    return description.replace(/📄|:page_facing_up:|📃|📋|📰|📄/g, '').trim();
  };

  const truncateDescription = (description, maxLength = 120) => {
    const cleaned = cleanDescription(description);
    if (!cleaned) return '';
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength) + '...';
  };

  const displayDate = sortBy === 'created' ? repository.created_at : repository.updated_at;
  const dateLabel = sortBy === 'created' ? 'Created' : 'Updated';

  return (
    <div 
      ref={itemRef}
      className={`timeline-item ${isEven ? 'even' : 'odd'} ${isVisible ? 'animate-in' : ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Spine & Date Bubble */}
      <div className="timeline-marker">
        <div className="marker-dot">
          {formatDate(repository[sortBy + '_at'])}
        </div>
      </div>

      {/* The Content */}
      <div className="timeline-content">
        <div className="repo-card">
          <div className="repo-header">
            <div className="repo-title-section">
              <h3 className="repo-name">
                <a 
                  href={repository.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="repo-link"
                >
                  {repository.name}
                </a>
                {repository.fork && (
                  <span 
                    className="fork-badge interactive-element"
                    onMouseEnter={() => setShowTooltip('fork-badge')}
                    onMouseLeave={() => setShowTooltip('')}
                  >
                    <span className="fork-icon">⑃</span>
                    {showTooltip === 'fork-badge' && (
                      <div className="tooltip">
                        Forked repository
                      </div>
                    )}
                  </span>
                )}
              </h3>
              <div className="repo-meta">
                <div className="meta-item">
                  <span className="meta-label">{dateLabel}:</span>
                  <span className="meta-value" title={formatDate(displayDate)}>
                    {getRelativeTime(displayDate)}
                  </span>
                </div>
                {sortBy === 'updated' && repository.created_at !== repository.updated_at && (
                  <div className="meta-item">
                    <span className="meta-label">Created:</span>
                    <span className="meta-value" title={formatDate(repository.created_at)}>
                      {getRelativeTime(repository.created_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="repo-stats">
              <div 
                className="stat interactive-stat" 
                onMouseEnter={() => setShowTooltip('stars')}
                onMouseLeave={() => setShowTooltip('')}
              >
                <span className="stat-icon extra-large-icon">★</span>
                <span className="stat-value small-text">{repository.stargazers_count.toLocaleString()}</span>
                {showTooltip === 'stars' && (
                  <div className="tooltip top-tooltip">
                    {repository.stargazers_count} star{repository.stargazers_count !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <div 
                className="stat interactive-stat"
                onMouseEnter={() => setShowTooltip('forks')}
                onMouseLeave={() => setShowTooltip('')}
              >
                <span className="stat-icon extra-large-icon">⑃</span>
                <span className="stat-value small-text">{repository.forks_count.toLocaleString()}</span>
                {showTooltip === 'forks' && (
                  <div className="tooltip top-tooltip">
                    {repository.forks_count} fork{repository.forks_count !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              {repository.open_issues_count > 0 && (
                <div 
                  className="stat interactive-stat"
                  onMouseEnter={() => setShowTooltip('issues')}
                  onMouseLeave={() => setShowTooltip('')}
                >
                  <span className="stat-icon extra-large-icon">!</span>
                  <span className="stat-value small-text">{repository.open_issues_count}</span>
                  {showTooltip === 'issues' && (
                    <div className="tooltip top-tooltip">
                      {repository.open_issues_count} open issue{repository.open_issues_count !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {repository.description && (
            <div className="repo-description">
              <p className="description-text">
                {truncateDescription(repository.description)}
              </p>
            </div>
          )}          <div className="repo-details">
            {repository.language && (
              <div 
                className="language-info interactive-element"
                onMouseEnter={() => setShowTooltip('language')}
                onMouseLeave={() => setShowTooltip('')}
              >
                <LanguageIcon 
                  language={repository.language} 
                  className="timeline-language-icon" 
                />
                <span className="language-name">{repository.language}</span>
                {showTooltip === 'language' && (
                  <div className="tooltip">
                    Primary language: {repository.language}
                  </div>
                )}
              </div>
            )}
            
            <div className="repo-links">
              <a 
                href={repository.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="view-repo-button"
              >
                View Repository →
              </a>
            </div>
          </div>

          {(repository.topics && repository.topics.length > 0) && (
            <div className="repo-topics">
              <div className="topics-label">Topics:</div>
              <div className="topics-list">
                {repository.topics.slice(0, 8).map((topic) => (
                  <span key={topic} className="topic-tag">
                    {topic}
                  </span>
                ))}
                {repository.topics.length > 8 && (
                  <span className="topic-tag more-topics">
                    +{repository.topics.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {repository.homepage && (
            <div className="repo-homepage">
              <a 
                href={repository.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="homepage-link"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;

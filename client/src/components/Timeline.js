import React, { useState, useMemo } from 'react';
import TimelineItem from './TimelineItem';
import './Timeline.css';
// ...existing code...
import '../main.css';
import { parseISO, getYear } from 'date-fns';

const Timeline = ({ repositories, username }) => {
  const [sortBy, setSortBy] = useState('created'); // 'created' or 'updated'
  const [filterYear, setFilterYear] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterTopic, setFilterTopic] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Show 20 repos per page for performance

  // Process repositories data
  const processedData = useMemo(() => {
    if (!repositories || repositories.length === 0) return { 
      repos: [], 
      yearCounts: {}, 
      availableYears: [],
      availableLanguages: [],
      availableTopics: []
    };

    // Get available filter options
    const languages = new Set();
    const topics = new Set();
    
    repositories.forEach(repo => {
      if (repo.language) languages.add(repo.language);
      if (repo.topics) repo.topics.forEach(topic => topics.add(topic));
    });

    const availableLanguages = Array.from(languages).sort();
    const availableTopics = Array.from(topics).sort();

    // Sort repositories
    const sortedRepos = [...repositories].sort((a, b) => {
      const dateA = sortBy === 'created' ? a.created_at : a.updated_at;
      const dateB = sortBy === 'created' ? b.created_at : b.updated_at;
      return new Date(dateA) - new Date(dateB); // Chronological order
    });

    // Apply filters
    const filteredRepos = sortedRepos.filter(repo => {
      // Year filter
      if (filterYear !== 'all') {
        const year = getYear(parseISO(repo.created_at));
        if (year !== parseInt(filterYear)) return false;
      }
      
      // Language filter
      if (filterLanguage !== 'all') {
        if (repo.language !== filterLanguage) return false;
      }
      
      // Topic filter
      if (filterTopic !== 'all') {
        if (!repo.topics || !repo.topics.includes(filterTopic)) return false;
      }
      
      return true;
    });

    // Count repositories by year
    const yearCounts = repositories.reduce((acc, repo) => {
      const year = getYear(parseISO(repo.created_at));
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});

    const availableYears = Object.keys(yearCounts).sort((a, b) => b - a);

    return {
      repos: filteredRepos,
      yearCounts,
      availableYears,
      availableLanguages,
      availableTopics
    };
  }, [repositories, sortBy, filterYear, filterLanguage, filterTopic]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRepos = processedData.repos.slice(startIndex, endIndex);
    const totalPages = Math.ceil(processedData.repos.length / itemsPerPage);
    
    return {
      repos: paginatedRepos,
      totalPages,
      currentPage,
      totalItems: processedData.repos.length
    };
  }, [processedData.repos, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  if (!repositories || repositories.length === 0) {
    return null;
  }

  return (
    <div className="timeline-container">
      
      {/* Timeline Controls */}
      <div className="timeline-controls">
        <div className="controls-row">
          <div className="control-group">
            <label htmlFor="sort-select">Sort by</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                resetPagination();
              }}
              className="control-select"
            >
              <option value="created">Creation Date</option>
              <option value="updated">Last Updated</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="year-filter">Year</label>
            <select
              id="year-filter"
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                resetPagination();
              }}
              className="control-select"
            >
              <option value="all">All Years</option>
              {processedData.availableYears.map(year => (
                <option key={year} value={year}>
                  {year} ({processedData.yearCounts[year]})
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="language-filter">Language</label>
            <select
              id="language-filter"
              value={filterLanguage}
              onChange={(e) => {
                setFilterLanguage(e.target.value);
                resetPagination();
              }}
              className="control-select"
            >
              <option value="all">All Languages</option>
              {processedData.availableLanguages.map(language => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="topic-filter">Topic</label>
            <select
              id="topic-filter"
              value={filterTopic}
              onChange={(e) => {
                setFilterTopic(e.target.value);
                resetPagination();
              }}
              className="control-select"
            >
              <option value="all">All Topics</option>
              {processedData.availableTopics.map(topic => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="results-info">
          Showing {paginatedData.repos.length} of {processedData.repos.length} repositories
          {processedData.repos.length !== repositories.length && ` (${repositories.length} total)`}
          {paginatedData.totalPages > 1 && ` - Page ${currentPage} of ${paginatedData.totalPages}`}
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline">
        <div className="timeline-line"></div>
        {processedData.repos.map((repo, index) => (
          <TimelineItem
            key={repo.id}
            repository={repo}
            index={index}
            isEven={index % 2 === 0}
            sortBy={sortBy}
          />
        ))}
      </div>



      {/* Pagination Controls */}
      {paginatedData.totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ← Previous
          </button>
          
          <div className="pagination-info">
            <span className="page-numbers">
              {Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => {
                let pageNum;
                if (paginatedData.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= paginatedData.totalPages - 2) {
                  pageNum = paginatedData.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`page-btn ${pageNum === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </span>
          </div>
          
          <button 
            className="pagination-btn"
            disabled={currentPage === paginatedData.totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next →
          </button>
        </div>
      )}
      
      {processedData.repos.length === 0 && (filterYear !== 'all' || filterLanguage !== 'all' || filterTopic !== 'all') && (
        <div className="no-results">
          <p>No repositories found matching the selected filters</p>
          <button 
            onClick={() => {
              setFilterYear('all');
              setFilterLanguage('all');
              setFilterTopic('all');
              resetPagination();
            }}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Timeline;

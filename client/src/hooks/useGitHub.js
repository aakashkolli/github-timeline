import { useState, useCallback } from 'react';
import axios from 'axios';

const useGitHub = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserRepos = useCallback(async (username) => {
    if (!username?.trim()) {
      setError('Please enter a valid username');
      return;
    }

    setLoading(true);
    setError(null);
    setRepositories([]);

    try {
      // Use our backend proxy to fetch repositories
      const response = await axios.get(`http://localhost:5001/api/users/${username}/repos`);
      
      if (response.data.success) {
        const repos = response.data.data;
        
        // Sort repositories by creation date (newest first)
        const sortedRepos = repos.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        setRepositories(sortedRepos);
        
        if (sortedRepos.length === 0) {
          setError({
            type: 'no_repos',
            message: 'No public repositories found for this user'
          });
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch repositories');
      }
    } catch (err) {
      console.error('Error fetching repositories:', err);
      
      let errorMessage = 'An unexpected error occurred';
      let errorType = 'generic';
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        switch (status) {
          case 404:
            errorMessage = 'User not found. Please check the username and try again.';
            errorType = 'user_not_found';
            break;
          case 403:
            if (data?.message && data.message.includes('rate limit')) {
              errorMessage = 'GitHub API rate limit exceeded. Please try again later.';
              errorType = 'rate_limit';
            } else {
              errorMessage = 'Access forbidden. The user or repositories may be private.';
              errorType = 'forbidden';
            }
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            errorType = 'server_error';
            break;
          default:
            errorMessage = data?.message || `Error ${status}: Unable to fetch repositories`;
            errorType = 'api_error';
        }
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
        errorType = 'network_error';
      }
      
      setError({
        type: errorType,
        message: errorMessage,
        suggestions: (err.response?.data?.suggestions) || [],
        rateLimit: (err.response?.data?.rateLimit) || null,
        originalError: err
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearRepositories = useCallback(() => {
    setRepositories([]);
    setError(null);
  }, []);

  return {
    repositories,
    loading,
    error,
    fetchUserRepos,
    clearError,
    clearRepositories
  };
};

export default useGitHub;

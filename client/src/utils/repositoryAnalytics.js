// Sort repositories by stars (descending)
export function sortRepositoriesByStars(repositories, topN = 3) {
  return repositories
    .slice()
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, topN);
}

// Get most active year from repositories
export function getMostActiveYear(repositories) {
  const yearlyRepos = {};
  repositories.forEach(repo => {
    const year = new Date(repo.created_at).getFullYear();
    yearlyRepos[year] = (yearlyRepos[year] || 0) + 1;
  });
  return Object.entries(yearlyRepos)
    .sort(([,a], [,b]) => b - a)[0]?.[0];
}
// Utility functions for repository analytics
// Calculates language stats and expertise areas from a list of repositories

export function getLanguageStats(repositories, topN = 8) {
  const languages = {};
  repositories.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });
  return Object.entries(languages)
    .sort(([,a], [,b]) => b - a)
    .slice(0, topN)
    .map(([language, count]) => ({ language, count }));
}

export function getExpertiseAreas(repositories, topN = 5) {
  const projectTypes = {};
  repositories.forEach(repo => {
    const topics = repo.topics || [];
    const repoName = repo.name ? repo.name.toLowerCase() : '';
    let hasProjectType = false;
    // Web Development
    if (topics.some(t => ['web', 'website', 'frontend', 'backend', 'html', 'css', 'react', 'vue', 'angular'].includes(t.toLowerCase())) ||
        ['website', 'web', 'app', 'frontend', 'backend', 'react', 'vue'].some(keyword => repoName.includes(keyword)) ||
        repo.language === 'HTML' || repo.language === 'CSS' || repo.language === 'JavaScript' || repo.language === 'TypeScript') {
      projectTypes['Web Development'] = (projectTypes['Web Development'] || 0) + 1;
      hasProjectType = true;
    }
    // Mobile Development
    if (topics.some(t => ['mobile', 'android', 'ios', 'react-native', 'flutter', 'swift', 'kotlin'].includes(t.toLowerCase())) ||
        ['mobile', 'android', 'ios', 'flutter'].some(keyword => repoName.includes(keyword)) ||
        repo.language === 'Swift' || repo.language === 'Kotlin' || repo.language === 'Dart') {
      projectTypes['Mobile Development'] = (projectTypes['Mobile Development'] || 0) + 1;
      hasProjectType = true;
    }
    // API/Backend Development
    if (topics.some(t => ['api', 'backend', 'server', 'microservice', 'rest', 'graphql'].includes(t.toLowerCase())) ||
        ['api', 'server', 'backend', 'service'].some(keyword => repoName.includes(keyword))) {
      projectTypes['Backend Development'] = (projectTypes['Backend Development'] || 0) + 1;
      hasProjectType = true;
    }
    // AI/ML
    if (topics.some(t => ['ai', 'ml', 'machine-learning', 'data-science', 'tensorflow', 'pytorch', 'sklearn'].includes(t.toLowerCase())) ||
        ['ai', 'ml', 'data', 'neural', 'learning', 'model'].some(keyword => repoName.includes(keyword))) {
      projectTypes['AI/ML'] = (projectTypes['AI/ML'] || 0) + 1;
      hasProjectType = true;
    }
    // Libraries & Tools
    if (topics.some(t => ['library', 'package', 'framework', 'tool', 'cli', 'npm', 'pip'].includes(t.toLowerCase())) ||
        ['lib', 'tool', 'util', 'cli', 'helper'].some(keyword => repoName.includes(keyword))) {
      projectTypes['Libraries & Tools'] = (projectTypes['Libraries & Tools'] || 0) + 1;
      hasProjectType = true;
    }
    // Data Science
    if (topics.some(t => ['data', 'analytics', 'visualization', 'jupyter', 'notebook'].includes(t.toLowerCase())) ||
        ['data', 'analysis', 'chart', 'graph'].some(keyword => repoName.includes(keyword)) ||
        repo.language === 'R' || repo.language === 'Jupyter Notebook') {
      projectTypes['Data Science'] = (projectTypes['Data Science'] || 0) + 1;
      hasProjectType = true;
    }
    // If no specific type is found, classify by language or as general
    if (!hasProjectType) {
      if (repo.language === 'Python') {
        projectTypes['Python Development'] = (projectTypes['Python Development'] || 0) + 1;
      } else if (repo.language === 'Java') {
        projectTypes['Java Development'] = (projectTypes['Java Development'] || 0) + 1;
      } else if (repo.language === 'JavaScript' || repo.language === 'TypeScript') {
        projectTypes['JavaScript Development'] = (projectTypes['JavaScript Development'] || 0) + 1;
      } else if (repo.language) {
        projectTypes[`${repo.language} Development`] = (projectTypes[`${repo.language} Development`] || 0) + 1;
      } else {
        projectTypes['General Development'] = (projectTypes['General Development'] || 0) + 1;
      }
    }
  });
  return Object.entries(projectTypes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, topN)
    .map(([type]) => type);
}
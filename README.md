
# GitHub Timeline

**Motivation:**  
This project provides a fast, visual way to explore any GitHub user's public repositories in chronological order, with analytics and insights. It is designed for developers, recruiters, and anyone interested in understanding a developer's open-source journey at a glance.

## Features

- Enter a GitHub username to generate a timeline of public repositories
- Chronological, interactive timeline visualization
- Repository details: name, creation date, description, direct links
- Overview statistics: total repos, stars, forks, top languages
- Language and topic highlights
- Shareable URLs for easy sharing
- Responsive design for all devices
- Robust error handling for invalid users or API issues
- Robust error handling for invalid users or API issues
  Fast response times with backend caching (10-minute cache for user repository data)
  Returns a list of public repositories for the given user. Results are cached for 10 minutes to improve performance and reduce GitHub API usage.

## Tech Stack

- **Frontend:** React, JavaScript (ES6+), CSS (Grid/Flexbox), date-fns
- **Backend:** Node.js, Express, GitHub REST API v3
- **Tooling:** Create React App, ESLint, Concurrently

## API

- `GET /api/users/:username/repos`  
  Returns a list of public repositories for the given user.

## Project Structure

```
github-timeline/
  client/      # React frontend
  server/      # Express backend
  README.md
  package.json
```

## Scripts

- `npm run dev` — Start frontend and backend in development mode
- `npm run install:all` — Install all dependencies

## Installation

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn package manager

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/github-timeline.git
   cd github-timeline
   ```

2. **Install all dependencies**

   ```bash
   npm run install:all
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the application
   The backend API runs on `http://localhost:5001`

## Usage

1. **Enter a GitHub Username**: Type any public GitHub username in the input field
2. **Generate Timeline**: Click "Generate Timeline" to fetch and display repositories
3. **Explore Repositories**: Click on repository names to visit them on GitHub
4. **Share Timeline**: Copy the URL to share the timeline with others
5. **Toggle Theme**: Use the dark mode toggle for different viewing preferences

## API Reference

### Endpoints

#### Get User Repositories

```markdown
GET /api/users/:username/repos
```

**Parameters:**

- `username` (string): GitHub username

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 123456,
      "name": "repository-name",
      "full_name": "username/repository-name",
      "description": "Repository description",
      "html_url": "https://github.com/username/repository-name",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-15T00:00:00Z",
      "stargazers_count": 10,
      "forks_count": 2,
      "language": "JavaScript"
    }
  ],
  "total": 25
}
```

## Development

### Available Scripts

**Root Level:**

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server:start` - Start only the Express backend server
- `npm run install:all` - Install dependencies for both client and server

**Client (Frontend):**

- `npm start` - Start the React development server (port 3000)
- `npm run build` - Build the React app for production
- `npm test` - Run the frontend test suite
- `npm run eject` - Eject from Create React App (irreversible)

**Server (Backend):**

- `npm start` - Start the Express production server (port 5001)
- `npm run dev` - Start server with nodemon for development

### Environment Variables

#### Backend (`server/.env`)

Create a `.env` file in the `server/` directory with:

```env
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://aakashkolli.github.io/
GITHUB_TOKEN=your_github_token_here   # (optional, for higher rate limits)
```

Replace `your_github_token_here` with your personal GitHub token.

#### Frontend (`client/.env`)

If deploying your backend to a public host (e.g., Render), create a `.env` file in the `client/` directory with:

```env
REACT_APP_API_BASE=https://your-backend-url.onrender.com
```

Replace with your actual backend URL.

**Note:**

- The `"proxy"` field in `client/package.json` is only for local development. In production, the frontend must use the public backend URL for API requests.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- GitHub REST API for repository data
- React community for documentation and examples
- GitHub's design system for UI inspo

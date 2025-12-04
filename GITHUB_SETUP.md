# GitHub API Rate Limit Setup Guide

## Quick Fix for "Rate Limit Exceeded" Error

If you're seeing rate limit errors, it's because the GitHub API has limits:

- **Without authentication**: 60 requests per hour per IP address
- **With authentication**: 5,000 requests per hour

## Step-by-Step Setup

### 1. Create a GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "GitHub Timeline App"
4. Select scopes: **Only check `public_repo`** (for reading public repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

### 2. Configure the Server

1. In the `/server` directory, create a `.env` file:

   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your token:

   ```bash
   # Server Configuration
   PORT=5001
   NODE_ENV=development

   # GitHub API Configuration
   GITHUB_TOKEN=ghp_your_token_here_replace_with_actual_token

   # Frontend URL (for CORS in production)
   FRONTEND_URL=http://localhost:3000
   ```

3. Restart the server:

   ```bash
   npm run dev
   ```

### 3. Verify It's Working

1. The server logs should show improved rate limits
2. Try searching for a user again
3. Check the API status at: <http://localhost:5001/api/rate-limit>

## Security Notes

- ✅ **DO**: Use the minimum required scope (`public_repo`)
- ✅ **DO**: Keep your token private and secure
- ✅ **DO**: Add `.env` to `.gitignore` (already done)
- ❌ **DON'T**: Share your token or commit it to version control
- ❌ **DON'T**: Use tokens with unnecessary permissions

## Troubleshooting

### Still seeing rate limit errors?

- Make sure the `.env` file is in the `/server` directory
- Restart the server after adding the token
- Check the server logs for "GitHub token configured" message

### Token not working?

- Verify the token has `public_repo` scope
- Make sure there are no extra spaces in the `.env` file
- Try regenerating the token if it's old

### Development vs Production

- For development: One token is fine
- For production: Consider using GitHub Apps for better rate limits

## Alternative Solutions

If you can't set up a token right now:

1. **Wait it out**: Rate limits reset every hour
2. **Use popular usernames**: They're more likely to be cached
3. **Try later**: Peak usage times have higher rate limit pressure
4. **Use fewer requests**: The app caches results for 10 minutes

---

💡 **Pro Tip**: With a properly configured token, you can make 5,000 requests per hour instead of just 60!

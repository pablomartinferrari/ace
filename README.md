# ACE - Full-Stack Application

A full-stack application with React frontend and Vercel serverless API.

## Project Structure

```
ace/
├── api/                    # Vercel serverless functions
│   ├── test.js            # Test API endpoint
│   └── package.json       # API dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main app component with API test
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── vercel.json           # Vercel deployment configuration
└── README.md
```

## Local Development

### Prerequisites
- Node.js (version 20.19+ or 22.12+ recommended for Vite)
- npm

### Running Locally

1. **Start the API server** (for local development):
   ```bash
   cd api
   node server.js
   ```
   API will run on `http://localhost:3001`

2. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Test the connection**:
   - Open `http://localhost:5173` in your browser
   - Click "Test API Connection" button
   - You should see a JSON response from the API

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy from the root directory**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Set up and deploy: Yes
   - Which scope: (your account)
   - Link to existing project: No
   - Project name: ace (or your preferred name)
   - In which directory is your code located: ./

### Option 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

### Deployment Configuration

The project is configured with:
- **Frontend**: Vite React app built from `frontend/` directory
- **API**: Serverless functions from `api/` directory
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/dist`

### API Endpoints

Once deployed, your API will be available at:
- `https://your-project.vercel.app/api/test` - Test endpoint

### Environment Variables

The frontend automatically detects production vs development:
- **Development**: Uses `http://localhost:3001/api/test`
- **Production**: Uses relative path `/api/test`

## Testing the Deployment

After deployment:
1. Visit your Vercel app URL
2. Click the "Test API Connection" button
3. You should see the API response displayed on the page

## Troubleshooting

- **API not working**: Check the Vercel Functions tab in your dashboard
- **Frontend not building**: Ensure Node.js version compatibility
- **CORS issues**: The API includes proper CORS headers for cross-origin requests
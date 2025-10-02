# ACE - Full-Stack Application

A full-stack application with React frontend and Vercel serverless API for property exchange marketplace.

## Project Structure

```
ace/
├── api/                    # Vercel serverless functions
│   ├── posts.js           # Posts API endpoint
│   ├── server.js          # Local development server
│   └── package.json       # API dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── FeedDisplay.tsx    # Main feed component
│   │   │   ├── CreatePostForm.tsx # Post creation form
│   │   │   └── ...
│   │   ├── services/      # API services
│   │   │   └── postsService.ts    # Posts service with mock/real API
│   │   ├── stores/        # Zustand state management
│   │   └── ...
│   ├── .env.local         # Local environment variables
│   ├── package.json
│   └── vite.config.ts
├── shared/                # Shared types and utilities
├── vercel.json           # Vercel deployment configuration
└── README.md
```

## Local Development

### Prerequisites
- Node.js (version 20.19+ or 22.12+ recommended for Vite)
- npm

### Running Locally

#### Option 1: With Mock Data (Recommended for Frontend Development)

The app is configured to use mock data by default in development mode, so you can run just the frontend without the backend:

1. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

2. **Access the app**:
   - Open `http://localhost:5173` in your browser
   - You'll see mock posts in the feed
   - You can create new posts (they'll be added to the mock data)

#### Option 2: Full Stack (With Real API)

For full-stack development with real API calls:

1. **Start the API server**:
   ```bash
   cd api
   npm run dev
   ```
   API will run on `http://localhost:3000`

2. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Configure for real API** (optional):
   - Edit `frontend/.env.local`
   - Set `VITE_USE_MOCK_DATA=false`
   - Restart the frontend

### Environment Configuration

The `frontend/.env.local` file controls data source:
- `VITE_USE_MOCK_DATA=true` - Use mock data (default in development)
- `VITE_USE_MOCK_DATA=false` - Use real API calls

## Features

- **Property Exchange Feed**: Browse NEED and HAVE posts for properties
- **Post Creation**: Create posts with property details, images, and tags
- **Search & Filter**: Search posts and filter by type (NEED/HAVE)
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Mock Data Support**: Run frontend-only with realistic sample data

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
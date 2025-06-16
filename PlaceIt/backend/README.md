# PlaceIt Backend

## Overview
Express.js backend server for PlaceIt application with Supabase integration.

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

## Setup Instructions

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the backend directory with the following variables:
   ```env
   PORT=3001
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   ```
   
### 3D Reconstruction Feature (Tested on Windows only)

- **Install dependencies**
  1. Download and install [COLMAP](https://colmap.github.io/).
  2. Download and install [OpenMVS](https://github.com/cdcseacave/openMVS).
  3. Download and install [FFmpeg](https://ffmpeg.org/).
  4. Download and install [Blender](https://www.blender.org/download/).

- **Configure environment**  
  In your `.env` file, add or update:
  ```env
  OPENMVS_LOCAL_PATH="C:\Path\To\Your\OpenMVS"
  ```

- **Prepare Python environment**
  ```bash
  # From the backend directory
  cd photogrammetry
  python -m venv venv
  # On PowerShell:
  .\venv\Scripts\Activate.ps1
  # On CMD:
  venv\Scripts\activate.bat
  pip install -r requirements.txt
  ```


## Running the Application

### Development Mode
```bash
npm run dev
```
This starts the server with nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```
This starts the server using node directly.

## Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run tests (not configured yet)

## API Endpoints
- `GET /` - Health check endpoint returning "PlaceIt Backend is running!"

## Dependencies
- **express** - Web framework for Node.js
- **dotenv** - Environment variable loader
- **@supabase/supabase-js** - Supabase client library

## Development Dependencies
- **nodemon** - Development server with auto-restart

## Port
The server runs on port 3001 by default, or whatever is specified in the `PORT` environment variable.

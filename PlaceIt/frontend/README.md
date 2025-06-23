# PlaceIt Frontend

## Overview
React frontend application for PlaceIt featuring 3D/WebXR experiences with Three.js and A-Frame, styled with TailwindCSS.

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

## Setup Instructions

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration: **
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:3002

   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
This starts the Vite development server with hot module replacement.

### Build for Production
```bash
npm run build
```
This creates an optimized production build in the `dist` folder.

### Preview Production Build
```bash
npm run preview
```
This serves the production build locally for testing.

### Linting
```bash
npm run lint
```
This runs ESLint to check for code quality issues.

## HTTPS Tunneling with ngrok

For testing HTTPS functionality, WebXR features, or sharing your development server externally, you can use ngrok to create secure tunnels.

### Initial Setup

1. **Install ngrok globally:**
   ```bash
   npm install -g ngrok
   ```

2. **Create an ngrok account:**
   - Go to [ngrok.com](https://ngrok.com) and create a free account
   - Navigate to your dashboard to get your authtoken

3. **Configure ngrok:**
   Create an `ngrok.yml` configuration file in your user directory with the following content:
   ```yaml
   version: "3"
   tunnels:
       frontend:
           proto: http
           addr: 3000
       backend:
           proto: http
           addr: 3002
   agent:
       authtoken: YOUR_AUTHTOKEN_HERE
   ```

4. **Set your authtoken:**
   Replace `YOUR_AUTHTOKEN_HERE` in the configuration file with your actual authtoken from the ngrok dashboard.

### Running with ngrok

1. **Start both frontend and backend servers** (in separate terminals):
   ```bash
   # Terminal 1 - Frontend (from frontend directory)
   npm run dev

   # Terminal 2 - Backend (from backend directory)  
   npm start
   ```

2. **Start ngrok tunnels** (in a third terminal):
   ```bash
   ngrok start --all
   ```

3. **Configure your applications:**
   
   After starting ngrok, you'll see output with your tunnel URLs. Copy the HTTPS URLs and update:

   **Frontend Configuration (`vite.config.js`):**
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   // https://vite.dev/config/
   export default defineConfig({
     plugins: [react()],
     server: {
       port: 3000,
       host: true,
       allowedHosts: ['your-frontend-tunnel.ngrok-free.app']
     }
   })
   ```

   **Frontend Environment (`.env`):**
   ```env
   VITE_API_URL=https://your-backend-tunnel.ngrok-free.app
   ```

4. **Restart your frontend server** after making these changes to apply the new configuration.

### Notes
- Replace `your-frontend-tunnel.ngrok-free.app` and `your-backend-tunnel.ngrok-free.app` with your actual ngrok URLs
- The ngrok URLs change each time you restart ngrok (unless you have a paid plan with reserved domains)
- HTTPS tunneling is essential for testing WebXR features, which require secure contexts
- Free ngrok accounts have rate limits and session timeouts

## Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack
- **React** - UI library
- **Vite** - Build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **Three.js** - 3D graphics library
- **A-Frame** - Web framework for building VR experiences
- **Supabase** - Backend-as-a-Service for database and auth

## Key Dependencies
- **react** & **react-dom** - React framework
- **three** - 3D graphics
- **aframe** - WebXR/VR framework
- **@supabase/supabase-js** - Supabase client
- **webxr-polyfill** - WebXR compatibility
- **@webxr-input-profiles/motion-controllers** - WebXR input handling

## Development Server
The development server runs on `http://localhost:5173` by default (Vite's default port).

## Building for Production
After running `npm run build`, the optimized files will be in the `dist/` directory, ready for deployment.

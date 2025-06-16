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

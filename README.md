# SummerBuild2025

Welcome to the SummerBuild2025 repository! This repository contains the **PlaceIt!** project - an innovative web-based marketplace platform.

## 🚀 PlaceIt! Project Overview

**PlaceIt!** is a cutting-edge web-based open marketplace platform that revolutionizes furniture shopping by connecting sellers and buyers through immersive 3D and Augmented Reality (AR) experiences.

Watch a quick overview of PlaceIt! here: [PlaceIt! Final Video](http://www.youtube.com/watch?v=l7E_UcaUaAA)
### 🎯 What Makes PlaceIt! Special

PlaceIt! transforms the traditional online furniture shopping experience by offering:

- **3D Model Generation**: Sellers upload product videos, and our system automatically generates photorealistic 3D models
- **AR Visualization**: Buyers can place furniture in their real environment using their device's camera
- **Interactive 3D Preview**: Real-time interaction with furniture models (zoom, rotate, scale)
- **Seller Dashboard**: Comprehensive management portal for inventory, analytics, and sales tracking
- **Smart Search**: Advanced filtering by category, color, style, price, material, and AR availability

### 🛠️ Tech Stack

**Frontend:**
- **React.js** - Modern UI framework
- **Three.js** - 3D graphics and model rendering
- **A-Frame.js** - WebVR/AR framework
- **WebXR.js** - AR functionality
- **TailwindCSS** - Utility-first styling
- **Vite** - Fast build tool and development server

**Backend:**
- **Node.js** with **Express.js** - Server framework
- **Supabase** - PostgreSQL database and backend services
- **Supabase Storage** - File storage for videos, 3D models, and images

**3D Processing:**
- **COLMAP + OpenMVS** - Mesh reconstruction from video uploads


- **Mobile Devices**: Full AR experience with camera placement and real-time interaction
- **Desktop/Laptop**: 3D model viewing (AR capabilities limited by WebXR support)

## 🗂️ Project Structure

```
SummerBuild2025/
├── PlaceIt/
│   ├── frontend/          # React frontend application
│   ├── backend/           # Express.js backend server
│   └── README.md          # Project-specific documentation
└── README.md              # This file
```

## 🚀 Getting Started

Each component of the PlaceIt! platform has its own setup instructions:

### Frontend Setup
Navigate to `PlaceIt/frontend/` and follow the setup instructions in the [Frontend README](./PlaceIt/frontend/README.md).

**Quick Start:**
```bash
cd PlaceIt/frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

### Backend Setup
Navigate to `PlaceIt/backend/` and follow the setup instructions in the [Backend README](./PlaceIt/backend/README.md).

**Quick Start:**
```bash
cd PlaceIt/backend
npm install
npm run dev
```
Backend runs on: `http://localhost:3001`

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **Supabase account** (for database and storage)
- **Modern web browser** with WebXR support (for AR features)

## 🤝 Contributing

This is a SummerBuild2025 project. Please refer to individual component README files for development guidelines and contribution instructions.

## 📄 License

:D

---

**Ready to revolutionize furniture shopping with 3D and AR technology?** 🛋️✨

For detailed setup instructions, please refer to the README files in the respective `frontend` and `backend` directories.

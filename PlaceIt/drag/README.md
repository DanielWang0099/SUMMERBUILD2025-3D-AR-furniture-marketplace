# AR Three.js Application

An interactive AR application built with Three.js that allows users to place 3D objects in augmented reality using WebXR.

## Features

- 🥽 **AR Support**: Use WebXR to place objects in your real environment
- 📱 **Mobile Compatible**: Works on AR-capable Android devices
- 🎮 **Interactive**: Click/tap to spawn objects and interact with 3D models
- 🎨 **3D Models**: Includes gaming chair and box models
- 💡 **Realistic Lighting**: Ambient and directional lighting for better visuals

## Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **AR-capable device** (Android phone with ARCore support)
- **Modern browser** (Chrome/Edge on mobile for AR features)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository (or download the files)
cd ARtest

# Install dependencies
npm install
```

### 2. Generate HTTPS Certificates

Since WebXR requires HTTPS, you need to generate SSL certificates for local development:

**On macOS/Linux:**

```bash
openssl req -nodes -new -x509 -keyout server.key -out server.cert -days 365 -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=localhost"
```

**On Windows (with OpenSSL installed):**

```bash
openssl req -nodes -new -x509 -keyout server.key -out server.cert -days 365 -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=localhost"
```

**If you don't have OpenSSL installed:**

- **Windows**: Download from [OpenSSL for Windows](https://slproweb.com/products/Win32OpenSSL.html)
- **macOS**: Install via Homebrew: `brew install openssl`

### 3. Enable HTTPS in Configuration

Uncomment the HTTPS section in `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    allowedHosts: "all",
    port: 5173,
    strictPort: true,
    host: true,
    https: {
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.cert"),
    },
  },
});
```

### 4. Start the Development Server

```bash
npm run dev
```

The server will start at `https://localhost:5173`

### 5. Test on Mobile Device

**Option A: Local Network Access**

1. Find your computer's IP address:
   - **macOS/Linux**: `ifconfig | grep inet`
   - **Windows**: `ipconfig`
2. Access `https://YOUR_IP:5173` on your mobile device
3. Accept the security certificate warning

**Option B: Use ngrok (Recommended)**

```bash
# Install ngrok globally
npm install -g ngrok

# In a separate terminal, tunnel your local server
ngrok http 5173
```

Use the provided HTTPS URL on your mobile device.

## Usage

### Desktop Testing

- Use mouse to orbit around the scene
- Click on the box model to spawn random colored boxes
- See the ring change color when hovering over the box

### AR Mode (Mobile)

1. Open the HTTPS URL on your AR-capable Android device
2. Tap the "AR" button when it appears
3. Grant camera permissions
4. Tap on surfaces to place red boxes in your real environment
5. Interact with the virtual gaming chair and box models

## Project Structure

```
ARtest/
├── index.html          # Main HTML file
├── main.js            # Three.js application code
├── style.css          # Basic styling
├── package.json       # Dependencies and scripts
├── vite.config.js     # Vite development server config
├── server.key         # SSL private key (generate yourself)
├── server.cert        # SSL certificate (generate yourself)
├── Box/
│   ├── Box.glb        # 3D box model
│   └── Box.gltf       # 3D box model (alternative format)
└── gaming_chair/
    ├── scene.gltf     # Gaming chair 3D model
    ├── scene.bin      # Binary data for the model
    └── textures/      # Texture files for the chair
```

## Troubleshooting

### Common Issues

**"AR not supported" or AR button doesn't appear:**

- Ensure you're using HTTPS
- Test on an ARCore-compatible Android device
- Use Chrome or Edge browser on mobile

**Certificate warnings:**

- This is normal for self-signed certificates
- Click "Advanced" → "Proceed to localhost" in your browser

**Models not loading:**

- Check browser console for 404 errors
- Ensure all files in `Box/` and `gaming_chair/` folders are present
- Verify file paths in the code match your folder structure

**White screen:**

- Check browser console for JavaScript errors
- Ensure all dependencies are installed (`npm install`)
- Verify your browser supports WebGL

### Development Tips

- Use browser DevTools console to debug issues
- Test desktop version first before trying AR
- Ensure good lighting for AR tracking
- Point camera at textured surfaces for better AR tracking

## Browser Compatibility

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile AR**: Chrome/Edge on Android (iOS Safari for basic 3D, limited AR)
- **WebXR Support**: Android devices with ARCore

## License

This project uses 3D models with the following licenses:

- Gaming Chair: Sketchfab Standard License by Allay Design

## Contributing

Feel free to submit issues and enhancement requests!

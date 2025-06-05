# Quick Netlify Deployment Guide

## 🚀 3 Ways to Deploy to Netlify

### Option 1: Drag & Drop (Fastest)

1. **Build the app locally:**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Drag the `dist` folder to the deployment area
   - Your site will be live instantly!

### Option 2: Git Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Add video consultation feature"
   git remote add origin https://github.com/yourusername/telemedicine-ai.git
   git push -u origin main
   ```

2. **Connect to Netlify:**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

### Option 3: Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and deploy:**
   ```bash
   npm run build
   netlify login
   netlify deploy --prod --dir=dist
   ```

## 🔧 Environment Variables

After deployment, set these in Netlify dashboard:

1. Go to Site settings > Environment variables
2. Add:
   ```
   VITE_AGORA_APP_ID = your_agora_app_id_here
   ```

## 🎯 What's Included

✅ **Video Consultation Demo** - Works immediately without Agora SDK
✅ **Full Agora Integration** - Ready for production with App ID
✅ **Responsive Design** - Works on desktop and mobile
✅ **HTTPS Support** - Required for camera/microphone access
✅ **Chat Integration** - Text chat alongside video
✅ **User Authentication** - Role-based access (doctor/patient)
✅ **Dashboard** - Complete telemedicine interface

## 🧪 Testing Your Deployment

1. **Navigate to consultation:**
   - Go to `/consultation/123` on your deployed site
   - Click "Connect" to test video demo

2. **Test features:**
   - Video controls (camera on/off, mute/unmute)
   - Chat functionality
   - Responsive design on mobile
   - Navigation between pages

## 🔒 Security Features

- HTTPS enforced (automatic on Netlify)
- Security headers configured
- Camera/microphone permissions handled
- Environment variables for sensitive data

## 📱 Mobile Support

- Responsive video interface
- Touch-friendly controls
- Mobile camera/microphone access
- Optimized for mobile browsers

## 🆘 Troubleshooting

**Build fails?**
- Check Node.js version (18+ required)
- Run `npm install` locally first

**Video not working?**
- Ensure HTTPS is enabled (automatic on Netlify)
- Check browser permissions for camera/microphone
- Test on different browsers

**404 errors?**
- Ensure `_redirects` file is in the root directory
- Check that `netlify.toml` is configured correctly

## 🎉 You're Ready!

Your TeleMedicine AI Helper with video consultation is now deployed and ready for use!

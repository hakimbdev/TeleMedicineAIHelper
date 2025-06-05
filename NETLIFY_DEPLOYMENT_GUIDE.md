# Netlify Deployment Guide for TeleMedicine AI Helper

This guide will walk you through deploying the TeleMedicine AI Helper application with video consultation features to Netlify.

## Prerequisites

1. A Netlify account (sign up at [netlify.com](https://netlify.com))
2. Git repository with your code (GitHub, GitLab, or Bitbucket)
3. Agora App ID (optional, for full video functionality)

## Deployment Methods

### Method 1: Git-based Deployment (Recommended)

#### Step 1: Push Code to Git Repository

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit with video consultation feature"
```

2. Create a repository on GitHub/GitLab/Bitbucket

3. Push your code:
```bash
git remote add origin https://github.com/yourusername/telemedicine-ai-helper.git
git branch -M main
git push -u origin main
```

#### Step 2: Connect to Netlify

1. Log in to [Netlify](https://app.netlify.com)
2. Click "New site from Git"
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repositories
5. Select your TeleMedicine AI Helper repository

#### Step 3: Configure Build Settings

Netlify should automatically detect the settings, but verify:

- **Base directory**: Leave empty (or set to root)
- **Build command**: `npm run build`
- **Publish directory**: `dist`

#### Step 4: Set Environment Variables

1. Go to Site settings > Environment variables
2. Add the following variables:

```
VITE_AGORA_APP_ID = your_agora_app_id_here
```

Note: The demo version works without Agora App ID, but for full video functionality, you'll need to:
- Sign up at [Agora Console](https://console.agora.io/)
- Create a new project
- Copy the App ID

#### Step 5: Deploy

1. Click "Deploy site"
2. Netlify will build and deploy your application
3. You'll get a random URL like `https://amazing-name-123456.netlify.app`

### Method 2: Manual Deployment

#### Step 1: Build the Application

```bash
npm install
npm run build
```

#### Step 2: Deploy to Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Drag and drop the `dist` folder to the deploy area
3. Your site will be deployed instantly

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure DNS

### 2. HTTPS Configuration

- Netlify automatically provides HTTPS
- This is required for video consultation features (camera/microphone access)

### 3. Environment Variables for Production

Set these in Netlify dashboard under Site settings > Environment variables:

```
VITE_AGORA_APP_ID=your_production_agora_app_id
```

## Testing the Deployment

### 1. Basic Functionality Test

1. Visit your deployed site
2. Navigate through the application
3. Test user registration/login
4. Check dashboard functionality

### 2. Video Consultation Test

1. Navigate to a consultation page (e.g., `/consultation/123`)
2. Test the video consultation demo:
   - Click "Connect" button
   - Test video/audio controls
   - Verify participant display
   - Test chat functionality

### 3. Mobile Responsiveness

1. Test on mobile devices
2. Verify video consultation works on mobile
3. Check responsive design

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Error**: `npm install` fails
**Solution**: 
- Check Node.js version (should be 18+)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then `npm install`

#### 2. Video Consultation Not Working

**Error**: Camera/microphone access denied
**Solution**:
- Ensure site is served over HTTPS (Netlify provides this automatically)
- Check browser permissions
- Test on different browsers

#### 3. Routing Issues

**Error**: 404 on page refresh
**Solution**: 
- Ensure `netlify.toml` file is in the root directory
- Check the redirect rules are properly configured

#### 4. Environment Variables Not Working

**Error**: Agora App ID not found
**Solution**:
- Verify environment variables are set in Netlify dashboard
- Ensure variable names start with `VITE_`
- Redeploy after setting variables

### Debug Steps

1. Check build logs in Netlify dashboard
2. Use browser developer tools to check console errors
3. Verify network requests in browser dev tools
4. Test locally with `npm run build && npm run preview`

## Performance Optimization

### 1. Build Optimization

The application is already optimized with:
- Vite bundling and minification
- Tree shaking for unused code
- Asset optimization

### 2. Netlify Features

Enable these Netlify features for better performance:
- Asset optimization (automatic)
- Brotli compression (automatic)
- CDN distribution (automatic)

### 3. Caching

The `netlify.toml` file includes caching headers for static assets.

## Security Considerations

### 1. Environment Variables

- Never commit sensitive data to Git
- Use Netlify environment variables for secrets
- Rotate Agora App IDs regularly

### 2. HTTPS

- Netlify provides automatic HTTPS
- Required for video consultation features
- Ensures secure data transmission

### 3. Headers

Security headers are configured in `netlify.toml`:
- X-Frame-Options
- X-XSS-Protection
- Content Security Policy
- Permissions Policy for camera/microphone

## Monitoring and Analytics

### 1. Netlify Analytics

Enable Netlify Analytics for:
- Page views and traffic
- Performance metrics
- Error tracking

### 2. Application Monitoring

Consider adding:
- Error tracking (Sentry)
- Performance monitoring
- User analytics

## Continuous Deployment

### Automatic Deployments

With Git-based deployment:
- Pushes to main branch trigger automatic deployments
- Pull requests create deploy previews
- Branch deployments for testing

### Deploy Previews

- Test changes before merging
- Share preview links with team
- Automatic cleanup after merge

## Scaling Considerations

### 1. Netlify Limits

Free tier includes:
- 100GB bandwidth/month
- 300 build minutes/month
- 1 concurrent build

### 2. Agora Limits

Agora free tier includes:
- 10,000 minutes/month
- Up to 100 concurrent users

### 3. Upgrade Options

Consider upgrading for:
- Higher bandwidth limits
- More build minutes
- Advanced features

## Support and Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Community](https://community.netlify.com/)
- [Agora Documentation](https://docs.agora.io/en/)
- [Vite Documentation](https://vitejs.dev/)

## Deployment Checklist

- [ ] Code pushed to Git repository
- [ ] Netlify site created and connected
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Site deployed successfully
- [ ] HTTPS enabled (automatic)
- [ ] Custom domain configured (optional)
- [ ] Video consultation tested
- [ ] Mobile responsiveness verified
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Monitoring enabled

## Next Steps After Deployment

1. **Test thoroughly** on the live site
2. **Set up monitoring** and analytics
3. **Configure custom domain** if needed
4. **Enable Agora SDK** for full video functionality
5. **Implement user feedback** collection
6. **Plan for scaling** as user base grows

Your TeleMedicine AI Helper application is now ready for production use with full video consultation capabilities!

# Netlify Deployment Fix

## The "Page not found" error occurs because of routing configuration. Here's the fix:

### Option 1: Manual Deploy (Fastest Fix)

1. **Download Project Files**
   - Download this Replit workspace as ZIP
   - Extract to your computer

2. **Build the Project**
   ```bash
   npm install
   npm run build
   ```

3. **Deploy Correctly to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag ONLY the `dist/public` folder (not the whole project)
   - Make sure the `_redirects` file is included in the folder

### Option 2: GitHub + Netlify (Recommended)

1. **Push to GitHub**
   - Upload all files to your GitHub repository: https://github.com/EnVyxS/Portofolio

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com) and login
   - Click "Add new site" > "Import an existing project"
   - Choose GitHub and select your repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist/public`
   - Node version: 18

4. **Deploy**
   - Click "Deploy site"
   - Your portfolio will be live at `https://[random-name].netlify.app`

## Environment Variables (Optional)

If you want voice features, add in Netlify dashboard:
```
ELEVENLABS_API_KEY=your_api_key_here
```

## Custom Domain (Optional)

1. In Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Follow DNS configuration instructions

## Features After Deployment

✅ Responsive design (mobile, tablet, desktop)
✅ Interactive contact card with smooth animations
✅ Social media links with hover effects
✅ Dark Souls inspired UI theme
✅ Optimized performance and loading
✅ SEO friendly structure

Your portfolio is now production-ready and will load fast globally via Netlify's CDN!
# Deployment Guide - Step by Step

This guide walks you through deploying the Exam Engine to GitHub Pages in detail.

## Prerequisites

Before starting, you need:
1. GitHub account (free)
2. Git installed on your computer
3. Node.js 16+ installed
4. Basic familiarity with command line

## Step 1: Prepare Your Code Locally

### 1.1 Clone or Download the Repository

**Option A: Using Git (Recommended)**
```bash
git clone https://github.com/YOUR_USERNAME/exam-engine.git
cd exam-engine
```

**Option B: Manual Download**
1. Download the code as ZIP
2. Extract to a folder
3. Open terminal in that folder

### 1.2 Install Dependencies

```bash
npm install
```

This installs all required packages. It may take 1-2 minutes.

### 1.3 Test Locally

```bash
npm run dev
```

This starts the development server. Open `http://localhost:3000` in your browser.

Press `Ctrl+C` to stop the server.

### 1.4 Verify Tests Pass

```bash
npm test -- --run
```

Should show: "Test Files  2 passed"

## Step 2: Create GitHub Repository

### 2.1 Create New Repository on GitHub

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `exam-engine` (or your preferred name)
   - **Description**: "Offline-capable exam simulation engine"
   - **Public** (so it's accessible)
   - Leave other options as default
3. Click "Create repository"

### 2.2 Configure Repository Name in Code

If you used a different repository name, update these files:

**vite.config.ts** (line 6):
```typescript
base: '/YOUR_REPO_NAME/',
```

**index.html** (line 26):
```html
navigator.serviceWorker.register('/YOUR_REPO_NAME/sw.js')
```

## Step 3: Push Code to GitHub

### 3.1 Set Up Git Remote

From your project folder:

```bash
git init
git config user.email "your-email@example.com"
git config user.name "Your Name"
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/exam-engine.git
git push -u origin main
```

Replace:
- `your-email@example.com` with your email
- `Your Name` with your name
- `YOUR_USERNAME` with your GitHub username

### 3.2 Verify Push

Go to https://github.com/YOUR_USERNAME/exam-engine

You should see your code there.

## Step 4: Enable GitHub Pages

### 4.1 Repository Settings

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll left to **Pages** in sidebar

### 4.2 Configure Pages

Under "Build and deployment":
- **Source**: Select "GitHub Actions"
- Save (if needed)

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will handle deployment automatically.

## Step 5: Deploy

### 5.1 Trigger Deployment

Any push to the `main` branch triggers automatic deployment.

To manually trigger:
1. Go to **Actions** tab in GitHub
2. Click "Deploy to GitHub Pages" workflow
3. Click **Run workflow**
4. Select branch: `main`
5. Click **Run workflow**

### 5.2 Monitor Deployment

1. Go to **Actions** tab
2. Click the running workflow
3. Wait for the checkmark ✓

Deployment typically takes 1-3 minutes.

### 5.3 Access Your App

Once deployment completes, your app is live at:

```
https://YOUR_USERNAME.github.io/exam-engine/
```

## Step 6: Verify Deployment

### 6.1 Check App Works

1. Visit your URL above
2. Try importing the sample exam from `public/sample-exam.txt`
3. Take a practice exam
4. Verify offline mode works (turn off internet, reload page)

### 6.2 Check Service Worker

1. Open browser DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in left sidebar
4. Should show one active service worker

If not registered:
- Check console for errors
- Service Worker is optional - app works without it

## Step 7: Update and Redeploy

### 7.1 Making Changes

1. Edit code locally
2. Test with `npm run dev`
3. Run tests: `npm test`
4. Commit and push:

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### 7.2 Automatic Redeployment

GitHub Actions automatically:
- Runs tests
- Builds production version
- Deploys to GitHub Pages

Your app updates within 1-2 minutes of pushing.

## Troubleshooting

### App shows 404 after deployment

**Problem**: URL not working or blank page

**Solution**:
1. Wait 5 minutes after deployment
2. Hard refresh: Ctrl+Shift+Delete (Chrome) or Cmd+Shift+Delete (Mac)
3. Check Actions tab - is deployment complete?
4. Verify `base: '/repo-name/'` in `vite.config.ts` matches your repo name

### GitHub Actions fails

**Problem**: Red X in Actions tab

**Solution**:
1. Click the failed workflow
2. Click the failed job
3. Scroll to see the error message
4. Common issues:
   - Tests failing: Run `npm test` locally to debug
   - Build error: Check for TypeScript errors with `npm run build`
5. Fix and push again

### App shows blank page

**Problem**: Page is white/empty

**Solution**:
1. Open DevTools (F12)
2. Check **Console** tab for errors
3. Check **Network** tab - are files loading?
4. Common fixes:
   - Clear browser cache
   - Try different browser
   - Check base path in vite.config.ts

### Service Worker won't register

**Problem**: App works but service worker not showing

**Solution** (optional - not required):
1. This is optional for offline support
2. App works fine without it
3. If needed:
   - Check `index.html` path is correct
   - Check `public/sw.js` file exists
   - Try clearing browser cache
   - Restart browser

### Can't import exams or share links

**Problem**: Import fails or sharing broken

**Solution**:
1. Check IndexedDB is enabled in browser
2. Not in private/incognito mode?
3. Try different browser
4. Check console (F12) for errors
5. Refresh page and try again

## Advanced Customization

### Custom Domain

To use your own domain instead of `github.io`:

1. Buy domain (GoDaddy, Namecheap, etc.)
2. In repo **Settings → Pages**:
   - Under "Custom domain", enter `yourdomain.com`
   - Check "Enforce HTTPS"
3. Configure DNS records (domain registrar instructions)
4. Update `vite.config.ts` base path if needed
5. Redeploy

### Custom Styling

Edit `src/App.css`:

```css
:root {
  --primary-color: #0066cc;  /* Change this to your color */
  --secondary-color: #666;
  /* ... */
}
```

Redeploy with `git push origin main`.

### Dark Mode (Advanced)

Add to `src/App.css`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --primary-color: #4da6ff;
    --secondary-color: #aaa;
    --light-bg: #222;
    --text-color: #eee;
  }
}
```

### Environment Variables

Create `.env.local`:
```
VITE_APP_TITLE=My Exam App
```

Reference in code: `import.meta.env.VITE_APP_TITLE`

## Performance Optimization

### 1. Reduce Bundle Size

Comment out unused features in `src/App.tsx`

### 2. Enable Compression

GitHub Pages automatically gzips files.

### 3. Image Optimization

Optimize images before uploading:
- Use online tools: TinyPNG, Squoosh
- Keep under 500KB per image

## Security Checklist

✓ No backend (no server vulnerabilities)
✓ All data stored locally (no data sent to servers)
✓ HTTPS enforced (if custom domain)
✓ No API keys exposed
✓ No external dependencies needed

## Monitoring

### GitHub Pages Status

- Dashboard: https://www.githubstatus.com
- Check **Pages** service

### Analytics (Optional)

Add Google Analytics or similar to `index.html` if desired.

## Rollback (if needed)

To revert to previous version:

```bash
git log
git revert COMMIT_HASH
git push origin main
```

GitHub Pages redeploys automatically.

## Support

If deployment still fails:

1. **Check Docs**:
   - GitHub Pages docs: https://pages.github.com
   - Vite docs: https://vitejs.dev

2. **Check Logs**:
   - GitHub Actions > Your Workflow > View logs
   - Browser Console (F12)
   - Network tab for failed requests

3. **Test Locally**:
   ```bash
   npm run build
   npm run preview
   ```

4. **Clear Cache**:
   - Browser: Ctrl+Shift+Delete
   - Git: `git clean -fd`

## FAQ

**Q: How long does deployment take?**
A: Usually 1-3 minutes. Check Actions tab for progress.

**Q: Can I use GitHub Pages for free?**
A: Yes! GitHub Pages is completely free for public repositories.

**Q: Can I update the app later?**
A: Yes! Just push changes to main branch. It auto-deploys.

**Q: Is my data private?**
A: Yes! All data stays on your device. Nothing sent to servers.

**Q: Can I share exams?**
A: Yes! Use the Share Link feature - creates a special URL.

**Q: Works offline?**
A: Yes! After first load, works completely offline.

## Next Steps

After successful deployment:

1. ✓ Visit your app URL
2. ✓ Import the sample exam
3. ✓ Take a practice test
4. ✓ Share with friends/classmates
5. ✓ Start using for real exams!

## Continuous Improvement

Consider these enhancements:

1. **Add more parsers** for different exam formats
2. **Custom themes** for organizations
3. **Export features** (PDF reports, etc.)
4. **Mobile app** using React Native
5. **Team features** for instructors
6. **More analytics** and visualizations

Enjoy your offline exam engine! 📚✨

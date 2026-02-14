# Configuration & Troubleshooting Reference

## Core Configuration Files

### vite.config.ts
The Vite build configuration. Key settings:

```typescript
base: '/exam-engine/'    // Change to your GitHub Pages path
port: 3000               // Dev server port
outDir: 'dist'           // Build output directory
```

### tsconfig.json
TypeScript configuration. Standard settings for React + Vite.

### vitest.config.ts
Test configuration using Vitest.

### package.json
Project dependencies and scripts.

## Environment Variables

Create `.env.local` for local settings (won't be committed):

```
VITE_APP_TITLE=Custom Exam Engine Name
VITE_API_URL=http://localhost:3000/api
```

Access in code:
```typescript
import.meta.env.VITE_APP_TITLE
```

## IndexedDB Schema

The app uses IndexedDB with this structure:

```
Database: exam-engine-db

Stores:
├── examSets
│   ├── id (primary key)
│   └── data...
├── examSessions
│   ├── id (primary key)
│   ├── Index: examSetId
│   └── data...
├── examResults
│   ├── id (primary key)
│   ├── Index: examSetId
│   ├── Index: timestamp
│   └── data...
├── questionStats
│   ├── id (primary key)
│   ├── Index: examSetId
│   └── data...
└── attemptRecords
    ├── id (primary key)
    ├── Index: examSetId
    └── data...
```

## Clearing Local Data

If you need to reset everything:

**Via Browser DevTools:**
1. Open F12 (DevTools)
2. Go to **Application** tab
3. Under **Storage**, click **IndexedDB**
4. Right-click `exam-engine-db`
5. Select **Delete**
6. Refresh page

**Via Code:**
```javascript
// In browser console
indexedDB.deleteDatabase('exam-engine-db')
```

## Service Worker Control

### Enable SW Logging

Edit `public/sw.js`, add:

```javascript
console.log('[SW] Installing...')
console.log('[SW] Activated')
// etc.
```

### Clear Service Worker Cache

```javascript
// In browser console
caches.keys().then(names => {
  names.forEach(name => caches.delete(name))
})
```

### Unregister Service Worker

```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister())
})
```

## PDF Processing Configuration

In `parsers.ts`, the PDF worker is set to:

```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
```

For offline use or custom hosting, download `pdf.worker.js` and use local path:

```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = '/exam-engine/pdf.worker.min.js'
```

## Styling Reference

### CSS Variable Usage

All colors use CSS variables in `:root`:

```css
:root {
  --primary-color: #0066cc;      /* Main blue */
  --secondary-color: #666;       /* Gray */
  --success-color: #28a745;      /* Green */
  --warning-color: #ffc107;      /* Yellow */
  --danger-color: #dc3545;       /* Red */
  --info-color: #17a2b8;         /* Cyan */
  --light-bg: #f8f9fa;           /* Light gray bg */
  --border-color: #ddd;          /* Borders */
  --text-color: #333;            /* Text */
}
```

To customize, update these values in `src/App.css`.

### Responsive Breakpoints

Mobile-first design with breakpoint at 768px:

```css
@media (max-width: 768px) {
  /* Mobile styles */
}
```

## Performance Tips

### Development Mode Slowness

If `npm run dev` is slow:
1. Close other apps
2. Run `npm install` again to rebuild
3. Restart terminal
4. Update Node.js to latest LTS

### Large PDF Performance

PDFs >30MB may process slowly:
1. Extract text first using online tool
2. Split PDF into smaller files
3. Convert PDF to DOCX or TXT

### High Memory Usage

If app uses lots of RAM:
1. Close other browser tabs
2. Clear browser cache (Ctrl+Shift+Delete)
3. Reduce number of questions per exam

## Build Optimization

### Reduce Bundle Size

In `src/App.tsx`, comment out unused pages:

```typescript
// if (state.currentPage === 'practice' && state.currentExamSet && (
//   <PracticePage {...} />
// ))
```

### Tree Shaking

Ensure imports are specific:

```typescript
// Good - tree shakeable
import { shuffleArray } from './utils'

// Bad - imports everything
import * as utils from './utils'
```

## Testing Setup

### Running Tests

```bash
npm test                 # Watch mode
npm test -- --run       # Single run
npm run test:ui         # UI mode
npm test -- --coverage  # With coverage
```

### Adding Tests

Create `.test.ts` file next to component:

```typescript
import { describe, it, expect } from 'vitest'

describe('Feature', () => {
  it('should do something', () => {
    expect(true).toBe(true)
  })
})
```

### Debugging Tests

```bash
node --inspect-brk ./node_modules/.bin/vitest --run
```

## Git Workflow

### Ignoring Files

`.gitignore` already configured for:
- `node_modules/`
- `dist/`
- `.env.local`
- `*.log`
- And more

### Commit Message Format

Keep messages clear:
```
git commit -m "Add analytics dashboard"
git commit -m "Fix exam timer bug"
git commit -m "Improve question parser"
```

### Branches

For teams, use branches:

```bash
git checkout -b feature/new-parser
# ... make changes ...
git add .
git commit -m "Add inline QA parser"
git push origin feature/new-parser
```

Then create Pull Request on GitHub.

## Docker (Optional)

To run in Docker:

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

Build: `docker build -t exam-engine .`
Run: `docker run -p 3000:3000 exam-engine`

## API Integration (if needed later)

If you want to add a backend:

```typescript
// In utils.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function api(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, options)
  return response.json()
}
```

Usage:
```typescript
const results = await api('/api/results/123')
```

## Debugging Tips

### Enable Verbose Logging

Add to `src/App.tsx`:

```typescript
useEffect(() => {
  console.log('Current state:', state)
}, [state])
```

### Monitor IndexedDB Changes

```javascript
// In console
window.indexedDB.databases().then(dbs => console.log(dbs))
```

### Check Network Requests

1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh page
4. Filter by "XHR" or "Fetch"

### Performance Profile

```javascript
// In console
performance.mark('start')
// ... do something ...
performance.mark('end')
performance.measure('duration', 'start', 'end')
console.table(performance.getEntriesByName('duration'))
```

## Backup & Export

### Export Exam Data

```javascript
// In console
const dbs = await Promise.all([
  idb.get('examSets'),
  idb.get('examResults'),
  idb.get('questionStats')
])
console.save(JSON.stringify(dbs, null, 2), 'exam-backup.json')
```

### Import from Backup

Manually parse JSON and create objects via UI.

## Migration Guide

If updating from older version:

1. The DB auto-migrates on version change
2. Old data is preserved
3. New stores are created
4. Clear cache if issues: Ctrl+Shift+Delete

## Common Errors & Fixes

### "Module not found"

```
Error: Cannot find module './parsers'
```

**Fix**: Check file spelling and path (case-sensitive on Linux)

### "IndexedDB quota exceeded"

**Fix**: Delete old exams/results in app

### "Service Worker failed to register"

**Fix**: Not critical, app works without it. Check console for details.

### "PDF worker not found"

**Fix**: Update PDF worker path in `parsers.ts`

### "Memory exceeded"

**Fix**: Split exams, close other apps, restart browser

### "Offline not working"

**Fix**: SW is optional. Ensure caching settings allow offline.

## Resources

- **Vite**: https://vitejs.dev
- **React**: https://react.dev
- **TypeScript**: https://typescriptlang.org
- **IndexedDB**: https://developer.mozilla.org/docs/Web/API/IndexedDB_API
- **PWA**: https://web.dev/progressive-web-apps/
- **GitHub Pages**: https://pages.github.com

## Getting Help

1. Check console (F12) for errors
2. Review relevant documentation
3. Search GitHub Issues
4. Create new issue with:
   - Browser & OS
   - Error message
   - Steps to reproduce
   - Screenshot/log

## Version Tracking

Current version: **1.0.0**

Version format: MAJOR.MINOR.PATCH
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

---

**Last Updated**: February 2026
**Maintained By**: Community
**License**: MIT

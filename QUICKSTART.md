# Quick Start Guide

## For Users (Non-Technical)

### First Time Using Exam Engine?

1. **Go to the app**: Visit `https://YOUR_USERNAME.github.io/exam-engine/`
2. **Import your first exam**:
   - Click "Import New Exam"
   - Upload a PDF, Word document, or text file with questions
   - Select the format (usually "Numbered Questions with Options")
   - Review and save
3. **Take an exam**:
   - Click "My Exams"
   - Click "Start Exam"
   - Choose settings (number of questions, timed/untimed)
   - Answer questions and submit
4. **See your results**:
   - Get instant feedback on your score
   - See breakdown by question type
   - Review flagged questions

### Sharing Exams

Want to share with classmates? Two ways:

**Method 1: Share Link (Easy)**
- Click "Link" button on an exam
- This copies a URL to clipboard
- Share the URL - recipients click it and exam auto-imports

**Method 2: Share Code (Manual)**
- Click "Share" button
- Copy the code shown
- Recipients paste it in Import → "Paste Share Code"

### Going Offline

The app works completely offline after first use:
- Download an exam once (it's stored on your device)
- Use the app without internet connection
- Progress auto-saves locally
- Sync when you go back online

## For Developers

### Setup

```bash
# Clone repo
git clone <repo-url>
cd exam-engine

# Install and run locally
npm install
npm run dev

# Visit http://localhost:3000
```

### Project Structure

```
src/
  pages/       - React components for each screen
  App.tsx      - Main application
  types.ts     - TypeScript definitions
  db.ts        - IndexedDB operations
  parsers.ts   - Document parsing logic
  utils.ts     - Helper functions
  analytics.ts - Stats and trends
  App.css      - All styling
```

### Common Tasks

**Add a new question type:**
1. Update `QuestionType` in `types.ts`
2. Update parser in `parsers.ts`
3. Update exam mode UI in `ExamModePage.tsx`

**Change styling:**
- Edit `src/App.css`
- Variables at top (colors, fonts, etc.)
- Mobile responsive section at bottom

**Add a feature:**
1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Add tests in `.test.ts` file
4. Run `npm test` to verify

**Deploy changes:**
1. Commit to GitHub: `git add . && git commit -m "..."` && `git push`
2. GitHub Actions auto-builds and deploys
3. App updates at your GitHub Pages URL (usually within 1-2 minutes)

### Testing

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# UI mode
npm run test:ui

# Coverage
npm test -- --coverage
```

### Build for Production

```bash
# Creates optimized build in dist/
npm run build

# Preview build
npm run preview
```

## Exam Format Specifications

### Parser 1: Numbered Questions with Options

```
1. Question text here?
a) Option A text
b) Option B text  
c) Option C text
d) Option D text
Answer: b
Explanation: Why option B is correct

2. Next question?
a) Option 1
b) Option 2
c) Option 3
Answer: a
```

**Rules:**
- Question must start with number and period: `1. `
- Options must be `a)`, `b)`, `c)`, `d)` 
- Answer must be: `Answer: a` (single letter)
- Explanation is optional: `Explanation: ...`
- Blank lines between questions are OK

### Parser 2: Inline Q&A

```
Q: What is photosynthesis?
A: a) Plant respiration, b) Converting light to energy, c) Water absorption
Correct: b
Explanation: Photosynthesis converts light energy into chemical energy

Q: What is the largest planet?
A: a) Saturn, b) Jupiter, c) Mars
Correct: b
```

**Rules:**
- Line must start with `Q: `
- Line must start with `A: ` with options comma-separated
- Correct answer: `Correct: b` (single letter)
- Explanation: `Explanation: ...` (optional)

### Parser 3: Two-File Format

**File 1: questions.txt**
```
1. First question?
a) Option 1
b) Option 2
c) Option 3
d) Option 4

2. Second question?
a) Answer 1
b) Answer 2
```

**File 2: answers.txt**
```
1. Answer: b
Explanation: Why B is correct

2. Answer: a
Explanation: Why A is correct
```

## Troubleshooting

### "No questions found"
- Check file format matches selected parser
- Remove extra blank lines
- Ensure answer options have correct letters (a, b, c, d)

### App freezes on large PDF
- PDFs >50MB may be slow (try PDF text extraction tool first)
- Break into multiple files
- Convert PDF to text first

### Data not saving
- Check browser isn't in private/incognito mode
- Verify IndexedDB is enabled
- Check device storage isn't full

### Can't share exam
- Ensure exam is saved first
- Try refreshing page
- Use "Share Code" method if "Link" fails

### Service Worker issues
- Clear browser cache
- Restart browser
- Service Worker is optional - app works without it

## Performance Tips

1. **For large question sets**: Divide into multiple exams (100 questions each)
2. **For images**: Compress before importing
3. **For PDFs**: Extract text first if parsing is slow
4. **For storage**: Delete old attempts if running low on space

## Browser Compatibility

| Browser | Min Version | Notes |
|---------|------------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |

## Tips for Best Experience

1. **Use numbered format** if unsure - most compatible
2. **Test import** with 5 questions first before importing large files
3. **Use Firefox/Chrome** for best compatibility
4. **Enable service worker** for offline support
5. **Export answers** from your LMS as text/PDF first

## Advanced Configuration

### Customize GitHub Pages URL

If you want your app at `yoursite.com/exams` instead of GitHub Pages default:

1. In `vite.config.ts`, change `base` to your path
2. Update service worker path in `index.html`
3. Configure custom domain in repo settings

### Add Custom Styling

Edit `src/App.css` CSS variables at top:
```css
:root {
  --primary-color: #0066cc;
  --secondary-color: #666;
  /* etc */
}
```

### Environment Variables

Create `.env.local`:
```
VITE_APP_TITLE=My Exam App
```

## Support & Help

- Check README.md for full documentation
- Review GitHub Issues for common problems
- Check browser console (F12) for errors
- Try clearing cache and reloading
- Test in different browser if issues persist

## What's Next?

After importing your first exam:
1. Try taking a timed exam
2. Check analytics to see trends
3. Use spaced repetition for weak questions
4. Share exam with classmates
5. Import more exams and track progress!

Happy studying! 📚

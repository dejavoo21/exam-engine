# Exam Engine - Offline-Capable Exam Simulation Platform

An offline-capable, browser-based exam simulation engine built with React, Vite, and TypeScript. Study anywhere, anytime, without requiring downloads or installation.

## Features

### Core Features
- 📚 **Universal Import**: Support for PDF, DOCX, and TXT formats
- 🔄 **Multiple Parser Profiles**: 
  - Numbered Questions with Options
  - Inline Q&A format
  - Two-file format (questions + answers)
- ✏️ **Preview & Edit**: Built-in editor to fix parsed questions, add images, and set explanations
- 🖼️ **Image Support**:
  - Extract embedded images from DOCX files
  - Capture PDF page snapshots
  - Manually attach/remove images to any question
  - Filter questions by image presence

### Exam Mode
- ⏱️ **Flexible Timing**: Timed exams with countdown or untimed practice
- 🎯 **Question Selection**: Choose number of questions, types, or specific ranges
- 🔀 **Randomization**: Shuffle questions and answer options
- 🚩 **Flag for Review**: Mark difficult questions for later review
- 📊 **Progress Tracking**: Visual progress indicator with real-time autosave
- ⚠️ **Time Warnings**: Alert when time is running out
- 🔔 **Auto-Submit**: Automatically submit when time expires

### Results & Analytics
- 📈 **Detailed Score Breakdown**: By question type and image presence
- 📊 **Analytics Dashboard**: 
  - Attempt history (last 10)
  - Score trends with visualization
  - Weak questions (missed 2+ times)
  - Accuracy by question type
- 🔄 **Spaced Repetition**: 
  - Practice mode prioritizes missed and not-recently-seen questions
  - Customizable filters (only wrong, only flagged, only image questions)

### Sharing
- 🔗 **Share via URL**: Compressed link sharing with URL fragment encoding
- 📋 **Share Code**: Text-based code for manual copying/pasting
- ⚡ **No Downloads**: Import shared exams directly into your browser

### Technical
- 🔒 **Fully Offline**: Works without internet connection
- 💾 **Local Storage**: IndexedDB for persistent data
- 🚀 **No Installation**: Pure web app, no downloads or app prompts
- 📱 **Responsive Design**: Works on desktop and mobile browsers
- ⚙️ **Service Worker**: Optional caching for offline support

## Tech Stack

- **Frontend Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **Language**: TypeScript 5.3
- **Storage**: IndexedDB (via idb library)
- **PDF Processing**: pdfjs-dist
- **DOCX Processing**: mammoth
- **Compression**: lz-string
- **Testing**: Vitest
- **Deployment**: GitHub Pages via GitHub Actions

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Git account with GitHub

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/exam-engine.git
   cd exam-engine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:3000`

4. **Run tests**
   ```bash
   npm test
   # With UI
   npm run test:ui
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Deployment to GitHub Pages

### Step 1: Repository Setup

1. Create a new GitHub repository named `exam-engine` (or any name you prefer)
2. Push the code to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/exam-engine.git
   git push -u origin main
   ```

### Step 2: Enable GitHub Pages

1. Go to your repository settings
2. Scroll to "GitHub Pages" section
3. Select "Deploy from a branch" or "GitHub Actions"
4. If using branch, select the `gh-pages` branch as source

### Step 3: Configure for Your Repository

The `vite.config.ts` is pre-configured with `base: '/exam-engine/'`. If you use a different repository name:

1. Update `vite.config.ts`:
   ```typescript
   export default defineConfig({
     ...
     base: '/YOUR_REPO_NAME/',
     ...
   })
   ```

2. Update `index.html` service worker path:
   ```html
   navigator.serviceWorker.register('/YOUR_REPO_NAME/sw.js')
   ```

3. Update `.github/workflows/deploy.yml` if needed (it should work automatically)

### Step 4: Deploy

The GitHub Actions workflow will automatically:
- Build on every push to main/master
- Run tests
- Deploy to GitHub Pages

View your app at: `https://YOUR_USERNAME.github.io/exam-engine/`

### Manual Deployment (if needed)

```bash
npm run build
npm run preview
```

Then manually push the `dist` folder to a `gh-pages` branch:
```bash
git subtree push --prefix dist origin gh-pages
```

## Usage Guide

### Importing Exams

1. Click **"Import New Exam"**
2. Upload a PDF, DOCX, or TXT file
3. Select the appropriate parser:
   - **Numbered Questions**: Format with numbered questions and lettered options
   - **Inline Q&A**: Inline question and answer format
   - **Two-File**: Separate questions and answers files
4. Review and edit questions as needed
5. Save to your exam library

### Starting an Exam

1. Go to **"My Exams"**
2. Click **"Start Exam"** on an exam
3. Configure:
   - Number of questions
   - Question types to include
   - Shuffle options
   - Timer settings
4. Click **"Start Exam"**

### During the Exam

- Select answers by clicking options
- Use **"Flag"** to mark difficult questions
- Use **"Next/Previous"** to navigate
- Monitor time remaining and progress
- Click **"Submit Exam"** when done

### Reviewing Results

- View your score and detailed breakdown
- See accuracy by question type and image presence
- Review flagged questions

### Analytics

- Track performance trends over 10 attempts
- Identify weak questions (missed 2+ times)
- View question-specific statistics

### Spaced Repetition Practice

- Practice mode automatically prioritizes missed questions
- Filter by question type, image presence, or flag status
- Improve weak areas

### Sharing Exams

- Click **"Share"** to get a shareable code
- Click **"Link"** to get a shareable URL
- Recipients can import directly without downloads

## Exam Format Examples

### Numbered Questions Format
```
1. What is the capital of France?
a) London
b) Berlin
c) Paris
d) Madrid
Answer: c
Explanation: Paris is the capital of France and the most populous city in the country.

2. What is 2 + 2?
a) 3
b) 4
c) 5
d) 6
Answer: b
```

### Inline Q&A Format
```
Q: What is the largest planet?
A: a) Mercury, b) Venus, c) Jupiter, d) Saturn
Correct: c
Explanation: Jupiter is the largest planet in our solar system.

Q: What is photosynthesis?
A: a) Plant respiration, b) Converting light to chemical energy, c) Water absorption, d) Root growth
Correct: b
```

### Two-File Format
**questions.txt:**
```
1. What color is the sky?
a) Blue
b) Red
c) Green
d) Yellow

2. What is 5 * 5?
a) 10
b) 20
c) 25
d) 30
```

**answers.txt:**
```
1. Answer: a
Explanation: The sky appears blue due to Rayleigh scattering.

2. Answer: c
Explanation: 5 multiplied by 5 equals 25.
```

## Key Concepts

### Questions
Each question can have:
- Prompt (question text)
- Options (multiple choice answers)
- Type (MCQ, True/False, Short Answer)
- Explanation (shown after exam)
- Images (optional)

### Exam Sessions
- Tracks selected questions, answers, and flags
- Autosaves progress to IndexedDB
- Warns on unsaved changes

### Results
- Stores scores and attempt history
- Tracks performance by question type
- Tracks performance by image presence
- Enables trend analysis

### Analytics
- Per-question statistics (times attempted, correct, last seen)
- Weak question identification
- Trend visualization
- Spaced repetition prioritization

## Offline Capability

The app works completely offline through:
- **IndexedDB**: All data stored locally in browser
- **Service Worker**: Optional caching of static assets
- **No Backend**: Zero server dependency

Data syncs only when explicitly sharing (via encoded URLs).

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## File Structure

```
exam-engine/
├── public/
│   └── sw.js              # Service worker
├── src/
│   ├── pages/             # Page components
│   ├── App.tsx            # Main app component
│   ├── App.css            # Global styles
│   ├── main.tsx           # Entry point
│   ├── types.ts           # TypeScript types
│   ├── db.ts              # IndexedDB operations
│   ├── parsers.ts         # Document parsers
│   ├── utils.ts           # Utility functions
│   ├── analytics.ts       # Analytics logic
│   ├── parsers.test.ts    # Parser tests
│   └── utils.test.ts      # Utility tests
├── index.html             # HTML template
├── package.json
├── vite.config.ts         # Vite configuration
├── vitest.config.ts       # Test configuration
├── tsconfig.json
└── .github/
    └── workflows/
        └── deploy.yml     # GitHub Actions workflow
```

## Development Workflow

### Adding Features

1. Create components in `src/pages/` or update `src/` utilities
2. Update types in `src/types.ts` if needed
3. Write tests in `*.test.ts` files
4. Run `npm test` to verify
5. Run `npm run build` to check build
6. Commit and push to main

### Debugging

- Use browser DevTools console
- Check IndexedDB data in Application tab
- Enable service worker logging in `public/sw.js`

## Performance Considerations

- PDF files are parsed in memory (large files may be slow)
- IndexedDB limits: ~50MB per domain
- Service worker caching is optional and non-intrusive
- App works fine without service worker

## Security & Privacy

- All data stored locally in browser
- No data sent to servers (except for optional sharing links)
- Sharing uses client-side compression
- No analytics tracking (optional local analytics only)
- No ads or external tracking

## Troubleshooting

### Import fails
- Check file format matches selected parser
- Try different parser profile
- Ensure questions follow expected format

### App not saving
- Check browser allows IndexedDB (not private mode)
- Verify storage quota not exceeded
- Try clearing cache and reloading

### Share link doesn't work
- Copy entire URL including fragment (#import=...)
- Ensure recipient has JavaScript enabled
- Try "Share Code" method instead

### Offline not working
- Service worker may not have registered
- Check browser console for errors
- Some browsers disable offline in private mode

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Push and create a Pull Request
5. Ensure tests pass

## License

MIT License - Feel free to use and modify

## Support

For issues, questions, or suggestions:
1. Check GitHub Issues
2. Create a new issue with details
3. Include browser and OS information

## Future Roadmap

- [ ] Audio/video support for questions
- [ ] Collaborative exams
- [ ] Advanced analytics with charts
- [ ] Mobile app (React Native)
- [ ] Import from LMS systems
- [ ] Markdown support in explanations
- [ ] Dark mode
- [ ] Multi-language support

## Credits

Built with:
- React & Vite for fast development
- pdfjs-dist for PDF processing
- mammoth for DOCX parsing
- lz-string for compression
- Vitest for testing

## Version

v1.0.0 - Initial release

---

**Happy studying!** 📚✨

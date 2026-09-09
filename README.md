# 🌐 LingoFlux - Modern Language Translation Web App

A clean, responsive, single-page language translation web application built with vanilla HTML5, modern CSS3, and JavaScript. **No paid API keys required** — runs completely client-side with multi-provider fallback.

![LingoFlux Banner](https://img.shields.io/badge/Language-Translation%20Tool-4f46e5?style=for-the-badge&logo=googletranslate&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/Modern-CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-success?style=for-the-badge)

---

## ✨ Features

- 🔍 **Auto-detect & Multi-Language Support**:
  - Automatically identifies the input language.
  - Supports 16+ major global languages: English, Spanish, French, German, Italian, Portuguese, Russian, Chinese (Simplified), Japanese, Korean, Arabic, Hindi, Dutch, Turkish, Polish, Vietnamese, Swedish, Greek.
- ⚡ **Zero-Key Multi-Engine Translation Service**:
  - **Primary**: Google Translate unofficial client endpoint (`client=gtx`).
  - **Fallback 1**: MyMemory Translated API (`api.mymemory.translated.net`).
  - **Fallback 2**: Public LibreTranslate instances.
  - Works straight out of the box with zero setup or API credentials.
- 🔄 **Language & Text Swapping**:
  - Instant swap button to exchange source and target languages (and active text).
- 🔊 **Text-to-Speech (TTS)**:
  - Built-in speech synthesis (`window.speechSynthesis`) with voice auto-matching for target language locales.
  - Visual animated speaker pulses during playback with click-to-stop capability.
- 📋 **Copy to Clipboard**:
  - One-click copy with instant visual checkmark confirmation and floating toast notification.
- 🎨 **Modern Aesthetics & Responsive Design**:
  - Curated glassmorphism design with ambient color glows.
  - Full **Dark Mode / Light Mode** toggle with persistent user preference in `localStorage`.
  - Side-by-side translation layout on desktop/tablets, stacked on mobile devices.
- ⌨️ **Keyboard Shortcut**:
  - Press `Ctrl + Enter` (or `Cmd + Enter`) to translate immediately.
- 📜 **Translation History**:
  - Automatically saves recent translations to `localStorage`.
  - Click any past translation to restore both source and target texts.
  - Clear history with a single click.
- 🛡️ **Graceful Error Handling**:
  - User-friendly visual alert banner for empty inputs, rate limits, or network interruptions.

---

## 📁 Project Structure

```
Language Translation Tool/
│
├── index.html          # Semantic HTML5 single-page application structure
├── css/
│   └── style.css       # Design system, CSS variables, glassmorphism, responsive grid & dark mode
├── js/
│   ├── languages.js    # Language metadata, ISO codes, and TTS locale mappings
│   ├── translator.js   # Multi-engine translation client with automatic failover
│   └── app.js          # UI controller, event listeners, TTS, clipboard, history & theme
├── .gitignore          # Standard repository ignore rules
└── README.md           # Documentation and run instructions
```

---

## 🚀 How to Run Locally

Because LingoFlux uses vanilla HTML, CSS, and JavaScript with no build steps, running it locally is straightforward.

### Method 1: Direct File Open (Fastest)
Simply double-click `index.html` or drag and drop `index.html` into any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, Brave).

### Method 2: Local Python Server (Recommended)
If you have Python installed:

```bash
# In the project root directory:
python -m http.server 8000
```
Then open your browser at:
```
http://localhost:8000
```

### Method 3: Node.js / `npx serve`
If you have Node.js installed:

```bash
npx serve .
```

### Method 4: VS Code Live Server
If you use Visual Studio Code, right-click `index.html` and select **"Open with Live Server"**.

---

## 🌐 Deploy to GitHub Pages

To host this tool for free on GitHub Pages:

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `lingoflux` or `language-translation-tool`).
2. Initialize and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Language Translation Tool"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** &rarr; **Pages**.
   - Under **Build and deployment** &gt; **Branch**, select `main` and `/ (root)`.
   - Click **Save**.
4. Your site will be live at `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/` in seconds!

---

## 🛠️ Browser Compatibility

| Feature | Chrome / Edge | Firefox | Safari | Opera |
|---|---|---|---|---|
| **Translation Fetch** | ✅ | ✅ | ✅ | ✅ |
| **SpeechSynthesis (TTS)** | ✅ | ✅ | ✅ | ✅ |
| **Clipboard API** | ✅ | ✅ | ✅ | ✅ |
| **Dark Theme Persistence** | ✅ | ✅ | ✅ | ✅ |

---

## 📄 License

Open-source under the [MIT License](https://opensource.org/licenses/MIT). Free for personal and educational use.

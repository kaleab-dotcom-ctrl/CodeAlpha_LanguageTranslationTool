/**
 * LingoFlux - Main Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const sourceLangSelect = document.getElementById('sourceLangSelect');
  const targetLangSelect = document.getElementById('targetLangSelect');
  const btnSwapLang = document.getElementById('btnSwapLang');

  const sourceText = document.getElementById('sourceText');
  const targetText = document.getElementById('targetText');
  const sourceCharCount = document.getElementById('sourceCharCount');
  const targetCharCount = document.getElementById('targetCharCount');

  const btnTranslate = document.getElementById('btnTranslate');
  const btnClearSource = document.getElementById('btnClearSource');
  const btnSourceSpeak = document.getElementById('btnSourceSpeak');
  const btnTargetSpeak = document.getElementById('btnTargetSpeak');
  const btnCopyTarget = document.getElementById('btnCopyTarget');
  const iconCopy = document.getElementById('iconCopy');
  const iconCheck = document.getElementById('iconCheck');

  const panelLoader = document.getElementById('panelLoader');
  const alertBanner = document.getElementById('alertBanner');
  const alertMessage = document.getElementById('alertMessage');
  const btnAlertClose = document.getElementById('btnAlertClose');

  const detectedBadge = document.getElementById('detectedBadge');
  const engineBadge = document.getElementById('engineBadge');

  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const iconSun = document.getElementById('iconSun');
  const iconMoon = document.getElementById('iconMoon');

  const historyList = document.getElementById('historyList');
  const btnClearHistory = document.getElementById('btnClearHistory');
  const toastNotice = document.getElementById('toastNotice');

  // App State
  let currentSpeakingButton = null;
  const HISTORY_STORAGE_KEY = 'lingoflux_history_v1';
  const THEME_STORAGE_KEY = 'lingoflux_theme_v1';

  /* ==========================================================================
     1. Initialization & Language Options
     ========================================================================== */

  function populateLanguageSelects() {
    sourceLangSelect.innerHTML = '';
    targetLangSelect.innerHTML = '';

    SUPPORTED_LANGUAGES.forEach(lang => {
      // Source select option
      const srcOpt = document.createElement('option');
      srcOpt.value = lang.code;
      srcOpt.textContent = `${lang.flag} ${lang.name}`;
      sourceLangSelect.appendChild(srcOpt);

      // Target select option (skip source-only such as 'auto')
      if (!lang.sourceOnly) {
        const tgtOpt = document.createElement('option');
        tgtOpt.value = lang.code;
        tgtOpt.textContent = `${lang.flag} ${lang.name}`;
        targetLangSelect.appendChild(tgtOpt);
      }
    });

    // Defaults: Auto-detect -> Spanish (or French)
    sourceLangSelect.value = 'auto';
    targetLangSelect.value = 'es';
    updateSwapButtonState();
  }

  function updateSwapButtonState() {
    // If source is auto-detect, allow swap only if target is valid
    btnSwapLang.title = sourceLangSelect.value === 'auto' 
      ? 'Select a specific source language to swap' 
      : 'Swap source and target languages';
  }

  /* ==========================================================================
     2. Theme Management (Dark / Light)
     ========================================================================== */

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    if (theme === 'dark') {
      iconSun.style.display = 'block';
      iconMoon.style.display = 'none';
    } else {
      iconSun.style.display = 'none';
      iconMoon.style.display = 'block';
    }
  }

  btnThemeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  /* ==========================================================================
     3. Character Counters & Input Handlers
     ========================================================================== */

  function updateSourceCharCount() {
    const len = sourceText.value.length;
    sourceCharCount.textContent = `${len.toLocaleString()} / 5,000`;
  }

  function updateTargetCharCount() {
    const len = targetText.value.length;
    targetCharCount.textContent = `${len.toLocaleString()} chars`;
  }

  sourceText.addEventListener('input', () => {
    updateSourceCharCount();
    hideAlert();
  });

  btnClearSource.addEventListener('click', () => {
    sourceText.value = '';
    targetText.value = '';
    updateSourceCharCount();
    updateTargetCharCount();
    detectedBadge.classList.remove('active');
    engineBadge.textContent = '';
    btnCopyTarget.disabled = true;
    btnTargetSpeak.disabled = true;
    hideAlert();
    sourceText.focus();
  });

  /* ==========================================================================
     4. Language Swapping
     ========================================================================== */

  btnSwapLang.addEventListener('click', () => {
    const currentSource = sourceLangSelect.value;
    const currentTarget = targetLangSelect.value;

    if (currentSource === 'auto') {
      // If source was auto, swap to target, and set target to English
      sourceLangSelect.value = currentTarget;
      targetLangSelect.value = currentTarget === 'en' ? 'es' : 'en';
    } else {
      sourceLangSelect.value = currentTarget;
      targetLangSelect.value = currentSource;
    }

    // Swap text contents if target text already exists
    const srcVal = sourceText.value;
    const tgtVal = targetText.value;
    if (tgtVal.trim()) {
      sourceText.value = tgtVal;
      targetText.value = srcVal;
      updateSourceCharCount();
      updateTargetCharCount();
      btnCopyTarget.disabled = !targetText.value;
      btnTargetSpeak.disabled = !targetText.value;
    }

    updateSwapButtonState();
  });

  sourceLangSelect.addEventListener('change', updateSwapButtonState);

  /* ==========================================================================
     5. Alerts & Notifications
     ========================================================================== */

  function showAlert(msg) {
    alertMessage.textContent = msg;
    alertBanner.classList.add('active');
  }

  function hideAlert() {
    alertBanner.classList.remove('active');
  }

  btnAlertClose.addEventListener('click', hideAlert);

  let toastTimer = null;
  function showToast(text) {
    toastNotice.textContent = text;
    toastNotice.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2400);
  }

  /* ==========================================================================
     6. Translation Execution
     ========================================================================== */

  async function handleTranslate() {
    const textToTranslate = sourceText.value.trim();
    if (!textToTranslate) {
      showAlert('Please enter some text in the input box to translate.');
      sourceText.focus();
      return;
    }

    const sourceLang = sourceLangSelect.value;
    const targetLang = targetLangSelect.value;

    // Set UI loading state
    hideAlert();
    panelLoader.classList.add('active');
    btnTranslate.disabled = true;
    btnCopyTarget.disabled = true;
    btnTargetSpeak.disabled = true;
    detectedBadge.classList.remove('active');
    engineBadge.textContent = '';

    try {
      const result = await translator.translate(textToTranslate, sourceLang, targetLang);
      
      targetText.value = result.translatedText;
      updateTargetCharCount();

      // Show detected language if applicable
      if (result.detectedSourceLang && sourceLang === 'auto') {
        const detectedObj = getLanguageByCode(result.detectedSourceLang);
        const langName = detectedObj ? detectedObj.name : result.detectedSourceLang.toUpperCase();
        detectedBadge.textContent = `Detected: ${langName}`;
        detectedBadge.classList.add('active');
      }

      if (result.engine) {
        engineBadge.textContent = `via ${result.engine}`;
      }

      btnCopyTarget.disabled = false;
      btnTargetSpeak.disabled = false;

      // Save to History
      saveToHistory({
        sourceText: textToTranslate,
        targetText: result.translatedText,
        sourceLang: sourceLang,
        targetLang: targetLang,
        timestamp: Date.now()
      });

    } catch (err) {
      showAlert(err.message || 'Translation failed. Please try again.');
      console.error(err);
    } finally {
      panelLoader.classList.remove('active');
      btnTranslate.disabled = false;
    }
  }

  btnTranslate.addEventListener('click', handleTranslate);

  // Keyboard shortcut: Ctrl + Enter / Cmd + Enter
  sourceText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleTranslate();
    }
  });

  /* ==========================================================================
     7. Copy to Clipboard
     ========================================================================== */

  btnCopyTarget.addEventListener('click', async () => {
    const textToCopy = targetText.value;
    if (!textToCopy) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers / iframe contexts
        targetText.select();
        document.execCommand('copy');
      }

      // Visual success state on button
      iconCopy.style.display = 'none';
      iconCheck.style.display = 'block';
      btnCopyTarget.classList.add('copied');
      showToast('Copied translation to clipboard!');

      setTimeout(() => {
        iconCopy.style.display = 'block';
        iconCheck.style.display = 'none';
        btnCopyTarget.classList.remove('copied');
      }, 2000);
    } catch (err) {
      showToast('Failed to copy to clipboard.');
      console.error('Clipboard copy error:', err);
    }
  });

  /* ==========================================================================
     8. Text-to-Speech (SpeechSynthesis API)
     ========================================================================== */

  function stopCurrentSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentSpeakingButton) {
      currentSpeakingButton.classList.remove('speaking');
      currentSpeakingButton = null;
    }
  }

  function speakText(text, langCode, buttonElement) {
    if (!('speechSynthesis' in window)) {
      showAlert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (!text.trim()) {
      showAlert('No text available to read aloud.');
      return;
    }

    // Toggle off if already speaking from this button
    if (currentSpeakingButton === buttonElement && window.speechSynthesis.speaking) {
      stopCurrentSpeech();
      return;
    }

    stopCurrentSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    const langObj = getLanguageByCode(langCode);

    if (langObj && langObj.ttsLocale) {
      utterance.lang = langObj.ttsLocale;
    } else {
      utterance.lang = langCode !== 'auto' ? langCode : 'en-US';
    }

    // Attempt to pick matching system voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const matchedVoice = voices.find(v => 
        v.lang === utterance.lang || 
        v.lang.replace('_', '-').startsWith(utterance.lang.split('-')[0])
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    currentSpeakingButton = buttonElement;
    buttonElement.classList.add('speaking');

    utterance.onend = () => {
      buttonElement.classList.remove('speaking');
      if (currentSpeakingButton === buttonElement) {
        currentSpeakingButton = null;
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      buttonElement.classList.remove('speaking');
      if (currentSpeakingButton === buttonElement) {
        currentSpeakingButton = null;
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  // Pre-load voices if supported
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  btnSourceSpeak.addEventListener('click', () => {
    const text = sourceText.value;
    const lang = sourceLangSelect.value;
    speakText(text, lang, btnSourceSpeak);
  });

  btnTargetSpeak.addEventListener('click', () => {
    const text = targetText.value;
    const lang = targetLangSelect.value;
    speakText(text, lang, btnTargetSpeak);
  });

  /* ==========================================================================
     9. Translation History (LocalStorage)
     ========================================================================== */

  function getHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveToHistory(entry) {
    try {
      const list = getHistory();
      // Avoid duplicate consecutive entries
      if (list.length > 0 && list[0].sourceText === entry.sourceText && list[0].targetLang === entry.targetLang) {
        return;
      }
      list.unshift(entry);
      // Keep max 15 entries
      if (list.length > 15) list.pop();
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
      renderHistory();
    } catch (e) {
      console.warn('Could not save to history:', e);
    }
  }

  function renderHistory() {
    const history = getHistory();
    historyList.innerHTML = '';

    if (history.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'history-empty';
      emptyDiv.textContent = 'No translation history yet. Translated phrases will be saved here for quick reference.';
      historyList.appendChild(emptyDiv);
      return;
    }

    history.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'history-item';
      itemEl.setAttribute('role', 'button');
      itemEl.setAttribute('tabindex', '0');

      const srcLangObj = getLanguageByCode(item.sourceLang);
      const tgtLangObj = getLanguageByCode(item.targetLang);

      const srcName = srcLangObj ? srcLangObj.name : item.sourceLang;
      const tgtName = tgtLangObj ? tgtLangObj.name : item.targetLang;

      itemEl.innerHTML = `
        <div class="history-item-content">
          <div class="history-item-tags">
            <span>${srcName}</span>
            <span>&rarr;</span>
            <span>${tgtName}</span>
          </div>
          <div class="history-item-text">${escapeHtml(item.sourceText)}</div>
          <div class="history-item-sub">${escapeHtml(item.targetText)}</div>
        </div>
      `;

      itemEl.addEventListener('click', () => {
        sourceLangSelect.value = item.sourceLang;
        targetLangSelect.value = item.targetLang;
        sourceText.value = item.sourceText;
        targetText.value = item.targetText;
        updateSourceCharCount();
        updateTargetCharCount();
        updateSwapButtonState();
        btnCopyTarget.disabled = false;
        btnTargetSpeak.disabled = false;
        detectedBadge.classList.remove('active');
        engineBadge.textContent = '';
        hideAlert();
        showToast('Restored translation from history');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      historyList.appendChild(itemEl);
    });
  }

  btnClearHistory.addEventListener('click', () => {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    renderHistory();
    showToast('Translation history cleared');
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ==========================================================================
     Initial Run
     ========================================================================== */
  populateLanguageSelects();
  initTheme();
  updateSourceCharCount();
  updateTargetCharCount();
  renderHistory();
});

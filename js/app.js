/**
 * LingoFlux — Application Controller (Warm Minimal UI + Theme Variants)
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const sourceLangSelect = document.getElementById('sourceLangSelect');
  const targetLangSelect = document.getElementById('targetLangSelect');
  const btnSwapLang = document.getElementById('btnSwapLang');

  const sourceText = document.getElementById('sourceText');
  const targetOutput = document.getElementById('targetOutput');
  const targetPlaceholder = document.getElementById('targetPlaceholder');
  const sourceCharCount = document.getElementById('sourceCharCount');
  const targetCharCount = document.getElementById('targetCharCount');

  const btnTranslate = document.getElementById('btnTranslate');
  const btnClearSource = document.getElementById('btnClearSource');
  const btnSourceSpeak = document.getElementById('btnSourceSpeak');
  const btnTargetSpeak = document.getElementById('btnTargetSpeak');
  const btnCopyTarget = document.getElementById('btnCopyTarget');
  const copyIcon = document.getElementById('copyIcon');

  const panelLoader = document.getElementById('panelLoader');
  const alertBanner = document.getElementById('alertBanner');
  const alertMessage = document.getElementById('alertMessage');
  const btnAlertClose = document.getElementById('btnAlertClose');

  const detectedBadge = document.getElementById('detectedBadge');
  const engineBadge = document.getElementById('engineBadge');

  const historySection = document.getElementById('historySection');
  const historyList = document.getElementById('historyList');
  const btnClearHistory = document.getElementById('btnClearHistory');
  const toastNotice = document.getElementById('toastNotice');

  const themeButtons = document.querySelectorAll('.theme-btn');

  // Application State
  let currentSpeakingButton = null;
  let currentResult = '';
  const HISTORY_STORAGE_KEY = 'lingoflux_history_v2';
  const THEME_STORAGE_KEY = 'lingoflux_theme_variant_v2';

  /* ==========================================================================
     1. Language Selectors Initialization
     ========================================================================== */

  function populateLanguageSelects() {
    sourceLangSelect.innerHTML = '';
    targetLangSelect.innerHTML = '';

    SUPPORTED_LANGUAGES.forEach(lang => {
      // Source option
      const srcOpt = document.createElement('option');
      srcOpt.value = lang.code;
      srcOpt.textContent = `${lang.name}`;
      sourceLangSelect.appendChild(srcOpt);

      // Target option (skip auto-detect)
      if (!lang.sourceOnly) {
        const tgtOpt = document.createElement('option');
        tgtOpt.value = lang.code;
        tgtOpt.textContent = `${lang.name}`;
        targetLangSelect.appendChild(tgtOpt);
      }
    });

    sourceLangSelect.value = 'auto';
    targetLangSelect.value = 'es';
    updateSwapButtonState();
  }

  function updateSwapButtonState() {
    const isAuto = sourceLangSelect.value === 'auto';
    btnSwapLang.disabled = isAuto;
    btnSwapLang.title = isAuto ? 'Select a specific source language to swap' : 'Swap languages';
  }

  /* ==========================================================================
     2. Theme Management (Warm Minimal, Dark Editorial, Thermal Receipt)
     ========================================================================== */

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'warm';
    setTheme(savedTheme);
  }

  function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem(THEME_STORAGE_KEY, themeName);

    themeButtons.forEach(btn => {
      if (btn.getAttribute('data-theme-val') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update button text for thermal theme if applicable
    if (themeName === 'thermal') {
      btnTranslate.textContent = '▶ PRINT TRANSLATION';
    } else {
      btnTranslate.textContent = 'Translate';
    }
  }

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.getAttribute('data-theme-val');
      setTheme(selected);
    });
  });

  /* ==========================================================================
     3. Inputs & Character Counters
     ========================================================================== */

  function updateTranslateButtonState() {
    const hasText = sourceText.value.trim().length > 0;
    if (hasText) {
      btnTranslate.disabled = false;
      btnTranslate.classList.add('ready');
    } else {
      btnTranslate.disabled = true;
      btnTranslate.classList.remove('ready');
    }
  }

  sourceText.addEventListener('input', () => {
    const len = sourceText.value.length;
    sourceCharCount.textContent = `${len.toLocaleString()} / 5,000`;
    updateTranslateButtonState();
    hideAlert();
  });

  btnClearSource.addEventListener('click', () => {
    sourceText.value = '';
    currentResult = '';
    targetOutput.textContent = '';
    targetOutput.style.display = 'none';
    targetPlaceholder.style.display = 'block';
    
    sourceCharCount.textContent = '0 / 5,000';
    targetCharCount.style.display = 'none';
    detectedBadge.style.display = 'none';
    engineBadge.style.display = 'none';
    
    btnCopyTarget.disabled = true;
    btnTargetSpeak.disabled = true;
    updateTranslateButtonState();
    hideAlert();
    sourceText.focus();
  });

  /* ==========================================================================
     4. Language Swapping
     ========================================================================== */

  btnSwapLang.addEventListener('click', () => {
    const currentSource = sourceLangSelect.value;
    const currentTarget = targetLangSelect.value;

    if (currentSource === 'auto') return;

    sourceLangSelect.value = currentTarget;
    targetLangSelect.value = currentSource;

    // Swap text if translation exists
    const srcVal = sourceText.value;
    const tgtVal = currentResult;
    if (tgtVal.trim()) {
      sourceText.value = tgtVal;
      setResultText(srcVal);
      sourceCharCount.textContent = `${sourceText.value.length.toLocaleString()} / 5,000`;
    }

    updateSwapButtonState();
    updateTranslateButtonState();
  });

  sourceLangSelect.addEventListener('change', updateSwapButtonState);

  /* ==========================================================================
     5. Alerts & Toast Notifications
     ========================================================================== */

  function showAlert(msg) {
    alertMessage.textContent = msg;
    alertBanner.classList.add('active');
  }

  function hideAlert() {
    alertBanner.classList.remove('active');
  }

  btnAlertClose.addEventListener('click', hideAlert);

  let toastTimeout = null;
  function showToast(text) {
    toastNotice.textContent = text;
    toastNotice.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2000);
  }

  /* ==========================================================================
     6. Result Display & State Helper
     ========================================================================== */

  function setResultText(text, engine, detectedLang) {
    currentResult = text || '';
    if (currentResult) {
      targetPlaceholder.style.display = 'none';
      targetOutput.textContent = currentResult;
      targetOutput.style.display = 'block';

      btnCopyTarget.disabled = false;
      btnTargetSpeak.disabled = false;

      targetCharCount.textContent = `${currentResult.length} chars`;
      targetCharCount.style.display = 'inline-block';

      if (detectedLang) {
        const langObj = getLanguageByCode(detectedLang);
        const name = langObj ? langObj.name : detectedLang.toUpperCase();
        detectedBadge.textContent = `Detected: ${name}`;
        detectedBadge.style.display = 'inline-block';
      } else {
        detectedBadge.style.display = 'none';
      }

      if (engine) {
        engineBadge.textContent = `· via ${engine}`;
        engineBadge.style.display = 'inline-block';
      } else {
        engineBadge.style.display = 'none';
      }
    } else {
      targetOutput.textContent = '';
      targetOutput.style.display = 'none';
      targetPlaceholder.style.display = 'block';
      btnCopyTarget.disabled = true;
      btnTargetSpeak.disabled = true;
      targetCharCount.style.display = 'none';
      detectedBadge.style.display = 'none';
      engineBadge.style.display = 'none';
    }
  }

  /* ==========================================================================
     7. Translation Execution
     ========================================================================== */

  async function handleTranslate() {
    const text = sourceText.value.trim();
    if (!text) {
      showAlert('Please enter text to translate.');
      sourceText.focus();
      return;
    }

    const sourceLang = sourceLangSelect.value;
    const targetLang = targetLangSelect.value;

    hideAlert();
    panelLoader.style.display = 'block';
    targetPlaceholder.style.display = 'none';
    targetOutput.style.display = 'none';

    btnTranslate.disabled = true;
    btnTranslate.classList.remove('ready');

    try {
      const res = await translator.translate(text, sourceLang, targetLang);
      panelLoader.style.display = 'none';
      setResultText(res.translatedText, res.engine, res.detectedSourceLang);

      // Save to history
      saveToHistory({
        sourceText: text,
        resultText: res.translatedText,
        sourceLang: sourceLang,
        targetLang: targetLang,
        timestamp: Date.now()
      });
    } catch (err) {
      panelLoader.style.display = 'none';
      if (!currentResult) {
        targetPlaceholder.style.display = 'block';
      }
      showAlert(err.message || 'Translation failed. Please try again.');
      console.error(err);
    } finally {
      updateTranslateButtonState();
    }
  }

  btnTranslate.addEventListener('click', handleTranslate);

  // Keyboard shortcut: Ctrl + Enter / Cmd + Enter
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleTranslate();
    }
  });

  /* ==========================================================================
     8. Copy to Clipboard
     ========================================================================== */

  btnCopyTarget.addEventListener('click', async () => {
    if (!currentResult) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentResult);
      } else {
        const temp = document.createElement('textarea');
        temp.value = currentResult;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }

      copyIcon.textContent = '✓';
      showToast('Copied translation');
      setTimeout(() => {
        copyIcon.textContent = '⧉';
      }, 1600);
    } catch (err) {
      showToast('Failed to copy');
      console.error('Clipboard copy error:', err);
    }
  });

  /* ==========================================================================
     9. Text-to-Speech (Web Speech API)
     ========================================================================== */

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentSpeakingButton) {
      currentSpeakingButton.classList.remove('speaking');
      currentSpeakingButton = null;
    }
  }

  function speakText(text, langCode, btn) {
    if (!('speechSynthesis' in window)) {
      showAlert('Text-to-speech is not supported in your browser.');
      return;
    }

    if (!text.trim()) return;

    if (currentSpeakingButton === btn && window.speechSynthesis.speaking) {
      stopSpeech();
      return;
    }

    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    const langObj = getLanguageByCode(langCode);

    if (langObj && langObj.ttsLocale) {
      utterance.lang = langObj.ttsLocale;
    } else {
      utterance.lang = langCode === 'auto' ? 'en-US' : langCode;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const match = voices.find(v => 
        v.lang === utterance.lang || 
        v.lang.replace('_', '-').startsWith(utterance.lang.split('-')[0])
      );
      if (match) utterance.voice = match;
    }

    currentSpeakingButton = btn;
    btn.classList.add('speaking');

    utterance.onend = () => {
      btn.classList.remove('speaking');
      if (currentSpeakingButton === btn) currentSpeakingButton = null;
    };

    utterance.onerror = () => {
      btn.classList.remove('speaking');
      if (currentSpeakingButton === btn) currentSpeakingButton = null;
    };

    window.speechSynthesis.speak(utterance);
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  btnSourceSpeak.addEventListener('click', () => {
    speakText(sourceText.value, sourceLangSelect.value, btnSourceSpeak);
  });

  btnTargetSpeak.addEventListener('click', () => {
    speakText(currentResult, targetLangSelect.value, btnTargetSpeak);
  });

  /* ==========================================================================
     10. Recent Translations History
     ========================================================================== */

  function getHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveToHistory(item) {
    try {
      const list = getHistory();
      if (list.length > 0 && list[0].sourceText === item.sourceText && list[0].targetLang === item.targetLang) {
        return;
      }
      list.unshift(item);
      if (list.length > 8) list.pop();
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
      renderHistory();
    } catch (e) {
      console.warn('Could not save history:', e);
    }
  }

  function renderHistory() {
    const history = getHistory();
    historyList.innerHTML = '';

    if (history.length === 0) {
      historySection.style.display = 'none';
      return;
    }

    historySection.style.display = 'block';

    history.forEach(item => {
      const row = document.createElement('button');
      row.className = 'history-row';
      row.type = 'button';

      const srcObj = getLanguageByCode(item.sourceLang);
      const tgtObj = getLanguageByCode(item.targetLang);
      const srcCode = (srcObj ? srcObj.code : item.sourceLang).toUpperCase().slice(0, 2);
      const tgtCode = (tgtObj ? tgtObj.code : item.targetLang).toUpperCase().slice(0, 2);

      row.innerHTML = `
        <span class="hist-src">${escapeHtml(item.sourceText)}</span>
        <span class="hist-arrow">&rarr;</span>
        <span class="hist-res">${escapeHtml(item.resultText)}</span>
        <span class="hist-codes">${srcCode} &rarr; ${tgtCode}</span>
      `;

      row.addEventListener('click', () => {
        sourceLangSelect.value = item.sourceLang;
        targetLangSelect.value = item.targetLang;
        sourceText.value = item.sourceText;
        setResultText(item.resultText);
        sourceCharCount.textContent = `${sourceText.value.length.toLocaleString()} / 5,000`;
        updateSwapButtonState();
        updateTranslateButtonState();
        showToast('Restored translation');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      historyList.appendChild(row);
    });
  }

  btnClearHistory.addEventListener('click', () => {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    renderHistory();
    showToast('History cleared');
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ==========================================================================
     Initial Setup
     ========================================================================= */
  populateLanguageSelects();
  initTheme();
  renderHistory();
  updateTranslateButtonState();
  sourceText.focus();
});

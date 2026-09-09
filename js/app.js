/**
 * LINGOFLUX — THERMAL RECEIPT APPLICATION CONTROLLER
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const liveClock = document.getElementById('liveClock');
  const sourceLangSelect = document.getElementById('sourceLangSelect');
  const targetLangSelect = document.getElementById('targetLangSelect');
  const btnSwapLang = document.getElementById('btnSwapLang');

  const sourceText = document.getElementById('sourceText');
  const sourceCharCount = document.getElementById('sourceCharCount');
  const btnSourceSpeak = document.getElementById('btnSourceSpeak');
  const btnClearSource = document.getElementById('btnClearSource');

  const outputHeader = document.getElementById('outputHeader');
  const busyIndicator = document.getElementById('busyIndicator');
  const outputContent = document.getElementById('outputContent');
  const targetPlaceholder = document.getElementById('targetPlaceholder');
  const targetOutput = document.getElementById('targetOutput');
  const outputActions = document.getElementById('outputActions');
  const btnTargetSpeak = document.getElementById('btnTargetSpeak');
  const btnCopyTarget = document.getElementById('btnCopyTarget');

  const btnTranslate = document.getElementById('btnTranslate');
  const alertBanner = document.getElementById('alertBanner');
  const alertMessage = document.getElementById('alertMessage');
  const btnAlertClose = document.getElementById('btnAlertClose');

  const historyBlock = document.getElementById('historyBlock');
  const historyList = document.getElementById('historyList');
  const btnClearHistory = document.getElementById('btnClearHistory');
  const toastNotice = document.getElementById('toastNotice');

  // State
  let currentResult = '';
  let isBusy = false;
  const HISTORY_KEY = 'lingoflux_receipt_history_v1';

  /* ==========================================================================
     1. Live Receipt Clock
     ========================================================================== */

  function formatReceiptDate(d) {
    const pad = (n) => String(n).padStart(2, '0');
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`;
  }

  function updateClock() {
    if (liveClock) {
      liveClock.textContent = formatReceiptDate(new Date());
    }
  }

  updateClock();
  setInterval(updateClock, 1000);

  /* ==========================================================================
     2. Language Selectors
     ========================================================================== */

  function populateLanguages() {
    sourceLangSelect.innerHTML = '';
    targetLangSelect.innerHTML = '';

    SUPPORTED_LANGUAGES.forEach(lang => {
      const srcOpt = document.createElement('option');
      srcOpt.value = lang.code;
      srcOpt.textContent = lang.name.toUpperCase();
      sourceLangSelect.appendChild(srcOpt);

      if (!lang.sourceOnly) {
        const tgtOpt = document.createElement('option');
        tgtOpt.value = lang.code;
        tgtOpt.textContent = lang.name.toUpperCase();
        targetLangSelect.appendChild(tgtOpt);
      }
    });

    sourceLangSelect.value = 'auto';
    targetLangSelect.value = 'es';
    updateSwapState();
  }

  function updateSwapState() {
    const isAuto = sourceLangSelect.value === 'auto';
    btnSwapLang.disabled = isAuto;
  }

  /* ==========================================================================
     3. Inputs & Button States
     ========================================================================== */

  function updateTranslateButton() {
    const hasText = sourceText.value.trim().length > 0;
    if (hasText && !isBusy) {
      btnTranslate.disabled = false;
      btnTranslate.classList.add('ready');
    } else {
      btnTranslate.disabled = true;
      btnTranslate.classList.remove('ready');
    }
  }

  sourceText.addEventListener('input', () => {
    const len = sourceText.value.length;
    sourceCharCount.textContent = `${len} / 5000 CHARS`;
    btnClearSource.style.display = len > 0 ? 'inline-block' : 'none';
    updateTranslateButton();
    hideAlert();
  });

  btnClearSource.addEventListener('click', () => {
    sourceText.value = '';
    sourceCharCount.textContent = '0 / 5000 CHARS';
    btnClearSource.style.display = 'none';
    resetOutput();
    updateTranslateButton();
    hideAlert();
    sourceText.focus();
  });

  function resetOutput() {
    currentResult = '';
    outputHeader.textContent = 'OUTPUT';
    targetPlaceholder.style.display = 'block';
    targetOutput.style.display = 'none';
    targetOutput.textContent = '';
    outputActions.style.display = 'none';
  }

  /* ==========================================================================
     4. Language Swapping
     ========================================================================== */

  btnSwapLang.addEventListener('click', () => {
    const currentFrom = sourceLangSelect.value;
    const currentTo = targetLangSelect.value;
    if (currentFrom === 'auto') return;

    sourceLangSelect.value = currentTo;
    targetLangSelect.value = currentFrom;

    if (currentResult.trim()) {
      const prevSrc = sourceText.value;
      sourceText.value = currentResult;
      sourceCharCount.textContent = `${sourceText.value.length} / 5000 CHARS`;
      setCompletedOutput(prevSrc);
    }

    updateSwapState();
    updateTranslateButton();
  });

  sourceLangSelect.addEventListener('change', updateSwapState);

  /* ==========================================================================
     5. Alerts & Toast Notifications
     ========================================================================== */

  function showAlert(msg) {
    alertMessage.textContent = `[ ${msg.toUpperCase()} ]`;
    alertBanner.style.display = 'flex';
  }

  function hideAlert() {
    alertBanner.style.display = 'none';
  }

  btnAlertClose.addEventListener('click', hideAlert);

  let toastTimer = null;
  function showToast(text) {
    toastNotice.textContent = text;
    toastNotice.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 1600);
  }

  /* ==========================================================================
     6. Output Helpers
     ========================================================================== */

  function setCompletedOutput(translatedText, detectedLang, engine) {
    currentResult = translatedText || '';
    if (currentResult) {
      let headerStr = 'OUTPUT';
      if (detectedLang) {
        headerStr += ` · DETECTED: ${detectedLang.toUpperCase()}`;
      }
      if (engine) {
        const engName = engine.toUpperCase().replace(/\s+/g, '-');
        headerStr += ` · VIA ${engName}`;
      }
      outputHeader.textContent = headerStr;

      targetPlaceholder.style.display = 'none';
      targetOutput.textContent = currentResult;
      targetOutput.style.display = 'block';
      outputActions.style.display = 'flex';
    } else {
      resetOutput();
    }
  }

  /* ==========================================================================
     7. Translation Print Handler
     ========================================================================== */

  async function handlePrint() {
    const text = sourceText.value.trim();
    if (!text || isBusy) return;

    const fromLang = sourceLangSelect.value;
    const toLang = targetLangSelect.value;

    isBusy = true;
    hideAlert();
    updateTranslateButton();

    btnTranslate.textContent = 'PRINTING...';
    busyIndicator.style.display = 'block';
    targetPlaceholder.style.display = 'none';
    targetOutput.style.display = 'none';
    outputActions.style.display = 'none';

    try {
      const res = await translator.translate(text, fromLang, toLang);
      busyIndicator.style.display = 'none';
      setCompletedOutput(res.translatedText, res.detectedSourceLang, res.engine);

      // Save to receipt history
      saveToHistory({
        sourceText: text,
        resultText: res.translatedText,
        fromCode: fromLang.toUpperCase(),
        toCode: toLang.toUpperCase(),
        timestamp: Date.now()
      });
    } catch (err) {
      busyIndicator.style.display = 'none';
      if (!currentResult) {
        targetPlaceholder.style.display = 'block';
      }
      showAlert(err.message || 'TRANSLATION FAILED');
      console.error(err);
    } finally {
      isBusy = false;
      btnTranslate.textContent = '▶ PRINT TRANSLATION';
      updateTranslateButton();
    }
  }

  btnTranslate.addEventListener('click', handlePrint);

  // Keyboard shortcut: ⌘ Enter / Ctrl + Enter
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handlePrint();
    }
  });

  /* ==========================================================================
     8. Copy Action
     ========================================================================== */

  btnCopyTarget.addEventListener('click', async () => {
    if (!currentResult) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentResult);
      } else {
        const t = document.createElement('textarea');
        t.value = currentResult;
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        document.body.removeChild(t);
      }

      btnCopyTarget.textContent = '[ COPIED ]';
      showToast('[ COPIED ]');
      setTimeout(() => {
        btnCopyTarget.textContent = '[ COPY ]';
      }, 1600);
    } catch (err) {
      showToast('[ ERROR COPYING ]');
    }
  });

  /* ==========================================================================
     9. Text-to-Speech (Web Speech API)
     ========================================================================== */

  function speak(text, langCode) {
    if (!('speechSynthesis' in window)) {
      showAlert('SPEECH NOT SUPPORTED');
      return;
    }
    if (!text.trim()) return;

    window.speechSynthesis.cancel();
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

    window.speechSynthesis.speak(utterance);
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  btnSourceSpeak.addEventListener('click', () => {
    speak(sourceText.value, sourceLangSelect.value);
  });

  btnTargetSpeak.addEventListener('click', () => {
    speak(currentResult, targetLangSelect.value);
  });

  /* ==========================================================================
     10. Recent Translations (Receipt History)
     ========================================================================== */

  function getHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveToHistory(item) {
    try {
      const list = getHistory();
      if (list.length > 0 && list[0].sourceText === item.sourceText && list[0].toCode === item.toCode) {
        return;
      }
      list.unshift(item);
      if (list.length > 9) list.pop();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
      renderHistory();
    } catch (e) {
      console.warn('History save failed:', e);
    }
  }

  function renderHistory() {
    const list = getHistory();
    historyList.innerHTML = '';

    if (list.length === 0) {
      historyBlock.style.display = 'none';
      return;
    }

    historyBlock.style.display = 'block';

    list.forEach((item, index) => {
      const itemBtn = document.createElement('button');
      itemBtn.type = 'button';
      itemBtn.className = 'history-item';

      const d = new Date(item.timestamp);
      const dateStr = formatReceiptDate(d);

      itemBtn.innerHTML = `
        <div class="history-item-meta">${item.fromCode} → ${item.toCode} · ${dateStr}</div>
        <div class="history-item-grid">
          <span class="history-item-src">${escapeHtml(item.sourceText)}</span>
          <span class="history-item-arrow">→</span>
          <span class="history-item-res">${escapeHtml(item.resultText)}</span>
        </div>
      `;

      itemBtn.addEventListener('click', () => {
        sourceLangSelect.value = item.fromCode.toLowerCase();
        targetLangSelect.value = item.toCode.toLowerCase();
        sourceText.value = item.sourceText;
        sourceCharCount.textContent = `${item.sourceText.length} / 5000 CHARS`;
        btnClearSource.style.display = 'inline-block';
        setCompletedOutput(item.resultText);
        updateSwapState();
        updateTranslateButton();
        showToast('[ RESTORED ]');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      historyList.appendChild(itemBtn);

      if (index < list.length - 1) {
        const sep = document.createElement('div');
        sep.className = 'history-item-sep';
        sep.textContent = '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -';
        historyList.appendChild(sep);
      }
    });
  }

  btnClearHistory.addEventListener('click', () => {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
    showToast('[ HISTORY CLEARED ]');
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ==========================================================================
     Initial Execution
     ========================================================================== */
  populateLanguages();
  renderHistory();
  updateTranslateButton();
  sourceText.focus();
});

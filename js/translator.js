/**
 * Translation Service
 * Uses Google Translate unofficial client API with automatic fallback to MyMemory API.
 * Requires no API keys and works directly via browser fetch.
 */

class TranslationService {
  constructor() {
    this.timeout = 9000; // 9 seconds timeout per attempt
  }

  /**
   * Main translate function with automatic fallback
   * @param {string} text - Text to translate
   * @param {string} sourceLang - Source language code (e.g. 'auto', 'en', 'es')
   * @param {string} targetLang - Target language code (e.g. 'es', 'fr', 'ja')
   * @returns {Promise<{translatedText: string, detectedSourceLang?: string, engine: string}>}
   */
  async translate(text, sourceLang, targetLang) {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Please enter some text to translate.');
    }

    if (sourceLang === targetLang && sourceLang !== 'auto') {
      return {
        translatedText: trimmed,
        detectedSourceLang: sourceLang,
        engine: 'identity'
      };
    }

    // Try Primary Engine: Google Translate gtx
    try {
      const result = await this._translateGoogle(trimmed, sourceLang, targetLang);
      return result;
    } catch (googleError) {
      console.warn('Google Translate API failed, trying fallback...', googleError);
      
      // Try Fallback Engine 1: MyMemory API
      try {
        const result = await this._translateMyMemory(trimmed, sourceLang, targetLang);
        return result;
      } catch (myMemoryError) {
        console.warn('MyMemory API failed, trying fallback 2 (Lingva)...', myMemoryError);
        
        // Try Fallback Engine 2: Lingva API
        try {
          const result = await this._translateLingva(trimmed, sourceLang, targetLang);
          return result;
        } catch (lingvaError) {
          console.warn('Lingva API failed, trying fallback 3 (LibreTranslate)...', lingvaError);

          // Try Fallback Engine 3: Public LibreTranslate mirror
          try {
            const result = await this._translateLibre(trimmed, sourceLang, targetLang);
            return result;
          } catch (libreError) {
            console.error('All translation services failed:', { googleError, myMemoryError, lingvaError, libreError });
            throw new Error('Translation service is temporarily unavailable. Please check your network connection and try again.');
          }
        }
      }
    }
  }

  /**
   * Primary: Google Translate unofficial endpoint
   */
  async _translateGoogle(text, sourceLang, targetLang) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
      // Convert zh-CN to zh-CN for Google
      const tl = targetLang;
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Google API returned status ${response.status}`);
      }

      const data = await response.json();
      
      // Expected structure: [[["Translated part 1", "Original part 1"], ...], null, "detected_lang", ...]
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedParts = data[0]
          .filter(part => Array.isArray(part) && typeof part[0] === 'string')
          .map(part => part[0]);

        if (translatedParts.length > 0) {
          const detectedSourceLang = typeof data[2] === 'string' ? data[2] : undefined;
          return {
            translatedText: translatedParts.join(''),
            detectedSourceLang: detectedSourceLang,
            engine: 'Google Translate (gtx)'
          };
        }
      }

      throw new Error('Unexpected response format from Google Translate API');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Fallback 1: MyMemory Translated API
   */
  async _translateMyMemory(text, sourceLang, targetLang) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const sl = sourceLang === 'auto' ? 'autodetect' : sourceLang.split('-')[0];
      const tl = targetLang.split('-')[0];
      const langpair = `${sl}|${tl}`;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;

      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`MyMemory API returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
        return {
          translatedText: data.responseData.translatedText,
          detectedSourceLang: data.responseData.detectedLanguage || undefined,
          engine: 'MyMemory Translate'
        };
      }

      throw new Error(data.responseDetails || 'MyMemory translation failed');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Fallback 2: Lingva Scraper API instance
   */
  async _translateLingva(text, sourceLang, targetLang) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const sl = sourceLang === 'auto' ? 'auto' : sourceLang.split('-')[0];
      const tl = targetLang.split('-')[0];
      const url = `https://lingva.ml/api/v1/${encodeURIComponent(sl)}/${encodeURIComponent(tl)}/${encodeURIComponent(text)}`;

      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Lingva API returned status ${response.status}`);
      }

      const data = await response.json();
      if (data && data.translation) {
        return {
          translatedText: data.translation,
          detectedSourceLang: data.info && data.info.detectedSource ? data.info.detectedSource : undefined,
          engine: 'Lingva Translate'
        };
      }

      throw new Error('Invalid response from Lingva API');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Fallback 3: Public LibreTranslate instance
   */
  async _translateLibre(text, sourceLang, targetLang) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const sl = sourceLang === 'auto' ? 'auto' : sourceLang.split('-')[0];
      const tl = targetLang.split('-')[0];
      const url = 'https://translate.argosopentech.com/translate';

      const response = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          q: text,
          source: sl,
          target: tl,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`LibreTranslate returned status ${response.status}`);
      }

      const data = await response.json();
      if (data && data.translatedText) {
        return {
          translatedText: data.translatedText,
          engine: 'LibreTranslate (Argos)'
        };
      }

      throw new Error('Invalid response from LibreTranslate');
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Export singleton instance
const translator = new TranslationService();

/**
 * Supported Languages and Speech Synthesis Locale Mappings
 */
const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Auto-detect', flag: '🌐', ttsLocale: null, sourceOnly: true },
  { code: 'en', name: 'English', flag: '🇬🇧', ttsLocale: 'en-US' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', ttsLocale: 'es-ES' },
  { code: 'fr', name: 'French', flag: '🇫🇷', ttsLocale: 'fr-FR' },
  { code: 'de', name: 'German', flag: '🇩🇪', ttsLocale: 'de-DE' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', ttsLocale: 'it-IT' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', ttsLocale: 'pt-PT' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', ttsLocale: 'ru-RU' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳', ttsLocale: 'zh-CN' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', ttsLocale: 'ja-JP' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', ttsLocale: 'ko-KR' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', ttsLocale: 'ar-SA', rtl: true },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', ttsLocale: 'hi-IN' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', ttsLocale: 'nl-NL' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', ttsLocale: 'tr-TR' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', ttsLocale: 'pl-PL' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', ttsLocale: 'vi-VN' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪', ttsLocale: 'sv-SE' },
  { code: 'el', name: 'Greek', flag: '🇬🇷', ttsLocale: 'el-GR' }
];

/**
 * Helper to get language details by code
 * @param {string} code 
 * @returns {object|undefined}
 */
function getLanguageByCode(code) {
  return SUPPORTED_LANGUAGES.find(l => l.code === code);
}

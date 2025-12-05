/**
 * 지원 언어 설정
 */

export interface Language {
  code: string;
  label: string;
  flag: string;
  nativeLabel: string;
  enabled: boolean;
}

/**
 * 기본 지원 언어 목록
 * 관리자 설정에서 활성화/비활성화 가능
 */
export const DEFAULT_LANGUAGES: Language[] = [
  { code: 'ko', label: 'Korean', flag: '🇰🇷', nativeLabel: '한국어', enabled: true },
  { code: 'en', label: 'English', flag: '🇺🇸', nativeLabel: 'English', enabled: true },
  { code: 'vi', label: 'Vietnamese', flag: '🇻🇳', nativeLabel: 'Tiếng Việt', enabled: true },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳', nativeLabel: '中文', enabled: true },
  { code: 'th', label: 'Thai', flag: '🇹🇭', nativeLabel: 'ไทย', enabled: true },
  { code: 'id', label: 'Indonesian', flag: '🇮🇩', nativeLabel: 'Bahasa Indonesia', enabled: true },
  { code: 'ne', label: 'Nepali', flag: '🇳🇵', nativeLabel: 'नेपाली', enabled: true },
  { code: 'km', label: 'Khmer', flag: '🇰🇭', nativeLabel: 'ភាសាខ្មែរ', enabled: true },
  { code: 'uz', label: 'Uzbek', flag: '🇺🇿', nativeLabel: 'Oʻzbekcha', enabled: true },
  { code: 'ky', label: 'Kyrgyz', flag: '🇰🇬', nativeLabel: 'Кыргызча', enabled: true },
  { code: 'si', label: 'Sinhala', flag: '🇱🇰', nativeLabel: 'සිංහල', enabled: true },
  { code: 'bn', label: 'Bengali', flag: '🇧🇩', nativeLabel: 'বাংলা', enabled: true },
  { code: 'fil', label: 'Filipino', flag: '🇵🇭', nativeLabel: 'Filipino', enabled: true },
  { code: 'ur', label: 'Urdu', flag: '🇵🇰', nativeLabel: 'اردو', enabled: true },
  { code: 'my', label: 'Burmese', flag: '🇲🇲', nativeLabel: 'မြန်မာဘာသာ', enabled: true },
  { code: 'tet', label: 'Tetum', flag: '🇹🇱', nativeLabel: 'Tetun', enabled: true },
  { code: 'mn', label: 'Mongolian', flag: '🇲🇳', nativeLabel: 'Монгол', enabled: true },
  { code: 'lo', label: 'Lao', flag: '🇱🇦', nativeLabel: 'ລາວ', enabled: true },
  { code: 'tg', label: 'Tajik', flag: '🇹🇯', nativeLabel: 'Тоҷикӣ', enabled: true },
];

/**
 * 활성화된 언어만 필터링
 */
export function getEnabledLanguages(languages: Language[]): Language[] {
  return languages.filter((lang) => lang.enabled);
}

/**
 * 언어 코드로 언어 정보 찾기
 */
export function getLanguageByCode(code: string, languages: Language[]): Language | undefined {
  return languages.find((lang) => lang.code === code);
}

/**
 * 언어명 가져오기
 */
export function getLanguageName(code: string, languages: Language[] = DEFAULT_LANGUAGES): string {
  const language = getLanguageByCode(code, languages);
  return language?.nativeLabel || code;
}

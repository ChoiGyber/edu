// OpenAI GPT-4를 사용한 자막 번역

import OpenAI from "openai";
import { getSetting } from "@/lib/settings/settings-manager";
import { SettingKey } from "@/types/system-settings";
import { parseSRT, parseVTT, SubtitleCue } from "@/lib/subtitles/parser";

/**
 * OpenAI 클라이언트 초기화
 */
async function getOpenAIClient(): Promise<OpenAI> {
  const apiKey = await getSetting(SettingKey.OPENAI_API_KEY);

  if (!apiKey) {
    throw new Error("OpenAI API 키가 설정되지 않았습니다. 시스템 설정에서 OPENAI_API_KEY를 입력해주세요.");
  }

  return new OpenAI({
    apiKey,
  });
}

/**
 * 언어 코드를 언어명으로 변환
 */
function getLanguageName(code: string): string {
  const languageMap: Record<string, string> = {
    ko: "Korean",
    en: "English",
    vi: "Vietnamese",
    zh: "Chinese",
    th: "Thai",
    ja: "Japanese",
    es: "Spanish",
    fr: "French",
    de: "German",
    ru: "Russian",
  };

  return languageMap[code] || code;
}

/**
 * SRT 자막 번역 (GPT-4)
 * @param srtContent - SRT 자막 내용
 * @param sourceLang - 원본 언어 코드
 * @param targetLang - 목표 언어 코드
 */
export async function translateSubtitles(
  srtContent: string,
  sourceLang: string = "ko",
  targetLang: string = "en"
): Promise<string> {
  try {
    const openai = await getOpenAIClient();

    const sourceLanguageName = getLanguageName(sourceLang);
    const targetLanguageName = getLanguageName(targetLang);

    // GPT-4 API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a professional subtitle translator. Translate the following SRT subtitle file from ${sourceLanguageName} to ${targetLanguageName}.

IMPORTANT RULES:
1. Preserve the exact SRT format with index numbers and timestamps
2. Only translate the text content, not the timestamps
3. Keep the same number of subtitle blocks
4. Maintain natural expressions in the target language
5. Keep technical terms and proper nouns when appropriate
6. Ensure timing codes remain exactly the same

Example format:
1
00:00:01,000 --> 00:00:03,000
Translated text here

2
00:00:03,500 --> 00:00:06,000
Next translated text`,
        },
        {
          role: "user",
          content: srtContent,
        },
      ],
      temperature: 0.3, // 낮은 temperature로 일관성 유지
      max_tokens: 4000,
    });

    const translatedContent = completion.choices[0]?.message?.content;

    if (!translatedContent) {
      throw new Error("번역 결과가 없습니다");
    }

    return translatedContent;

  } catch (error) {
    console.error("GPT-4 translation error:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("OpenAI API 키가 올바르지 않습니다. 시스템 설정을 확인해주세요.");
      }
      if (error.message.includes("quota")) {
        throw new Error("OpenAI API 사용량 한도를 초과했습니다. 계정을 확인해주세요.");
      }
      throw new Error(`번역 실패: ${error.message}`);
    }

    throw new Error("번역 중 알 수 없는 오류가 발생했습니다");
  }
}

/**
 * 여러 언어로 동시 번역
 * @param srtContent - SRT 자막 내용
 * @param sourceLang - 원본 언어
 * @param targetLangs - 목표 언어 배열
 */
export async function translateToMultipleLanguages(
  srtContent: string,
  sourceLang: string,
  targetLangs: string[]
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  // 순차적으로 번역 (병렬 처리 시 API 제한 초과 가능)
  for (const targetLang of targetLangs) {
    if (targetLang === sourceLang) {
      // 같은 언어는 건너뛰기
      results[targetLang] = srtContent;
      continue;
    }

    try {
      const translated = await translateSubtitles(srtContent, sourceLang, targetLang);
      results[targetLang] = translated;
    } catch (error) {
      console.error(`Translation failed for ${targetLang}:`, error);
      results[targetLang] = ""; // 실패한 경우 빈 문자열
    }
  }

  return results;
}

/**
 * 자막 텍스트만 번역 (타이밍 코드 유지 보장)
 * @param srtContent - SRT 자막 내용
 * @param targetLang - 목표 언어
 */
export async function translateSubtitleText(
  srtContent: string,
  targetLang: string
): Promise<string> {
  try {
    // SRT 파싱
    const cues = parseSRT(srtContent);

    if (cues.length === 0) {
      throw new Error("자막을 파싱할 수 없습니다");
    }

    // 텍스트만 추출
    const texts = cues.map((cue) => cue.text).join("\n\n---\n\n");

    // 텍스트만 번역
    const openai = await getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `Translate the following subtitle texts to ${getLanguageName(targetLang)}. Each text is separated by '---'. Maintain the same number of sections and keep the natural flow.`,
        },
        {
          role: "user",
          content: texts,
        },
      ],
      temperature: 0.3,
    });

    const translatedTexts = completion.choices[0]?.message?.content;

    if (!translatedTexts) {
      throw new Error("번역 결과가 없습니다");
    }

    // 번역된 텍스트를 분할
    const translatedArray = translatedTexts.split("---").map((t) => t.trim());

    if (translatedArray.length !== cues.length) {
      console.warn("번역된 자막 개수가 일치하지 않습니다. 기본 번역 방식 사용");
      return translateSubtitles(srtContent, "ko", targetLang);
    }

    // SRT 재구성
    let result = "";
    cues.forEach((cue, index) => {
      result += `${cue.index}\n`;
      result += `${cue.startTime} --> ${cue.endTime}\n`;
      result += `${translatedArray[index]}\n\n`;
    });

    return result;

  } catch (error) {
    console.error("Text translation error:", error);
    // 폴백: 전체 SRT 번역
    return translateSubtitles(srtContent, "ko", targetLang);
  }
}

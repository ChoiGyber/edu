// OpenAI Whisper를 사용한 음성 인식 (STT)

import OpenAI from "openai";
import { getSetting } from "@/lib/settings/settings-manager";
import { SettingKey } from "@/types/system-settings";

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
 * 영상 URL에서 오디오 추출 및 Whisper로 전사(transcription)
 * @param videoUrl - 영상 URL
 * @param language - 음성 언어 (기본: 한국어)
 * @param format - 출력 형식 (srt, vtt, text, json)
 */
export async function transcribeVideo(
  videoUrl: string,
  language: string = "ko",
  format: "srt" | "vtt" | "text" | "json" = "srt"
): Promise<string> {
  try {
    const openai = await getOpenAIClient();

    // 영상에서 오디오 추출이 필요한 경우
    // 실제로는 영상 파일을 다운로드하여 오디오 추출 후 전송해야 함
    // 여기서는 간단한 구현을 위해 직접 URL을 사용 (실제로는 작동하지 않을 수 있음)

    // TODO: 영상에서 오디오 추출 로직 추가 (ffmpeg 등)
    // 현재는 오디오 파일이 직접 제공된다고 가정

    throw new Error("영상에서 오디오 추출 기능은 아직 구현되지 않았습니다. 오디오 파일을 직접 업로드해주세요.");

  } catch (error) {
    console.error("Whisper transcription error:", error);
    throw error;
  }
}

/**
 * 오디오 파일에서 자막 추출 (Whisper)
 * @param audioFile - 오디오 파일 (File 또는 Buffer)
 * @param language - 음성 언어 (기본: 한국어)
 * @param format - 출력 형식
 */
export async function transcribeAudio(
  audioFile: File | Buffer,
  language: string = "ko",
  format: "srt" | "vtt" | "text" | "json" = "srt"
): Promise<string> {
  try {
    const openai = await getOpenAIClient();

    // File을 Blob으로 변환
    let fileToUpload: File;

    if (audioFile instanceof Buffer) {
      fileToUpload = new File([audioFile], "audio.mp3", { type: "audio/mpeg" });
    } else {
      fileToUpload = audioFile;
    }

    // Whisper API 호출
    const transcription = await openai.audio.transcriptions.create({
      file: fileToUpload,
      model: "whisper-1",
      language: language, // ISO 639-1 코드 (ko, en, ja, zh, vi, th 등)
      response_format: format,
      // 타임스탬프 포함 (srt, vtt 형식에서만)
      timestamp_granularities: format === "srt" || format === "vtt" ? ["segment"] : undefined,
    });

    return transcription as unknown as string;

  } catch (error) {
    console.error("Whisper audio transcription error:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("OpenAI API 키가 올바르지 않습니다. 시스템 설정을 확인해주세요.");
      }
      throw new Error(`음성 인식 실패: ${error.message}`);
    }

    throw new Error("음성 인식 중 알 수 없는 오류가 발생했습니다");
  }
}

/**
 * 텍스트를 음성으로 변환 (TTS) - 선택적 기능
 * @param text - 변환할 텍스트
 * @param voice - 음성 선택
 */
export async function textToSpeech(
  text: string,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy"
): Promise<Buffer> {
  try {
    const openai = await getOpenAIClient();

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer;

  } catch (error) {
    console.error("TTS error:", error);
    throw new Error("음성 합성에 실패했습니다");
  }
}

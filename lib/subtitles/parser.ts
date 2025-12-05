// 자막 파일 파싱 및 검증 유틸리티

export interface SubtitleCue {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
}

/**
 * SRT 파일 파싱
 * @param content - SRT 파일 내용 (문자열)
 */
export function parseSRT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const blocks = content.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;

    const indexLine = lines[0].trim();
    const timeLine = lines[1].trim();
    const textLines = lines.slice(2);

    // 인덱스 추출
    const index = parseInt(indexLine, 10);
    if (isNaN(index)) continue;

    // 시간 추출 (00:00:20,000 --> 00:00:24,400)
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeMatch) continue;

    const [, startTime, endTime] = timeMatch;

    // 텍스트 추출
    const text = textLines.join("\n");

    cues.push({
      index,
      startTime,
      endTime,
      text,
    });
  }

  return cues;
}

/**
 * VTT 파일 파싱
 * @param content - VTT 파일 내용 (문자열)
 */
export function parseVTT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];

  // WEBVTT 헤더 제거
  const withoutHeader = content.replace(/^WEBVTT[\s\S]*?\n\n/, "");
  const blocks = withoutHeader.trim().split(/\n\s*\n/);

  let index = 1;
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;

    let timeLine = lines[0].trim();
    let textLines = lines.slice(1);

    // 첫 줄이 ID인 경우 (선택적)
    if (!timeLine.includes("-->")) {
      if (lines.length < 3) continue;
      timeLine = lines[1].trim();
      textLines = lines.slice(2);
    }

    // 시간 추출 (00:00:20.000 --> 00:00:24.400)
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/);
    if (!timeMatch) continue;

    const [, startTime, endTime] = timeMatch;

    // 텍스트 추출
    const text = textLines.join("\n");

    cues.push({
      index: index++,
      startTime,
      endTime,
      text,
    });
  }

  return cues;
}

/**
 * 자막 파일 형식 감지
 * @param content - 파일 내용
 */
export function detectSubtitleFormat(content: string): "srt" | "vtt" | "unknown" {
  const trimmed = content.trim();

  // VTT 형식 체크 (WEBVTT 헤더)
  if (trimmed.startsWith("WEBVTT")) {
    return "vtt";
  }

  // SRT 형식 체크 (첫 줄이 숫자)
  if (/^1\s*\n\d{2}:\d{2}:\d{2},\d{3}/.test(trimmed)) {
    return "srt";
  }

  return "unknown";
}

/**
 * 자막 파일 검증
 * @param content - 파일 내용
 * @param format - 파일 형식
 */
export function validateSubtitleFile(
  content: string,
  format: "srt" | "vtt"
): { valid: boolean; error?: string; cuesCount?: number } {
  try {
    let cues: SubtitleCue[];

    if (format === "srt") {
      cues = parseSRT(content);
    } else {
      cues = parseVTT(content);
    }

    if (cues.length === 0) {
      return {
        valid: false,
        error: "자막 큐가 하나도 없습니다. 파일 형식을 확인해주세요.",
      };
    }

    return {
      valid: true,
      cuesCount: cues.length,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "파일 파싱 중 오류가 발생했습니다",
    };
  }
}

/**
 * SRT → VTT 변환
 * @param srtContent - SRT 파일 내용
 */
export function convertSRTtoVTT(srtContent: string): string {
  const cues = parseSRT(srtContent);

  let vtt = "WEBVTT\n\n";

  for (const cue of cues) {
    // SRT 시간 형식 (00:00:20,000) → VTT 형식 (00:00:20.000)
    const startTime = cue.startTime.replace(",", ".");
    const endTime = cue.endTime.replace(",", ".");

    vtt += `${startTime} --> ${endTime}\n`;
    vtt += `${cue.text}\n\n`;
  }

  return vtt;
}

/**
 * VTT → SRT 변환
 * @param vttContent - VTT 파일 내용
 */
export function convertVTTtoSRT(vttContent: string): string {
  const cues = parseVTT(vttContent);

  let srt = "";

  for (const cue of cues) {
    // VTT 시간 형식 (00:00:20.000) → SRT 형식 (00:00:20,000)
    const startTime = cue.startTime.replace(".", ",");
    const endTime = cue.endTime.replace(".", ",");

    srt += `${cue.index}\n`;
    srt += `${startTime} --> ${endTime}\n`;
    srt += `${cue.text}\n\n`;
  }

  return srt;
}

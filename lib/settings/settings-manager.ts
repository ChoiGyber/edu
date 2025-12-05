import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/security/encryption';
import { SettingKey } from '@/types/system-settings';

/**
 * 시스템 설정값 조회 (복호화 자동 처리)
 */
export async function getSetting(key: SettingKey): Promise<string | null> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      // 환경 변수 폴백 (DB에 없으면 .env에서 읽기)
      return process.env[key] || null;
    }

    const value = setting.value as any;

    // 암호화된 값이면 복호화
    if (value.encrypted && value.encryptedValue) {
      return decrypt(value.encryptedValue);
    }

    return value.plainValue || null;
  } catch (error) {
    console.error(`Failed to get setting ${key}:`, error);
    // 에러 시 환경 변수 폴백
    return process.env[key] || null;
  }
}

/**
 * 여러 설정값 한번에 조회
 */
export async function getSettings(keys: SettingKey[]): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};

  await Promise.all(
    keys.map(async (key) => {
      result[key] = await getSetting(key);
    })
  );

  return result;
}

/**
 * 시스템 설정값 저장 (암호화 자동 처리)
 */
export async function setSetting(
  key: SettingKey,
  value: string,
  encrypted: boolean = false
): Promise<void> {
  try {
    const settingValue = encrypted
      ? {
          encrypted: true,
          encryptedValue: encrypt(value),
        }
      : {
          encrypted: false,
          plainValue: value,
        };

    await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: settingValue,
      },
      create: {
        key,
        value: settingValue,
      },
    });
  } catch (error) {
    console.error(`Failed to set setting ${key}:`, error);
    throw error;
  }
}

/**
 * 여러 설정값 한번에 저장
 */
export async function setSettings(
  settings: Array<{ key: SettingKey; value: string; encrypted: boolean }>
): Promise<void> {
  await Promise.all(
    settings.map(({ key, value, encrypted }) => setSetting(key, value, encrypted))
  );
}

/**
 * 설정값 삭제
 */
export async function deleteSetting(key: SettingKey): Promise<void> {
  await prisma.systemSetting.delete({
    where: { key },
  });
}

/**
 * 모든 설정값 조회 (관리자 페이지용)
 */
export async function getAllSettings(): Promise<
  Array<{ key: string; hasValue: boolean; encrypted: boolean; updatedAt: Date }>
> {
  const settings = await prisma.systemSetting.findMany({
    orderBy: { key: 'asc' },
  });

  return settings.map((setting) => {
    const value = setting.value as any;
    return {
      key: setting.key,
      hasValue: !!(value.plainValue || value.encryptedValue),
      encrypted: value.encrypted || false,
      updatedAt: setting.updatedAt,
    };
  });
}

/**
 * 설정값이 존재하는지 확인
 */
export async function hasSetting(key: SettingKey): Promise<boolean> {
  const value = await getSetting(key);
  return value !== null && value !== '';
}

/**
 * 필수 설정값이 모두 설정되었는지 확인
 */
export async function checkRequiredSettings(): Promise<{
  isComplete: boolean;
  missing: SettingKey[];
}> {
  const requiredKeys = [
    SettingKey.NEXTAUTH_URL,
    SettingKey.NEXTAUTH_SECRET,
    SettingKey.R2_ACCOUNT_ID,
    SettingKey.R2_ACCESS_KEY_ID,
    SettingKey.R2_SECRET_ACCESS_KEY,
    SettingKey.R2_BUCKET_NAME,
    SettingKey.ENCRYPTION_KEY,
    SettingKey.JWT_SECRET,
  ];

  const missing: SettingKey[] = [];

  for (const key of requiredKeys) {
    const hasValue = await hasSetting(key);
    if (!hasValue) {
      missing.push(key);
    }
  }

  return {
    isComplete: missing.length === 0,
    missing,
  };
}

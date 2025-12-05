import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits

/**
 * 암호화 키 가져오기 (환경 변수 or 기본값)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;

  if (!key) {
    console.warn('ENCRYPTION_KEY가 설정되지 않았습니다. 기본 키를 사용합니다.');
    // 개발 환경용 기본 키 (프로덕션에서는 반드시 설정 필요)
    return crypto.scryptSync('default-encryption-key-change-in-production', 'salt', KEY_LENGTH);
  }

  // HEX 문자열인 경우
  if (key.length === 64 && /^[0-9a-f]+$/i.test(key)) {
    return Buffer.from(key, 'hex');
  }

  // 일반 문자열인 경우 (scrypt로 KEY_LENGTH에 맞게 변환)
  return crypto.scryptSync(key, 'salt', KEY_LENGTH);
}

/**
 * 데이터 암호화 (AES-256-CBC)
 */
export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // IV와 암호화된 데이터를 함께 저장 (구분자: :)
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('암호화에 실패했습니다');
  }
}

/**
 * 데이터 복호화
 */
export function decrypt(encryptedText: string): string {
  try {
    const key = getEncryptionKey();

    // IV와 암호화된 데이터 분리
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('잘못된 암호화 형식입니다');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('복호화에 실패했습니다');
  }
}

/**
 * 랜덤 키 생성 (HEX)
 */
export function generateRandomKey(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

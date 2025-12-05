/**
 * Test fixture data for QR tokens
 */

export const mockQRTokens = {
  valid: {
    token: 'mock-qr-token-valid',
    payload: {
      sessionId: 'history-001',
      courseId: 'course-001',
      tenantId: 'tenant-abc123',
      language: 'vi',
      expiresAt: Date.now() + 30 * 60 * 1000, // 30분 후
    },
    url: 'http://localhost:3000/mobile/learn?token=mock-qr-token-valid',
    qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  },

  expired: {
    token: 'mock-qr-token-expired',
    payload: {
      sessionId: 'history-002',
      courseId: 'course-002',
      tenantId: 'tenant-abc123',
      language: 'en',
      expiresAt: Date.now() - 10 * 60 * 1000, // 10분 전 만료
    },
    url: 'http://localhost:3000/mobile/learn?token=mock-qr-token-expired',
    qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  },

  verify: {
    token: 'mock-verify-token-valid',
    payload: {
      sessionId: 'history-001',
      courseId: 'course-001',
      tenantId: 'tenant-abc123',
      expiresAt: Date.now() + 30 * 60 * 1000,
    },
    url: 'http://localhost:3000/mobile/verify?token=mock-verify-token-valid',
    qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  },
};

/**
 * Helper to generate mock JWT tokens for testing
 */
export function generateMockJWT(payload: Record<string, any>): string {
  // For testing purposes, return a simple base64 encoded JSON
  // In real tests, you might want to use actual JWT signing
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = 'mock-signature';

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Helper to verify mock JWT tokens
 */
export function verifyMockJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    // Check expiration
    if (payload.expiresAt && payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

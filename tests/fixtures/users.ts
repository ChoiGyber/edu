/**
 * Test fixture data for users with different roles
 */

export const mockUsers = {
  admin: {
    id: 'user-admin-001',
    email: 'admin@test.com',
    name: '관리자 테스트',
    phone: '010-1234-5678',
    companyName: '테스트 건설',
    siteName: '서울 현장',
    industry: 'CONSTRUCTION',
    role: 'ADMIN',
    isActive: true,
    preferredLanguages: ['ko'],
    provider: 'google',
    providerId: 'google-admin-001',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },

  subAdmin: {
    id: 'user-subadmin-001',
    email: 'subadmin@test.com',
    name: '보조관리자 테스트',
    phone: '010-2345-6789',
    companyName: '테스트 건설',
    siteName: '부산 현장',
    industry: 'CONSTRUCTION',
    role: 'SUB_ADMIN',
    isActive: true,
    preferredLanguages: ['ko'],
    provider: 'kakao',
    providerId: 'kakao-subadmin-001',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },

  user: {
    id: 'user-001',
    email: 'user@test.com',
    name: '일반사용자 테스트',
    phone: '010-3456-7890',
    companyName: '테스트 건설',
    industry: 'CONSTRUCTION',
    role: 'USER',
    isActive: true,
    preferredLanguages: ['ko', 'en'],
    provider: 'naver',
    providerId: 'naver-user-001',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
};

/**
 * Test sessions for authenticated users
 */
export const mockSessions = {
  admin: {
    id: 'session-admin-001',
    userId: mockUsers.admin.id,
    ipAddress: '127.0.0.1',
    token: 'mock-jwt-token-admin',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },

  subAdmin: {
    id: 'session-subadmin-001',
    userId: mockUsers.subAdmin.id,
    ipAddress: '127.0.0.1',
    token: 'mock-jwt-token-subadmin',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },

  user: {
    id: 'session-user-001',
    userId: mockUsers.user.id,
    ipAddress: '127.0.0.1',
    token: 'mock-jwt-token-user',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
};

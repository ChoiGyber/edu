/**
 * Test fixture data for education histories
 */

import { mockCourses } from './courses';

export const mockAttendees = [
  {
    id: 'attendee-001',
    name: '김철수',
    nationality: 'KO',
    language: 'ko',
    signatureUrl: 'https://example.r2.cloudflarestorage.com/signatures/sig-001.png',
    selfieUrl: 'https://example.r2.cloudflarestorage.com/selfies/selfie-001.jpg',
    gpsLatitude: 37.5665,
    gpsLongitude: 126.9780,
    completedAt: '2024-01-25T10:30:00.000Z',
    deviceType: 'MOBILE',
    consentGiven: true,
    consentAt: '2024-01-25T10:00:00.000Z',
  },
  {
    id: 'attendee-002',
    name: '이영희',
    nationality: 'KO',
    language: 'ko',
    signatureUrl: 'https://example.r2.cloudflarestorage.com/signatures/sig-002.png',
    selfieUrl: 'https://example.r2.cloudflarestorage.com/selfies/selfie-002.jpg',
    gpsLatitude: 37.5665,
    gpsLongitude: 126.9780,
    completedAt: '2024-01-25T10:32:00.000Z',
    deviceType: 'PC',
    consentGiven: true,
    consentAt: '2024-01-25T10:00:00.000Z',
  },
  {
    id: 'attendee-003',
    name: 'Nguyen Van A',
    nationality: 'VN',
    language: 'vi',
    signatureUrl: 'https://example.r2.cloudflarestorage.com/signatures/sig-003.png',
    selfieUrl: 'https://example.r2.cloudflarestorage.com/selfies/selfie-003.jpg',
    gpsLatitude: 37.5665,
    gpsLongitude: 126.9780,
    completedAt: '2024-01-25T10:35:00.000Z',
    deviceType: 'MOBILE',
    consentGiven: true,
    consentAt: '2024-01-25T10:00:00.000Z',
  },
  {
    id: 'attendee-004',
    name: 'Wang Wei',
    nationality: 'CN',
    language: 'zh',
    signatureUrl: 'https://example.r2.cloudflarestorage.com/signatures/sig-004.png',
    selfieUrl: 'https://example.r2.cloudflarestorage.com/selfies/selfie-004.jpg',
    gpsLatitude: 37.5665,
    gpsLongitude: 126.9780,
    completedAt: '2024-01-25T10:37:00.000Z',
    deviceType: 'MOBILE',
    consentGiven: true,
    consentAt: '2024-01-25T10:00:00.000Z',
  },
];

export const mockHistories = {
  completed: {
    id: 'history-001',
    courseId: mockCourses.basic.id,
    courseTitleSnapshot: mockCourses.basic.title,
    startedAt: '2024-01-25T10:00:00.000Z',
    completedAt: '2024-01-25T10:40:00.000Z',
    totalAttendees: 4,
    attendees: mockAttendees,
    byNationality: {
      KO: 2,
      VN: 1,
      CN: 1,
    },
    certificateUrl: 'https://example.r2.cloudflarestorage.com/certificates/cert-001.pdf',
    screenshots: [
      'https://example.r2.cloudflarestorage.com/screenshots/screen-001-1.jpg',
      'https://example.r2.cloudflarestorage.com/screenshots/screen-001-2.jpg',
    ],
    qrTokenExpiry: 30,
    executedBy: 'user-admin-001',
    createdAt: '2024-01-25T10:00:00.000Z',
  },

  inProgress: {
    id: 'history-002',
    courseId: mockCourses.advanced.id,
    courseTitleSnapshot: mockCourses.advanced.title,
    startedAt: '2024-01-26T09:00:00.000Z',
    completedAt: null,
    totalAttendees: 0,
    attendees: [],
    byNationality: {},
    certificateUrl: null,
    screenshots: [],
    qrTokenExpiry: 30,
    executedBy: 'user-subadmin-001',
    createdAt: '2024-01-26T09:00:00.000Z',
  },
};

/**
 * Mock history list for filtering tests
 */
export const mockHistoryList = Object.values(mockHistories);

/**
 * Mock monthly statistics
 */
export const mockMonthlyStats = {
  year: 2024,
  month: 1,
  totalSessions: 12,
  totalAttendees: 48,
  byNationality: {
    KO: 25,
    VN: 12,
    CN: 8,
    TH: 3,
  },
  popularCourses: {
    '건설 현장 기본 안전 교육': 8,
    '중장비 안전 교육': 4,
  },
};

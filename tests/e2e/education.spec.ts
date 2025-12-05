import { test, expect } from '@playwright/test';

test.describe('Education Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Note: 실제 테스트에서는 인증된 세션 필요
    // await page.goto('/auth/signin');
    // ... 로그인 처리
  });

  test('should display education history list', async ({ page }) => {
    await page.goto('/dashboard/histories');
    
    // 교육 이력 페이지가 로드되는지 확인
    await expect(page.getByText('교육 이력 관리')).toBeVisible();
    
    // 필터 요소 확인
    await expect(page.getByLabel('시작 날짜')).toBeVisible();
    await expect(page.getByLabel('종료 날짜')).toBeVisible();
  });

  test('should export excel report', async ({ page }) => {
    await page.goto('/dashboard/histories');
    
    // Excel 다운로드 버튼 확인
    const downloadButton = page.getByText('Excel 다운로드');
    await expect(downloadButton).toBeVisible();
    
    // Note: 실제 다운로드 테스트는 별도 설정 필요
  });
});

test.describe('Mobile Learning', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display language selection modal', async ({ page }) => {
    // Note: QR 토큰이 필요하므로 mock 데이터 필요
    // await page.goto('/mobile/learn?token=test-token');
  });

  test('should play video with subtitles', async ({ page }) => {
    // 모바일 영상 재생 테스트
  });
});

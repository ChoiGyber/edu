import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // 로그인 페이지가 표시되는지 확인
    await expect(page).toHaveTitle(/로그인|Sign In/);
    
    // OAuth 버튼이 있는지 확인
    await expect(page.getByText(/Google/)).toBeVisible();
  });

  test('should redirect to dashboard after login', async ({ page }) => {
    // Note: 실제 OAuth 로그인 테스트는 mock 필요
    // 이것은 기본 구조 예시입니다
  });
});

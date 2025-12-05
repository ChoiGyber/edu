/**
 * Authentication helpers for Playwright E2E tests
 */

import { Page } from '@playwright/test';
import { mockUsers, mockSessions } from '../fixtures';

/**
 * Authenticate as a specific user role
 */
export async function authenticateAs(
  page: Page,
  role: 'admin' | 'subAdmin' | 'user'
): Promise<void> {
  const user = mockUsers[role];
  const session = mockSessions[role];

  // Set authentication cookies/tokens
  await page.context().addCookies([
    {
      name: 'next-auth.session-token',
      value: session.token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      expires: Math.floor(new Date(session.expiresAt).getTime() / 1000),
    },
  ]);

  // Set localStorage if needed
  await page.evaluate(
    ({ user, session }) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('session', JSON.stringify(session));
    },
    { user, session }
  );
}

/**
 * Login via OAuth (mocked)
 */
export async function loginWithOAuth(
  page: Page,
  provider: 'google' | 'kakao' | 'naver',
  role: 'admin' | 'subAdmin' | 'user' = 'user'
): Promise<void> {
  await page.goto('/auth/signin');

  // Mock OAuth callback
  await page.route('**/api/auth/callback/**', async (route) => {
    await route.fulfill({
      status: 302,
      headers: {
      Location: '/dashboard',
      },
    });
  });

  // Click provider button
  const providerMap = {
    google: 'Google',
    kakao: 'Kakao',
    naver: 'Naver',
  };

  await page.getByText(providerMap[provider]).click();

  // Set auth cookies after redirect
  await authenticateAs(page, role);

  await page.waitForURL('/dashboard');
}

/**
 * Logout
 */
export async function logout(page: Page): Promise<void> {
  await page.goto('/api/auth/signout');
  await page.waitForURL('/auth/signin');
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some((cookie) => cookie.name === 'next-auth.session-token');
}

/**
 * Get current user from page context
 */
export async function getCurrentUser(page: Page): Promise<any> {
  return page.evaluate(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });
}

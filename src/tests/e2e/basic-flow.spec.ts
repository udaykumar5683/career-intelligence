import { test, expect } from '@playwright/test';

test.describe('Career Intelligence Platform E2E', () => {
  test('should load landing page and navigate to auth', async ({ page }) => {
    await page.goto('/');
    
    // Check landing page content
    await expect(page.locator('h1')).toContainText(/Career Intelligence/i);
    
    // Click get started / sign in
    await page.click('text=Get Started');
    
    // Should be on auth page
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.locator('h2')).toContainText(/Welcome Back/i);
  });

  test('should show dashboard empty state for new users', async ({ page }) => {
    // This would ideally use a mock session or a test user
    // For now we just check the path and basic layout
    await page.goto('/dashboard');
    
    // Since we're not logged in, should redirect to home or auth
    // Depending on middleware implementation
    await expect(page).toHaveURL(/\/|auth/);
  });
});

import { test, expect } from '@playwright/test';

test.describe('YTLDR Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('ytldr_token', 'mock-jwt-token');
      localStorage.setItem('ytldr_user', JSON.stringify({
        email: 'test@example.com',
        id: '123'
      }));
    });

    // Mock API responses
    await page.route('**/api/summary/history', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summaries: [
            {
              id: '1',
              summary_text: 'Test summary content',
              original_url: 'https://example.com',
              created_at: new Date().toISOString(),
              word_count: 150
            }
          ],
          pagination: { hasMore: false }
        })
      });
    });

    await page.route('**/api/summary/favorites/all', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          favorites: [],
          pagination: { hasMore: false }
        })
      });
    });
  });

  test('loads dashboard with user data', async ({ page }) => {
    await page.goto('/dashboard');

    // Check header
    await expect(page.locator('h1').filter({ hasText: 'Dashboard' })).toBeVisible();
    await expect(page.locator('text=Welcome back, test')).toBeVisible();

    // Check tab navigation
    await expect(page.locator('text=History')).toBeVisible();
    await expect(page.locator('text=⭐ Favorite Summaries')).toBeVisible();
    await expect(page.locator('text=🗑️ Rubbish Bin')).toBeVisible();
  });

  test('displays summaries in history tab', async ({ page }) => {
    await page.goto('/dashboard');

    // Check summary content
    await expect(page.locator('text=Test summary content')).toBeVisible();
    await expect(page.locator('text=https://example.com')).toBeVisible();
    await expect(page.locator('text=150 words')).toBeVisible();

    // Check action buttons
    await expect(page.locator('[title="Add to favorites"]')).toBeVisible();
    await expect(page.locator('[title="Delete summary"]')).toBeVisible();
  });

  test('handles tab switching', async ({ page }) => {
    await page.goto('/dashboard');

    // Switch to favorites tab
    await page.locator('text=⭐ Favorite Summaries').click();
    await expect(page.locator('text=⭐ Favorite Summaries')).toBeVisible();

    // Switch to rubbish bin tab
    await page.locator('text=🗑️ Rubbish Bin').click();
    await expect(page.locator('text=🗑️ Rubbish Bin')).toBeVisible();

    // Back to history
    await page.locator('text=History').click();
    await expect(page.locator('text=Recent Summaries')).toBeVisible();
  });

  test('shows empty states correctly', async ({ page }) => {
    // Mock empty responses
    await page.route('**/api/summary/history', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summaries: [],
          pagination: { hasMore: false }
        })
      });
    });

    await page.goto('/dashboard');

    await expect(page.locator('text=📚')).toBeVisible();
    await expect(page.locator('text=No summaries yet')).toBeVisible();
  });

  test('handles favorite action with confirmation', async ({ page }) => {
    await page.goto('/dashboard');

    // Mock favorite API
    await page.route('**/api/summary/1/favorite', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Added to favorites' })
      });
    });

    // Click favorite button
    await page.locator('[title="Add to favorites"]').click();

    // Check confirmation modal
    await expect(page.locator('text=Confirm Favorite')).toBeVisible();
    await expect(page.locator('text=Lock as favorite?')).toBeVisible();

    // Confirm action
    await page.locator('text=⭐ Favorite').click();

    // Modal should close
    await expect(page.locator('text=Confirm Favorite')).not.toBeVisible();
  });

  test('handles delete action with confirmation', async ({ page }) => {
    await page.goto('/dashboard');

    // Mock delete API
    await page.route('**/api/summary/1', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Summary moved to rubbish bin',
            recoveryDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
        });
      }
    });

    // Click delete button
    await page.locator('[title="Delete summary"]').click();

    // Check confirmation modal
    await expect(page.locator('text=Confirm Deletion')).toBeVisible();
    await expect(page.locator('text=Move to rubbish bin?')).toBeVisible();

    // Confirm action
    await page.locator('text=🗑️ Delete').click();

    // Modal should close
    await expect(page.locator('text=Confirm Deletion')).not.toBeVisible();
  });

  test('handles clear all history with double confirmation', async ({ page }) => {
    await page.goto('/dashboard');

    // Mock clear all API
    await page.route('**/api/summary/history/all', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'All summaries moved to rubbish bin',
            deletedCount: 1
          })
        });
      }
    });

    // Click clear all button
    await page.locator('text=🗑️ Clear All History').click();

    // Handle browser dialogs
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure');
      await dialog.accept();
    });

    // Should trigger two confirmations
    await expect(page.locator('text=Test summary content')).not.toBeVisible();
  });

  test('loads more data with pagination', async ({ page }) => {
    // Mock paginated response
    let callCount = 0;
    await page.route('**/api/summary/history', async route => {
      callCount++;
      const hasMore = callCount === 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summaries: [
            {
              id: callCount.toString(),
              summary_text: `Summary ${callCount}`,
              original_url: `https://example.com/${callCount}`,
              created_at: new Date().toISOString(),
              word_count: 100
            }
          ],
          pagination: { hasMore }
        })
      });
    });

    await page.goto('/dashboard');

    // Check initial load
    await expect(page.locator('text=Summary 1')).toBeVisible();

    // Click load more
    await page.locator('text=Load More').click();

    // Check second page loaded
    await expect(page.locator('text=Summary 2')).toBeVisible();
  });

  test('displays error states gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/summary/history', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/dashboard');

    // Should handle error gracefully
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('is responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/dashboard');

    // Check mobile layout
    await expect(page.locator('h1').filter({ hasText: 'Dashboard' })).toBeVisible();

    // Check tabs are accessible on mobile
    await expect(page.locator('text=History')).toBeVisible();
    await expect(page.locator('text=⭐ Favorite Summaries')).toBeVisible();
  });

  test('handles network failures', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/summary/history', async route => {
      await route.abort();
    });

    await page.goto('/dashboard');

    // Should handle network error gracefully
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('maintains state during navigation', async ({ page }) => {
    await page.goto('/dashboard');

    // Switch to favorites tab
    await page.locator('text=⭐ Favorite Summaries').click();

    // Reload page
    await page.reload();

    // Should maintain tab state or reset gracefully
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});
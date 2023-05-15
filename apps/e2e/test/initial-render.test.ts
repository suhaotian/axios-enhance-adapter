import { test, expect } from '@playwright/test';

const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test.describe('rendering', () => {
  test('should work', async ({ page }) => {
    const log: any[] = [];
    await page.exposeFunction('onRender', (msg: any) => log.push(msg));
    await page.goto('./initial-render', { waitUntil: 'commit' });
    await expect(page.getByText('axios-enhance-adapter')).toBeVisible();
    await sleep(1200);
    expect(log).toHaveLength(1);
  });
});

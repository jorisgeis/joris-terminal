import { expect, test } from '@playwright/test';

const FONT_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);

test('answers "when can he start?" and talks to nobody but Google Fonts', async ({
  page,
  baseURL,
}) => {
  const origin = new URL(baseURL ?? 'http://localhost:4173').origin;
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Joris Geis' })).toBeVisible();
  await expect(page.getByText('as soon as possible', { exact: true })).toBeVisible();

  const input = page.getByLabel('Ask a question or type a command');
  await input.fill('when can he start?');
  await input.press('Enter');

  const answer = page.locator('.turn .ans').last();
  await expect(answer).toContainText(
    'He can start as soon as possible, for 6–12 months, full-time and on-site, anywhere in the US.',
  );
  await expect(page.locator('.turn .tool .res').last()).toHaveText('└ read 6 lines');
  await expect(page.getByRole('button', { name: 'ask' })).toBeEnabled();
  await page.waitForLoadState('networkidle');

  const outside = requests.filter((u) => {
    const url = new URL(u);
    if (url.protocol === 'data:' || url.origin === origin) return false;
    return !FONT_HOSTS.has(url.hostname);
  });
  expect(outside).toEqual([]);
  expect(requests.filter((u) => decodeURIComponent(u).includes('can he start'))).toEqual([]);
});

test('hides the ASCII banner below 600px', async ({ page }) => {
  await page.goto('/');
  const banner = page.getByRole('img', { name: 'Joris Geis' });
  const width = page.viewportSize()?.width ?? 0;
  if (width < 600) await expect(banner).toBeHidden();
  else await expect(banner).toBeVisible();
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(width);
});

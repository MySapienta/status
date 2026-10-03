import { expect, test } from '@playwright/test'
import { FIXED_NOW, scenarios } from './fixtures.ts'

const WIDTHS = [320, 768, 1440]

for (const scenario of scenarios) {
  for (const width of WIDTHS) {
    test(`${scenario.name} at ${width}px`, async ({ page }) => {
      await page.clock.setFixedTime(FIXED_NOW)
      await page.setViewportSize({ width, height: 900 })
      await page.route('https://raw.githubusercontent.com/**/status.json', (route) =>
        route.fulfill({ json: scenario.status }),
      )
      await page.route('https://raw.githubusercontent.com/**/history.json', (route) =>
        route.fulfill({ json: scenario.history }),
      )

      await page.goto('/')
      await expect(page.getByRole('heading', { name: scenario.heading })).toBeVisible()
      await page.evaluate(() => document.fonts.ready)

      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )
      expect(hasHorizontalScroll).toBe(false)

      await expect(page).toHaveScreenshot(`${scenario.name}-${width}.png`, { fullPage: true })
    })
  }
}

test('retry button and footer link are reachable by keyboard', async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', (route) => route.fulfill({ status: 500, body: '' }))
  await page.goto('/')
  await expect(page.getByText('We could not load the status right now')).toBeVisible()

  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Try again' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Go to mysapienta.com' })).toBeFocused()
})

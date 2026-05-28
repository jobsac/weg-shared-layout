import { page } from 'vitest/browser';

export const DESKTOP_VIEWPORT = { width: 1280, height: 720 } as const;
export const MOBILE_VIEWPORT = { width: 375, height: 667 } as const;

export async function setViewport(width: number, height: number) {
  await page.viewport(width, height);
}

export async function waitForUpdate() {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

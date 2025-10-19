import { test, expect, chromium, BrowserContext } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// __dirname compatível com ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// caminho do dist/ (gera com npm run build)
const dist = path.resolve(__dirname, '..', 'dist');

/** Abre o Chromium persistente com a extensão carregada */
async function launchWithExtension() {
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${dist}`,
      `--load-extension=${dist}`
    ]
  });
  return context;
}

/** Recupera o ID da extensão a partir da URL do service worker (MV3) */
async function getExtensionId(context: BrowserContext) {
  const existing = context.serviceWorkers();
  for (const sw of existing) {
    const url = sw.url();
    if (url.startsWith('chrome-extension://')) return new URL(url).host;
  }
  const sw = await context.waitForEvent('serviceworker', { timeout: 30000 });
  return new URL(sw.url()).host;
}

/** 1) Service worker (background) está ativo */
test('background (service worker) está ativo', async () => {
  const context = await launchWithExtension();
  const extId = await getExtensionId(context);
  expect(extId).toMatch(/^[a-p]{32}$/i);
  await context.close();
});

/** 2) Options abre e expõe chrome.runtime.id */
test('options carrega e expõe chrome.runtime.id', async () => {
  const context = await launchWithExtension();
  const extId = await getExtensionId(context);

  const page = await context.newPage();
  await page.goto(`chrome-extension://${extId}/src/options/options.html`);
  await page.waitForLoadState('domcontentloaded');

  const hasId = await page.evaluate(
    () => typeof chrome?.runtime?.id === 'string' && chrome.runtime.id.length > 0
  );
  expect(hasId).toBeTruthy();

  await context.close();
});

/** 3) Popup abre e carrega título (ajuste o caminho se necessário) */
test('popup abre e carrega título', async () => {
  const context = await launchWithExtension();
  const extId = await getExtensionId(context);

  const page = await context.newPage();
  await page.goto(`chrome-extension://${extId}/src/popup/popup.html`);
  await page.waitForLoadState('domcontentloaded');

  const title = await page.title();
  expect(title).toBeTruthy();

  await context.close();
});

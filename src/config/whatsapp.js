import * as chromeLauncher from 'chrome-launcher';

let chromeInstance = null;

export const whatsappConfig = {
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
};

export async function initializeBrowser() {
  if (!chromeInstance) {
    chromeInstance = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--disable-gpu',
        '--remote-debugging-port=9222'
      ]
    });
    whatsappConfig.puppeteer.browserWSEndpoint = `ws://127.0.0.1:9222/devtools/browser/${chromeInstance.pid}`;
  }
  return whatsappConfig;
}
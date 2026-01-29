import { Command } from 'commander';
import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';

export const authCommand = new Command('auth')
  .description('Record authentication for a site')
  .argument('<site>', 'Site name (e.g., spare-room)')
  .option('--profile', 'Use persistent profile instead of storage state')
  .option('--url <url>', 'Login URL (optional, uses default for known sites)')
  .action(async (site: string, options) => {
    const mode = options.profile ? 'profile' : 'storage';

    console.log(`Recording authentication for ${site} (mode: ${mode})`);

    if (mode === 'storage') {
      await recordStorageState(site, options.url);
    } else {
      await recordProfile(site, options.url);
    }
  });

async function recordStorageState(site: string, url?: string): Promise<void> {
  const loginUrl = url || getDefaultLoginUrl(site);
  const storagePath = join('.secrets', `${site}.storageState.json`);

  console.log(`Opening browser to ${loginUrl}`);
  console.log('Please login manually...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(loginUrl);

  console.log('Press Enter when login is complete...');
  await new Promise((resolve) => {
    process.stdin.once('data', resolve);
  });

  // Save storage state
  await mkdir(dirname(storagePath), { recursive: true });
  await context.storageState({ path: storagePath });

  await browser.close();

  console.log(`Authentication saved to ${storagePath}`);
}

async function recordProfile(site: string, url?: string): Promise<void> {
  const loginUrl = url || getDefaultLoginUrl(site);
  const profilePath = join('.secrets', 'profiles', site);

  console.log(`Opening browser with profile ${profilePath}`);
  console.log('Please login manually...');

  await mkdir(profilePath, { recursive: true });

  const browser = await chromium.launchPersistentContext(profilePath, {
    headless: false,
  });
  const page = await browser.newPage();

  await page.goto(loginUrl);

  console.log('Press Enter when login is complete...');
  await new Promise((resolve) => {
    process.stdin.once('data', resolve);
  });

  await browser.close();

  console.log(`Profile saved to ${profilePath}`);
}

function getDefaultLoginUrl(site: string): string {
  const urls: Record<string, string> = {
    'spare-room': 'https://www.spareroom.co.uk/login',
  };

  return urls[site] || 'https://example.com';
}

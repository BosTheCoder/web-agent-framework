import { Command } from 'commander';
import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { generateReview } from '@web-agent/orchestrator';

export const reviewCommand = new Command('review')
  .description('Generate review markdown for pending drafts')
  .requiredOption('--site <site>', 'Site name')
  .option('--output <path>', 'Output path for review file')
  .action(async (options) => {
    const { site, output } = options;

    const dbPath = join('data', 'web-agent.db');
    const db = new Database(dbPath);

    const date = new Date().toISOString().split('T')[0];
    const outputPath = output || join('data', `review-${site}-${date}.md`);

    await mkdir('data', { recursive: true });

    const count = await generateReview({
      site,
      db,
      outputPath,
    });

    db.close();

    if (count === 0) {
      console.log('No pending drafts to review');
    } else {
      console.log(`Review file created: ${outputPath}`);
      console.log(`  Pending drafts: ${count}`);
    }
  });

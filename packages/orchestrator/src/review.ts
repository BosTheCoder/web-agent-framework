import Database from 'better-sqlite3';
import { getDraftsBySiteAndStatus, Draft } from './db/queries.js';
import { writeFile } from 'fs/promises';
import pino from 'pino';

const logger = pino({ name: 'review' });

export interface ReviewOptions {
  site: string;
  db: Database.Database;
  outputPath: string;
}

export async function generateReview(options: ReviewOptions): Promise<number> {
  const { site, db, outputPath } = options;

  logger.info({ site }, 'Generating review markdown');

  const drafts = getDraftsBySiteAndStatus(db, site, 'pending');

  if (drafts.length === 0) {
    logger.info('No pending drafts to review');
    return 0;
  }

  const markdown = generateReviewMarkdown(drafts, site);
  await writeFile(outputPath, markdown, 'utf-8');

  logger.info({ path: outputPath, count: drafts.length }, 'Review file created');
  return drafts.length;
}

function generateReviewMarkdown(drafts: Draft[], site: string): string {
  const date = new Date().toISOString().split('T')[0];

  let md = `# Review: ${site} - ${date}\n\n`;
  md += `**Total Drafts:** ${drafts.length}\n\n`;
  md += `## Instructions\n\n`;
  md += `- Edit draft text inline to modify\n`;
  md += `- Delete entire section (including \`---\`) to reject\n`;
  md += `- Keep as-is to approve\n`;
  md += `- Save file and run: \`web-agent send --site ${site} --review-file <path>\`\n\n`;
  md += `---\n\n`;

  for (const draft of drafts) {
    md += `## Draft ${draft.id}\n\n`;
    md += `**Thread:** ${draft.threadId}\n`;
    md += `**Confidence:** ${draft.confidence || 'unknown'}\n`;
    md += `**Requires Review:** ${draft.requiresReview ? 'Yes' : 'No'}\n\n`;
    md += `**Draft Reply:**\n\n`;
    md += `\`\`\`\n${draft.draftText}\n\`\`\`\n\n`;
    md += `---\n\n`;
  }

  return md;
}

export function parseReviewMarkdown(content: string): Map<number, string> {
  const approved = new Map<number, string>();

  // Split by draft sections
  const sections = content.split(/^## Draft (\d+)$/gm);

  for (let i = 1; i < sections.length; i += 2) {
    const draftId = parseInt(sections[i], 10);
    const section = sections[i + 1];

    // Extract draft text from code block
    const match = section.match(/```\n([\s\S]*?)\n```/);
    if (match) {
      approved.set(draftId, match[1].trim());
    }
  }

  return approved;
}

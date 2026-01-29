import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import { join } from 'path';
import pino from 'pino';

const logger = pino({ name: 'claude-cli' });

export interface DraftReplyInput {
  threadId: string;
  messages: Array<{
    from: string;
    text: string;
    timestamp: Date;
  }>;
}

export interface DraftReplySuccess {
  success: true;
  draft: string;
  tone: string;
  confidence: string;
  questions: string[];
  shouldSend: boolean;
}

export interface DraftReplyFailure {
  success: false;
  requiresReview: true;
  rawOutput: string;
  error: string;
}

export type DraftReplyResult = DraftReplySuccess | DraftReplyFailure;

interface DraftReplyOptions {
  mockResponse?: string;
}

export async function draftReply(
  input: DraftReplyInput,
  options?: DraftReplyOptions
): Promise<DraftReplyResult> {
  try {
    // Load prompt template
    const templatePath = join(process.cwd(), 'prompts', 'draft_reply.md');
    const template = await readFile(templatePath, 'utf-8');

    // Format thread context
    const threadContext = input.messages
      .map((msg) => `[${msg.from}]: ${msg.text}`)
      .join('\n\n');

    const prompt = template.replace('{{THREAD_CONTEXT}}', threadContext);

    // Call Claude CLI (or use mock for testing)
    const output = options?.mockResponse || (await callClaudeCLI(prompt));

    // Parse JSON response
    const parsed = parseClaudeResponse(output);
    if (!parsed) {
      logger.warn({ output }, 'Failed to parse Claude response');
      return {
        success: false,
        requiresReview: true,
        rawOutput: output,
        error: 'Invalid JSON response',
      };
    }

    return {
      success: true,
      draft: parsed.draft,
      tone: parsed.tone,
      confidence: parsed.confidence,
      questions: parsed.questions || [],
      shouldSend: parsed.should_send || false,
    };
  } catch (error) {
    logger.error({ error }, 'Error drafting reply');
    return {
      success: false,
      requiresReview: true,
      rawOutput: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function callClaudeCLI(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('claude', ['-p'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
      }
    });

    proc.stdin.write(prompt);
    proc.stdin.end();
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseClaudeResponse(output: string): any | null {
  try {
    // Try to extract JSON from output (in case there's extra text)
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

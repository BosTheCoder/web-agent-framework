#!/usr/bin/env node

import { Command } from 'commander';
import { authCommand } from './commands/auth.js';
import { runCommand } from './commands/run.js';
import { reviewCommand } from './commands/review.js';
import { sendCommand } from './commands/send.js';

const program = new Command();

program
  .name('web-agent')
  .description('Safe website automation framework')
  .version('0.1.0');

program.addCommand(authCommand);
program.addCommand(runCommand);
program.addCommand(reviewCommand);
program.addCommand(sendCommand);

program.parse();

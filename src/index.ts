#!/usr/bin/env node
import request from 'superagent';
import readline from 'readline';
import { version, name, author } from '../package.json';
import { execSync } from 'child_process';
import { stdin, stdout } from 'process';

const white = '\x1b[37m';
const green = '\x1b[32m';
const grey = '\x1b[90m';
const orange = '\x1b[33m';
const red = '\x1b[31m';
const reset = '\x1b[0m';

const headerMain = `DOTNPM - NPMJS download booster`;
const headerSub = `@${author} | v${version}-remake`;
const boxWidth = Math.max(headerMain.length, headerSub.length) + 6;
const centeredMain = headerMain.padStart((boxWidth + headerMain.length) / 2).padEnd(boxWidth);
const centeredSub = headerSub.padStart((boxWidth + headerSub.length) / 2).padEnd(boxWidth);

const title = `
${green}┌${'─'.repeat(boxWidth)}┐${reset}
${green}│${reset}${grey}${centeredMain}${reset}${green}│${reset}
${green}│${reset}${grey}${centeredSub}${reset}${green}│${reset}
${green}└${'─'.repeat(boxWidth)}┘${reset}
`;

function timestamp(): string {
  return new Date().toLocaleTimeString('tr-TR', { hour12: false });
}

function log(type: 'INFO' | 'ERROR' | 'DOWNLOAD' | 'DONE' | '✔' | '✖', message: string) {
  const color = {
    INFO: white,
    ERROR: red,
    DOWNLOAD: orange,
    DONE: green,
    '✔': green,
    '✖': red
  }[type] || white;

  const label = {
    INFO: '[INFO]   ',
    ERROR: '[ERROR]  ',
    DOWNLOAD: '[DOWN]   ',
    DONE: '[DONE]   ',
    '✔': '[✔]      ',
    '✖': '[✖]      '
  }[type];

  console.log(`${grey}[${timestamp()}]${reset} ${color}${label}${reset}${message}`);
}

function colorizePercentage(percent: number): string {
  const totalBars = 30;
  const filled = Math.floor((percent / 100) * totalBars);
  const empty = totalBars - filled;
  const bar = green + '█'.repeat(filled) + grey + '░'.repeat(empty) + reset;
  return `${white}[${bar}] ${orange}${percent.toFixed(0)}%${reset}`;
}

function getTarballUrl(pkg: string, version: string): string | null {
  try {
    const name = version === 'latest' ? pkg : `${pkg}@${version}`;
    const result = execSync(`npm view ${name} dist.tarball`, { encoding: 'utf-8' });
    return result.trim();
  } catch {
    return null;
  }
}

const rl = readline.createInterface({ input: stdin, output: stdout });

rl.question(`${white}[*]${reset} Package Name: `, (pkgName: string) => {
  rl.question(`${white}[*]${reset} How many times will it be downloaded?: `, (downloadCount: string) => {
    rl.question(`${white}[*]${reset} Package version (or "latest"): `, async (version: string) => {
      const tarball = getTarballUrl(pkgName, version);
      if (!tarball) {
        log('ERROR', `Package or version not found.`);
        process.exit(1);
      }

      console.log(title);
      log('INFO', `Selected package: ${pkgName}`);
      log('INFO', `Resolved version: ${version}`);
      log('DOWNLOAD', `Starting download loop (${downloadCount} times)`);
      log('INFO', `Using tarball: ${tarball}\n`);

      for (let i = 0; i < +downloadCount; i++) {
        try {
          const res = await request.get(tarball).buffer(true);
          const percent = (100 * (i + 1)) / +downloadCount;
          stdout.write(`${colorizePercentage(percent)} `);
          log('✔', `[${i + 1}/${downloadCount}] Success - (Status ${res.status})`);
        } catch (err) {
          log('✖', `[${i + 1}/${downloadCount}] Failed`);
        }
      }

      log('DONE', `${downloadCount} downloads completed.`);
      log('DONE', `Operation finished.`);
      process.exit(0);
    });
  });
});
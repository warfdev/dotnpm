#!/usr/bin/env node
const request = require('superagent');
const readline = require('readline');
const { stdin, stdout } = process;

const white = '\x1b[37m'; // Beyaz
const green = '\x1b[32m'; // Yeşil
const grey = '\x1b[90m';  // Gri
const orange = '\x1b[33m'; // Turuncu
const reset = '\x1b[0m';   // renk silme
const title = green + '[' + grey + 'ZSDOT NPM TOOL' + green + '] ' + orange + 'FAKE DOWNLOADER ' + green + 'v1.0.0' + reset;

function colorizePercentage(percent) {
  const progressBarLength = 20;
  const progress = Math.floor((percent / 100) * progressBarLength);
  const remaining = progressBarLength - progress;

  const progressBar = green + '#'.repeat(progress) + grey + '~'.repeat(remaining);
  const percentage = orange + percent.toFixed(0) + '%';

  return `[${progressBar}${white}] ${white}${percentage}${reset}`;
}

const rl = readline.createInterface({
  input: stdin,
  output: stdout
});

rl.question('[*] Package Name: ', async (packageName) => {
  rl.question('[*] How many times will it be downloaded?: ', async (downloads) => {
    rl.question('[*] Package version: ', async (version) => {
      console.log("\n" + title);
      console.log(`Downloading ${packageName} v${version} ${downloads} times`);

      // Download loop
      for (let i = 0; i < +downloads; i++) {
        await request
          .get(`https://registry.npmjs.org/${packageName}/-/${packageName}-${version}.tgz`)
          .buffer(true)
          .parse(request.parse['application/octet-stream']);

        const percent = (100 * (i + 1) / downloads);
        stdout.write(colorizePercentage(percent) + '\r');
      }

      stdout.write('\n');

      console.log('\nThe download is finished, press any key to exit...');
      rl.close();

      stdin.setRawMode(true);
      stdin.resume();
      stdin.on('data', process.exit.bind(process, 0));
    });
  });
});
const { execSync } = require('child_process');
const fs = require('fs');

const WORK = 'C:\\Users\\leslie\\Documents\\GitHub\\Lorekeeper-Live\\brag-output\\work';
const FRAMES = WORK + '\\frames';
const CHROME = '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"';
const URL = 'file:///' + WORK.replace(/\\/g, '/') + '/video.html?t=';

const FPS = 30;
const DURATION = 20;
const total = FPS * DURATION;

let done = 0;
for (let i = 0; i < total; i++) {
  const t = (i / FPS).toFixed(3);
  const out = FRAMES + '\\' + String(i).padStart(4, '0') + '.png';
  try {
    execSync(`${CHROME} --headless --disable-gpu --disable-software-rasterizer --hide-scrollbars --window-size=1920,1080 --screenshot=${out} "${URL}${t}"`, { stdio: 'ignore' });
  } catch (e) {
    console.error('failed frame', i, t);
  }
  done++;
  if (done % 50 === 0) process.stdout.write(done + '/' + total + ' frames...\n');
}
console.log('done ' + done + ' frames');

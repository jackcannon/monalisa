import { Board } from 'johnny-five';
import { RaspiIO } from 'raspi-io';
import readline from 'readline';

import * as movement from './behaviour/movement';
import * as detection from './detection/detection';
import * as eyes from './eyes/eyes';
import * as behaviour from './behaviour/behaviour';
import * as dashboard from './dashboard/dashboard';
import { formatTime, delay } from './utils/utils';

const start = Date.now();

const board: any = new Board({
  io: new (RaspiIO as any)(),
});

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    shutdown();
  } else {
    dashboard.log.log(`You pressed the "${str}" key`);
    dashboard.log.log();
    dashboard.log.log(key);
    dashboard.log.log();
  }
});

const shutdown = async () => {
  await dashboard.shutdown();
  eyes.reset();
  movement.reset();
  await delay(500);
  console.log("I've been alive for:", formatTime(Date.now() - start));
  process.kill(0);
};

board.on('ready', async () => {
  dashboard.setup(start);
  await eyes.setup(board);
  eyes.start();
  movement.setup();
  const recordSubject = await detection.setup();
  behaviour.setup(recordSubject);

  board.on('exit', function() {
    shutdown();
  });
});

import {Board} from 'johnny-five';
import { RaspiIO } from 'raspi-io';
import * as movement from './movement';
import * as eyes from './eyes';
import { delay } from './utils';

const board:any = new Board({
  io: new (RaspiIO as any)()
});

const start = Date.now();

board.on('ready', () => {
  movement.setup();
  eyes.setup(board);

  Promise.all([
    delay(1000).then(() => eyes.reset()),
    movement.look({x: 90, y: 90}, 20).then(() => delay(1000))
  ])
  .then(() => process.exit(0));


});

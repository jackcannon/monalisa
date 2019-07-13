import {Board} from 'johnny-five';
import { RaspiIO } from 'raspi-io';
import * as movement from './movement';
import * as camera from './camera';
import * as eyes from './eyes';
import { BehaviorSubject } from 'rxjs';
import { IPoint } from './interfaces';

const board:any = new Board({
  io: new (RaspiIO as any)()
});

const start = Date.now();

board.on('ready', async () => {
  movement.setup();
  const faceSubject:BehaviorSubject<IPoint> = await camera.setup();
  eyes.setup(board);
  eyes.start();

  faceSubject
    .subscribe((point:IPoint) => {
      if (point) {
        movement.moveRelativeDegrees(point, 1000);
      }
      // eyes.drawFrame();
    });

  board.on('exit', function() {
    eyes.reset();
    movement.reset();
  });
});

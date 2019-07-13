import {Board} from 'johnny-five';
import { RaspiIO } from 'raspi-io';
import * as movement from './movement';
import * as camera from './camera';
import * as eyes from './eyes';
import { BehaviorSubject } from 'rxjs';
import { IPoint } from './interfaces';
import { formatTime } from './utils';

const start = Date.now();

const board:any = new Board({
  io: new (RaspiIO as any)()
});

board.on('ready', async () => {
  eyes.setup(board);
  eyes.start();
  movement.setup();
  const faceSubject:BehaviorSubject<IPoint[]> = await camera.setup();

  faceSubject
    .subscribe((points:IPoint[]) => {
      if (points && points.length) {
        movement.lookRelativeDegrees(points[0], 30);
      }
      // eyes.drawFrame();
    });

  board.on('exit', function() {
    console.log('I\'ve been alive for:', formatTime(Date.now() - start));
    eyes.reset();
    movement.reset();
  });
});

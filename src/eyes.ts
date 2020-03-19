import * as five from 'johnny-five';
import { IEyeConfig } from './interfaces';
import { Worker } from 'worker_threads';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
const OLED = require('oled-js');

let oled;

let worker:Worker;
let workerMsgs:BehaviorSubject<any> = new BehaviorSubject<any>(null);

const createWorker = ():Promise<any> => {
  return new Promise((resolve) => {
    worker = new Worker('./dist/worker-eyes.js', {});
    worker.on('message', (data) => {
      workerMsgs.next(data);
      if (data && data.type && data.type === 'init') {
        resolve();
      }
    })
  });
};

const waitForMessage = (msgType) =>
  workerMsgs
    .pipe(first((msg) => msg.type === msgType))
    .toPromise();

const onMsg = (data) => {
  switch (data.type) {
    case 'changedPixels':
      drawChangedPixels(data.changed);
  }
}

export const setup = async (board) => {

  const opts = {
    width: 128,
    height: 64,
    // address: 0x3D
    address: 0x3C
  };

  oled = new OLED(board, five, opts);
  oled.turnOnDisplay();

  await createWorker();
  worker.on('message', onMsg);
  worker.postMessage({ type: 'setup' });
  await waitForMessage('setup-complete');
}

export const reset = () => {
  // worker.postMessage({type: 'reset'});
  oled.fillRect(0, 0, 128, 64, 0);
  oled.turnOffDisplay();
};

const drawChangedPixels = (changed) => {
  const start = Date.now();
  oled.drawPixel(changed, false);
  oled.update();
}



export const start = () => {
  worker.postMessage({type: 'start'});
};

export const drawFrame = (eyes?:IEyeConfig[], waiting:boolean = false) => {
  worker.postMessage({
    type: 'drawFrame',
    eyes,
    waiting
  });
};

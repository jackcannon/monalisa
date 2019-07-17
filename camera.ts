import * as raspberryPiCamera from 'raspberry-pi-camera-native';
import { createTimer, toFixed } from './utils';
import { BehaviorSubject } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { IFacePoint } from './interfaces';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { cameraOptions } from './config';

let pointsSubject:BehaviorSubject<IFacePoint[]> = new BehaviorSubject<IFacePoint[]>(null);
let framesSubject:BehaviorSubject<Buffer> = new BehaviorSubject<Buffer>(null);

let worker:Worker;
let workerMsgs:BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const setup = async ():Promise<BehaviorSubject<IFacePoint[]>> => {
  await createWorker();
  await startCamera();
  await runCamera();
  startProcessing();

  return pointsSubject;
}

const createWorker = ():Promise<any> => {
  return new Promise((resolve) => {
    worker = new Worker('./worker-faceapi.js', {});
    worker.on('message', (data) => {
      workerMsgs.next(data);
      if (data && data.type && data.type === 'init') {
        resolve();
      }
    })
  });
};

const startCamera = ():Promise<any> => {
  return new Promise((resolve) => {
    raspberryPiCamera.start(cameraOptions, resolve);
  });
};

const runCamera = ():Promise<any> => {
  const timer = createTimer('frame');
  raspberryPiCamera.on('frame', (buffer:Buffer) => {
    // timer();
    framesSubject.next(buffer);
  });
  return framesSubject.pipe(first((frame) => !!frame)).toPromise();
};

const runProcess = () => {
  const msg = {
    type: 'detect',
    buffer: framesSubject.value
  };
  worker.postMessage(msg);
};
const startProcessing = () => {
  const timer = createTimer('points');
  workerMsgs
    .pipe(filter(({type}) => type === 'points'))
    .subscribe(({points}) => {
      pointsSubject.next(points);
      timer(points.map((point) => ({
        x: toFixed(point.x, 2),
        y: toFixed(point.y, 2),
        score: point.score
      })));
      runProcess();
    });

  runProcess();
}

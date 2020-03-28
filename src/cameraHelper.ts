import raspberryPiCamera from 'raspberry-pi-camera-native';
import { BehaviorSubject } from 'rxjs';
import { cameraOptions } from './config';
import { getPromise } from './utils';

let framesSubject: BehaviorSubject<Buffer> = new BehaviorSubject<Buffer>(null);

export const getFrames = async (): Promise<BehaviorSubject<Buffer>> => {
  await startCamera();
  await runCamera();
  return framesSubject;
};

const startCamera = (): Promise<any> => {
  return new Promise(resolve => {
    raspberryPiCamera.start(cameraOptions, resolve);
  });
};

const runCamera = (): Promise<any> => {
  raspberryPiCamera.on('frame', (buffer: Buffer) => {
    framesSubject.next(buffer);
  });
  return getPromise(framesSubject);
};

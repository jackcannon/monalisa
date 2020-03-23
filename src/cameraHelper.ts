import raspberryPiCamera from "raspberry-pi-camera-native";
import { BehaviorSubject } from "rxjs";
import { first } from "rxjs/operators";
import { IFacePoint } from "./interfaces";
import { cameraOptions } from "./config";
import { log } from "./dashboard";

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
  raspberryPiCamera.on("frame", (buffer: Buffer) => {
    framesSubject.next(buffer);
  });
  return framesSubject.pipe(first(frame => !!frame)).toPromise();
};

import raspberryPiCamera from "raspberry-pi-camera-native";
import { BehaviorSubject } from "rxjs";
import { first } from "rxjs/operators";
import { IFacePoint } from "./interfaces";
import { cameraOptions } from "./config";

let framesSubject: BehaviorSubject<Buffer> = new BehaviorSubject<Buffer>(null);

export const getFrames = async (): Promise<BehaviorSubject<Buffer>> => {
  await startCamera();
  await runCamera();
  return framesSubject;
};

const startCamera = (): Promise<any> => {
  console.log("cameraHelper - startCamera - A");
  return new Promise(resolve => {
    console.log("cameraHelper - startCamera - B");
    raspberryPiCamera.start(cameraOptions, resolve);
  });
};

const runCamera = (): Promise<any> => {
  console.log("cameraHelper - runCamera - A");
  raspberryPiCamera.on("frame", (buffer: Buffer) => {
    console.log("cameraHelper - runCamera - B");
    framesSubject.next(buffer);
  });
  console.log("cameraHelper - runCamera - C");
  return framesSubject.pipe(first(frame => !!frame)).toPromise();
};

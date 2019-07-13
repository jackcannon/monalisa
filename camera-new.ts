import * as raspberryPiCamera from 'raspberry-pi-camera-native';
import { createTimer, toFixed } from './utils';
import { BehaviorSubject } from 'rxjs';
import { IPoint } from './interfaces';
import * as Canvas from 'canvas';
const Image = Canvas.Image;
import * as fr from 'face-recognition'


const cameraOptions = {
  // width: 1280,
  // height: 720,
  width: 640,
  height: 480,
  fps: 2,
  encoding: 'JPEG',
  quality: 90
};

let subject:BehaviorSubject<IPoint> = new BehaviorSubject<IPoint>(null);

export const setup = async ():Promise<BehaviorSubject<IPoint>> => {
  await startCamera();
  return await runLoop();
}

const startCamera = () => {
  return new Promise((resolve) => {
    raspberryPiCamera.start(cameraOptions, resolve);
  });
}

const detect = async (imgBuffer):Promise<IPoint> => {

}

const detectionToPoint = (detection:faceapi.FaceDetection):IPoint => ({
  x: toFixed((detection.box.x + (detection.box.width / 2)) / cameraOptions.width, 6),
  y: toFixed((detection.box.y + (detection.box.height / 2)) / cameraOptions.height, 6)
})

const saveOutput = async (img, detections) => {
  // const out = faceapi.createCanvasFromMedia(img) as any;
  // faceapi.draw.drawDetections(out, detections);
  const now = (new Date()).toISOString().replace(/T|:|\./g, '-').substring(0, 19);
  const outputName = `photos/${now}.jpg`;
  // saveFile(outputName, out.toBuffer('image/jpeg'));
  console.log('done, saved results to', outputName);
}

const runLoop = async ():Promise<BehaviorSubject<IPoint>> => {
  const timer = createTimer('camera-loop');
  subject = new BehaviorSubject<IPoint>(null);

  raspberryPiCamera.on('frame', async (buffer) => {
    const point:IPoint = await detect(buffer);
    timer(point);
    subject.next(point);
  });

  return subject;
}

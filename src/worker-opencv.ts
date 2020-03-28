import cv from 'opencv';
import { parentPort, isMainThread, threadId } from 'worker_threads';
import { BehaviorSubject } from 'rxjs';

import { IFaceRecord } from './interfaces';
import { toFixed } from './utils';
import { cameraOptions, savePhotoOnDetection, opencvConfig } from './config';
import { getFrames } from './cameraHelper';
import { log } from './dashboard';

const dataPath = `./src/opencv/${opencvConfig.dataName}.xml`;

let framesSubject: BehaviorSubject<Buffer> = null;
let detectCount: number = 0;

interface ICVBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// parentPort.on("message", msg => {
//   switch (msg.type) {
//     case "detect":
//       handleDetectMsg(msg);
//       break;
//   }
// });

const setup = async () => {
  framesSubject = await getFrames();
  await framesSubject.toPromise();
  parentPort.postMessage({ type: 'init' });
};

const startProcessing = async () => {
  const points = await detect(framesSubject.value);
  detectCount++;
  parentPort.postMessage({
    type: 'points',
    points,
    count: detectCount,
  });
  startProcessing();
};

// const handleDetectMsg = async (msg: {
//   type: string;
//   buffer: Uint8Array;
//   count: number;
// }) => {
//   const { count } = msg;
//   parentPort.postMessage({
//     type: "receipt",
//     count: msg.count
//   });
//   const buffer = Buffer.from(msg.buffer);
//   const points = await detect(buffer, msg.count);
//   parentPort.postMessage({
//     type: "points",
//     points,
//     count
//   });
// };

const cvReadImage = imgBuffer =>
  new Promise((resolve, reject) => {
    cv.readImage(imgBuffer, (err, im) => (err ? reject(err) : resolve(im)));
  });

const cvDetectFaces = (im): Promise<ICVBox[]> =>
  new Promise((resolve, reject) => {
    im.detectObject(dataPath, {}, (err, faces) => (err ? reject(err) : resolve(faces)));
  });

const detect = async (imgBuffer): Promise<IFaceRecord[]> => {
  const im = await cvReadImage(imgBuffer);
  const boxes = await cvDetectFaces(im);
  const faces = boxes.map(boxToPoint(Date.now()));
  if (faces.length && savePhotoOnDetection) {
    saveOutput(im, faces);
  }
  return faces;
};

const boxToPoint = (time: number) => (box: ICVBox): IFaceRecord => ({
  x: toFixed((box.x + box.width * 0.5) / cameraOptions.width, 6),
  y: toFixed((box.y + box.height * 0.5) / cameraOptions.height, 6),
  score: 1,
  time,
});

const saveOutput = async (im, faces) => {
  for (var i = 0; i < faces.length; i++) {
    var face = faces[i];
    im.ellipse(face.x + face.width / 2, face.y + face.height / 2, face.width / 2, face.height / 2);
  }
  const now = new Date()
    .toISOString()
    .replace(/T|:|\./g, '-')
    .substring(0, 19);
  const outputName = `photos/${now}.png`;

  im.save(outputName);
  log.log('Image saved to ' + outputName);
};

setup();

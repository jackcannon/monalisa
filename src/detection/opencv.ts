import cv from 'opencv';
import { BehaviorSubject } from 'rxjs';

import { IFaceRecord } from '../interfaces';
import { toFixed, getPromise } from '../utils/utils';
import { cameraOptions, savePhotoOnDetection, opencvConfig } from '../config';
import { log } from '../dashboard/dashboard';

import { getFrames } from './cameraHelper';

const dataPath = `./src/lib/opencv/${opencvConfig.dataName}.xml`;

let recordsSubject: BehaviorSubject<IFaceRecord[]> = new BehaviorSubject<IFaceRecord[]>(null);
let framesSubject: BehaviorSubject<Buffer> = null;
let detectCount: number = 0;

interface ICVBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const startDetection = async (): Promise<BehaviorSubject<IFaceRecord[]>> => {
  framesSubject = await getFrames();
  startProcessing();
  await getPromise(recordsSubject);
  return recordsSubject;
};

export const startProcessing = async () => {
  const points = await detect(framesSubject.value);
  detectCount++;
  recordsSubject.next(points);
  startProcessing();
};

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

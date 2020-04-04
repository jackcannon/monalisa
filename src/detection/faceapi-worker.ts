import * as faceapi from 'face-api.js';
import { parentPort, isMainThread, threadId } from 'worker_threads';
import {
  canvas,
  faceDetectionNet,
  getFaceDetectorOptions,
  saveFile,
} from '../lib/face-api/examples-nodejs/commons';
import { IFaceRecord, IWorkerInit, IWorkerDetect, IWorkerPoints } from '../interfaces';
import { toFixed } from '../utils/utils';
import { cameraOptions, savePhotoOnDetection, faceApiConfig } from '../config';

let faceDetectionOptions;

parentPort.on('message', msg => {
  switch (msg.type) {
    case 'detect':
      handleDetectMsg(msg);
      break;
  }
});

const setup = async () => {
  await faceDetectionNet.loadFromDisk('./src/lib/face-api/weights');
  // @ts-ignore
  faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet, {
    minFaceSize: faceApiConfig.minFaceSize,
    scaleFactor: 0.8,
  });
  parentPort.postMessage({ type: 'init' } as IWorkerInit);
};

const handleDetectMsg = async (msg: IWorkerDetect) => {
  const buffer = Buffer.from(msg.buffer);
  const points = await detect(buffer);
  parentPort.postMessage({
    type: 'points',
    points,
  } as IWorkerPoints);
};

const detect = async (imgBuffer): Promise<IFaceRecord[]> => {
  if (faceApiConfig.singleFace) {
    return await detectSingle(imgBuffer);
  } else {
    return await detectMulti(imgBuffer);
  }
};

const detectSingle = async (imgBuffer): Promise<IFaceRecord[]> => {
  const img = await canvas.loadImage(imgBuffer as any);
  const detection = await faceapi.detectSingleFace(img, faceDetectionOptions);
  if (detection && savePhotoOnDetection) {
    saveOutput(img, [detection]);
  }
  return [detection].filter(detection => detection).map(detectionToPoint(Date.now()));
};

const detectMulti = async (imgBuffer): Promise<IFaceRecord[]> => {
  const img = await canvas.loadImage(imgBuffer as any);
  const detections = await faceapi.detectAllFaces(img, faceDetectionOptions);
  if (detections.length && savePhotoOnDetection) {
    saveOutput(img, detections);
  }
  return detections.map(detectionToPoint(Date.now()));
};

const detectionToPoint = (time: number) => (d: faceapi.FaceDetection): IFaceRecord => ({
  x: toFixed((d.box.x + d.box.width * 0.5) / cameraOptions.width, 6),
  y: toFixed((d.box.y + d.box.height * 0.5) / cameraOptions.height, 6),
  score: toFixed(d.score, 6),
  time,
});

const saveOutput = async (img, detections) => {
  const out = faceapi.createCanvasFromMedia(img) as any;
  faceapi.draw.drawDetections(out, detections);
  const now = new Date()
    .toISOString()
    .replace(/T|:|\./g, '-')
    .substring(0, 19);
  const outputName = `photos/${now}.jpg`;
  saveFile(outputName, out.toBuffer('image/jpeg'));
  // console.log("done, saved results to", outputName);
};

setup();

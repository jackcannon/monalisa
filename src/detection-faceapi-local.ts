/**
 * NOTE: This is available as an option as I managed to get it working,
 * however the faceapi blocks the camera, so one has to wait for the other.
 * In order to use faceapi, I will need to re-utilise the worker-faceapi,
 * but using the same interface as detection-opencv
 */

import * as faceapi from "face-api.js";
import {
  canvas,
  faceDetectionNet,
  getFaceDetectorOptions,
  saveFile
} from "./face-api/examples-nodejs/commons";

import { BehaviorSubject } from "rxjs";
import { first } from "rxjs/operators";

import { IFacePoint } from "./interfaces";
import { toFixed, getPromise } from "./utils";
import {
  cameraOptions,
  savePhotoOnDetection,
  detectSingleFace,
  faceDetectMinFaceSize as minFaceSize
} from "./config";
import { getFrames } from "./cameraHelper";

let pointsSubject: BehaviorSubject<IFacePoint[]> = new BehaviorSubject<
  IFacePoint[]
>(null);
let framesSubject: BehaviorSubject<Buffer> = null;
let detectCount: number = 0;
let faceDetectionOptions;

let queue;

const setup = async () => {
  await faceDetectionNet.loadFromDisk("./src/face-api/weights");
  faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet, {
    minFaceSize,
    scaleFactor: 0.8
  });
};

export const startDetection = async (): Promise<BehaviorSubject<
  IFacePoint[]
>> => {
  await setup();
  framesSubject = await getFrames();

  await getPromise(framesSubject);
  framesSubject.subscribe(frame => {
    queue = frame;
  });
  startProcessing();
  await getPromise(pointsSubject);
  return pointsSubject;
};

export const startProcessing = async () => {
  const frame = queue;
  queue = null;
  const points = await detect(frame);
  detectCount++;
  pointsSubject.next(points);
  if (!queue) {
    await framesSubject
      .pipe(first(latestFrame => latestFrame && latestFrame !== frame))
      .toPromise();
  }
  startProcessing();
};

const detect = async (imgBuffer): Promise<IFacePoint[]> => {
  if (detectSingleFace) {
    return await detectSingle(imgBuffer);
  } else {
    return await detectMulti(imgBuffer);
  }
};

const detectSingle = async (imgBuffer): Promise<IFacePoint[]> => {
  const img = await canvas.loadImage(imgBuffer as any);
  const detection = await faceapi.detectSingleFace(img, faceDetectionOptions);
  if (detection && savePhotoOnDetection) {
    saveOutput(img, [detection]);
  }
  return (
    [detection]
      .filter(detection => detection)
      // .filter((detection) => detection.score > 0.9)
      .map(detectionToPoint)
  );
};

const detectMulti = async (imgBuffer): Promise<IFacePoint[]> => {
  const img = await canvas.loadImage(imgBuffer as any);
  const detections = await faceapi.detectAllFaces(img, faceDetectionOptions);
  if (detections.length && savePhotoOnDetection) {
    saveOutput(img, detections);
  }
  return (
    detections
      // .filter((detection) => detection.score > 0.9)
      .map(detectionToPoint)
  );
};

const detectionToPoint = (detection: faceapi.FaceDetection): IFacePoint => ({
  x: toFixed(
    (detection.box.x + detection.box.width * 0.5) / cameraOptions.width,
    6
  ),
  y: toFixed(
    (detection.box.y + detection.box.height * 0.5) / cameraOptions.height,
    6
  ),
  score: toFixed(detection.score, 6)
});

const saveOutput = async (img, detections) => {
  const out = faceapi.createCanvasFromMedia(img) as any;
  faceapi.draw.drawDetections(out, detections);
  const now = new Date()
    .toISOString()
    .replace(/T|:|\./g, "-")
    .substring(0, 19);
  const outputName = `photos/${now}.jpg`;
  saveFile(outputName, out.toBuffer("image/jpeg"));
};

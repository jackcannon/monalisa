import cv from "opencv";
import { BehaviorSubject } from "rxjs";

import { IFacePoint } from "./interfaces";
import { toFixed, getPromise } from "./utils";
import { cameraOptions, savePhotoOnDetection, opencvConfig } from "./config";
import { getFrames } from "./cameraHelper";
import { log } from "./dashboard";

const dataPath = `./src/opencv/${opencvConfig.dataName}.xml`;

let pointsSubject: BehaviorSubject<IFacePoint[]> = new BehaviorSubject<
  IFacePoint[]
>(null);
let framesSubject: BehaviorSubject<Buffer> = null;
let detectCount: number = 0;

interface ICVBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const startDetection = async (): Promise<BehaviorSubject<
  IFacePoint[]
>> => {
  framesSubject = await getFrames();
  startProcessing();
  await getPromise(pointsSubject);
  return pointsSubject;
};

export const startProcessing = async () => {
  const points = await detect(framesSubject.value);
  detectCount++;
  pointsSubject.next(points);
  startProcessing();
};

const cvReadImage = imgBuffer =>
  new Promise((resolve, reject) => {
    cv.readImage(imgBuffer, (err, im) => (err ? reject(err) : resolve(im)));
  });

const cvDetectFaces = (im): Promise<ICVBox[]> =>
  new Promise((resolve, reject) => {
    im.detectObject(dataPath, {}, (err, faces) =>
      err ? reject(err) : resolve(faces)
    );
  });

const detect = async (imgBuffer): Promise<IFacePoint[]> => {
  const im = await cvReadImage(imgBuffer);
  const boxes = await cvDetectFaces(im);
  const faces = boxes.map(boxToPoint);
  if (faces.length && savePhotoOnDetection) {
    saveOutput(im, faces);
  }
  return faces;
};

const boxToPoint = (box: ICVBox): IFacePoint => ({
  x: toFixed((box.x + box.width * 0.5) / cameraOptions.width, 6),
  y: toFixed((box.y + box.height * 0.5) / cameraOptions.height, 6),
  score: 1
});

const saveOutput = async (im, faces) => {
  for (var i = 0; i < faces.length; i++) {
    var face = faces[i];
    im.ellipse(
      face.x + face.width / 2,
      face.y + face.height / 2,
      face.width / 2,
      face.height / 2
    );
  }
  const now = new Date()
    .toISOString()
    .replace(/T|:|\./g, "-")
    .substring(0, 19);
  const outputName = `photos/${now}.png`;

  im.save(outputName);
  log.log("Image saved to " + outputName);
};

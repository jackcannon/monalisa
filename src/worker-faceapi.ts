import * as faceapi from "face-api.js";
import {
  canvas,
  faceDetectionNet,
  getFaceDetectorOptions,
  saveFile
} from "./face-api/examples-nodejs/commons";
import { IFacePoint } from "./interfaces";
import { toFixed } from "./utils";
import { parentPort, isMainThread } from "worker_threads";
import {
  cameraOptions,
  savePhotoOnDetection,
  detectSingleFace,
  faceDetectMinFaceSize as minFaceSize
} from "./config";

let faceDetectionOptions;

console.log("worker started");

parentPort.on("message", msg => {
  switch (msg.type) {
    case "detect":
      handleDetectMsg(msg);
      break;
  }
});

const setup = async () => {
  await faceDetectionNet.loadFromDisk("./src/face-api/weights");
  faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet, {
    minFaceSize,
    scaleFactor: 0.8
  });
  parentPort.postMessage({ type: "init" });
};

const handleDetectMsg = async (msg: { type: string; buffer: Uint8Array }) => {
  const buffer = Buffer.from(msg.buffer);
  const points = await detect(buffer);
  parentPort.postMessage({
    type: "points",
    points
  });
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
  console.log("done, saved results to", outputName);
};

setup();

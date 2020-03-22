import * as faceapi from "face-api.js";

import {
  canvas,
  faceDetectionNet,
  faceDetectionOptions,
  saveFile
} from "./commons";

const start = Date.now();
const getTime = () => Date.now() - start;

async function run() {
  await faceDetectionNet.loadFromDisk("../weights");

  const img = await canvas.loadImage("../../test-image-2.jpg");
  const detections = await faceapi.detectAllFaces(img, faceDetectionOptions);

  const out = faceapi.createCanvasFromMedia(img) as any;
  faceapi.draw.drawDetections(out, detections);

  saveFile("faceDetection.jpg", out.toBuffer("image/jpeg"));
}

run();

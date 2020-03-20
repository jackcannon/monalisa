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
  console.log(getTime(), "A");
  await faceDetectionNet.loadFromDisk("../weights");

  console.log(getTime(), "B");
  const img = await canvas.loadImage("../../test-image-2.jpg");
  console.log(getTime(), "C");
  const detections = await faceapi.detectAllFaces(img, faceDetectionOptions);
  console.log(getTime(), "D");

  console.log(detections.length);
  detections.forEach(detection => console.log(detection.score, detection.box));
  console.log(img);

  console.log(getTime(), "E");
  const out = faceapi.createCanvasFromMedia(img) as any;
  console.log(getTime(), "F");
  faceapi.draw.drawDetections(out, detections);
  console.log(getTime(), "G");

  saveFile("faceDetection.jpg", out.toBuffer("image/jpeg"));
  console.log(getTime(), "H");
  console.log("done, saved results to out/faceDetection.jpg");
}

run();

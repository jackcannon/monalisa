import * as faceapi from 'face-api.js';
import { canvas, faceDetectionNet, faceDetectionOptions, saveFile } from './face-api/examples-nodejs/commons';
import { IPoint } from './interfaces';
import { toFixed } from './utils';
import { workerData, parentPort, isMainThread } from 'worker_threads';

const { cameraOptions } = workerData;

console.log('worker started');

parentPort.on('message', (msg) => {
  switch(msg.type) {
    case 'detect':
      handleDetectMsg(msg);
      break;
  }
});


const setup = async () => {
  await faceDetectionNet.loadFromDisk('./face-api/weights');
  parentPort.postMessage({type: 'init'});
};

const handleDetectMsg = async (msg:{type:string, buffer:Uint8Array}) => {
  const buffer = Buffer.from(msg.buffer);
  const points = await detect(buffer);
  parentPort.postMessage({
    type: 'points',
    points
  });
};


const detect = async (imgBuffer):Promise<IPoint[]> => {
  const img = await canvas.loadImage(imgBuffer as any);
  const detections = await faceapi.detectAllFaces(img, faceDetectionOptions);
  // if (detections.length) {
  //   saveOutput(img, detections);
  // }
  return detections.map(detectionToPoint);
};

const detectionToPoint = (detection:faceapi.FaceDetection):IPoint => ({
  x: toFixed((detection.box.x + (detection.box.width / 2)) / cameraOptions.width, 6),
  y: toFixed((detection.box.y + (detection.box.height / 2)) / cameraOptions.height, 6)
});

const saveOutput = async (img, detections) => {
  const out = faceapi.createCanvasFromMedia(img) as any;
  faceapi.draw.drawDetections(out, detections);
  const now = (new Date()).toISOString().replace(/T|:|\./g, '-').substring(0, 19);
  const outputName = `photos/${now}.jpg`;
  saveFile(outputName, out.toBuffer('image/jpeg'));
  console.log('done, saved results to', outputName);
};


setup();

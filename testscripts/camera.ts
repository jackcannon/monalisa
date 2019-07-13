import * as faceapi from 'face-api.js';
import { canvas, faceDetectionNet, faceDetectionOptions, saveFile } from './face-api/examples-nodejs/commons';
import { StillCamera, StreamCamera, Rotation, Codec } from "pi-camera-connect";
import * as fs from 'fs';

console.log('starting');


function timer(name) {
  const start = Date.now();
  let last = Date.now();

  return function log(...args) {
    const now = Date.now();
    const diff = now - last;
    last = now;
    console.log(`[${name}]`, diff, ...args);
  }
}




const camera = new StillCamera({
  // codec: Codec.MJPEG,
  rotation: Rotation.Rotate180,
  width: 640,
  height: 480
});

export async function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function setup() {
  console.log('setting up');
  await faceDetectionNet.loadFromDisk('./face-api/weights');
  console.log('setup complete');
}

export async function takePhoto() {
  const log = timer('takePhoto');

  log('starting takePhoto');
  const imgBuffer = await camera.takeImage();
  log('photo taken');
  const img = await canvas.loadImage(imgBuffer as any);
  log('photo loaded');

  const detections = await faceapi.detectAllFaces(img, faceDetectionOptions);
  log('faces detected');

  // console.log(detections.length);
  // detections.forEach(detection => console.log(detection.score, detection.box));

  log('done');
  // const out = faceapi.createCanvasFromMedia(img) as any
  // faceapi.draw.drawDetections(out, detections)

  // const now = (new Date()).toISOString().replace(/T|:|\./g, '-').substring(0, 19);
  // const outputName = `photos/${now}.jpg`;
  // saveFile(outputName, out.toBuffer('image/jpeg'));
  // console.log('done, saved results to', outputName);

}

export async function run() {
  const log = timer('main')
  log('a');
  await setup();
  log('b');
  await takePhoto();
  log('c');
  await takePhoto();
  log('d');
  await takePhoto();
  log('e');
  await takePhoto();
  log('f');
  await takePhoto();
  log('g');
}

try {
  run()
} catch(err) {
  console.log('error', err);
}

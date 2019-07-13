import * as faceapi from 'face-api.js';
import { canvas, faceDetectionNet, faceDetectionOptions, saveFile } from '../face-api/examples-nodejs/commons';
import { Image } from 'canvas';
import { StillCamera, Rotation, Codec } from "pi-camera-connect";

console.log('starting');

// const camera = new StillCamera({
//   rotation: Rotation.Rotate180
// });

const camera = new StillCamera({
  // codec: Codec.MJPEG,
  rotation: Rotation.Rotate180,
  width: 640,
  height: 480
});

// stillCamera.takeImage().then(image => {
//   const now = (new Date()).toISOString().replace(/T|:|\./g, '-').substring(0, 19);
//   const outputName = `${ __dirname }/photos/${now}.jpg`;
//   console.log(image);
//   fs.writeFileSync(outputName, image);
// });


const start = Date.now();
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let count = 0;
const PARTITION = () => {
  console.log(alphabet[count], Date.now() - start);
  count++;
}

const setupImage = (src:any):Promise<Image> => {
  const img = new Image();
  const promise = new Promise<Image>((resolve, reject) => {
    img.onload = () => resolve(img)
    img.onerror = err => reject(err)
  });
  img.src = src;
  return promise;
};


async function run() {

  PARTITION();

  // await camera.startCapture();

  PARTITION();

  await faceDetectionNet.loadFromDisk('./face-api/weights');

  PARTITION();

  const imgBuffer = await camera.takeImage();

  PARTITION();

  const img = await canvas.loadImage(imgBuffer as any);

  PARTITION();

  const detections = await faceapi.detectAllFaces(img, faceDetectionOptions);

  PARTITION();

  console.log(detections.length);
  detections.forEach(detection => console.log(detection.score, detection.box));
  console.log(img);

  PARTITION();

  const out = faceapi.createCanvasFromMedia(img) as any
  faceapi.draw.drawDetections(out, detections)

  PARTITION();

  const now = (new Date()).toISOString().replace(/T|:|\./g, '-').substring(0, 19);
  const outputName = `./photos/${now}.jpg`;
  saveFile(outputName, out.toBuffer('image/jpeg'));
  console.log('done, saved results to', outputName);

  PARTITION();

  // await camera.stopCapture();

  PARTITION();

}

try {
  run()
} catch(err) {
  console.log('error', err);
}

import { workerData, parentPort, isMainThread } from "worker_threads";
import { IFaceRecord } from "./interfaces";
import * as pico from "./lib/pico";
import * as canvas from "canvas";
import fetch from "node-fetch";
import { Canvas } from "canvas";
import { delay } from "rxjs/operators";
import { toFixed, createTimer } from "./utils";

const { cameraOptions } = workerData;
const cascadefile =
  "https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder";
let facefinder_classify_region = function(r, c, s, pixels, ldim) {
  return -1.0;
};

interface IPicoDetection {
  x: number;
  y: number;
  r: number;
}

parentPort.on("message", msg => {
  switch (msg.type) {
    case "detect":
      handleDetectMsg(msg);
      break;
  }
});

const setup = async () => {
  parentPort.postMessage({ type: "init" });

  await fetch(cascadefile).then(response => {
    return response.arrayBuffer().then(async buffer => {
      var bytes = new Int8Array(buffer);
      facefinder_classify_region = pico.unpack_cascade(bytes);
    });
  });
};

const handleDetectMsg = async (msg: { type: string; buffer: Uint8Array }) => {
  const buffer = Buffer.from(msg.buffer);
  const points = await detect(buffer);
  parentPort.postMessage({
    type: "points",
    points
  });
};

const detect = async (imgBuffer): Promise<IFaceRecord[]> => {
  const timer = createTimer("detect");

  const img = await canvas.loadImage(imgBuffer as any);
  timer("img");
  const canv = new canvas.Canvas(img.width, img.height);
  timer("canv");
  const ctx = canv.getContext("2d");
  timer("ctx");
  ctx.drawImage(img, 0, 0, img.width, img.height);
  timer("drawn");

  const dets = findFace(ctx);
  timer("findFaces");
  // console.log("dets", dets);
  return dets.map(convertToFacePoint(Date.now()));
};

const convertToFacePoint = (time: number) => (
  detection: IPicoDetection
): IFaceRecord => ({
  x: toFixed(detection.x, 6),
  y: toFixed(detection.y, 6),
  score: 1,
  time
});

/*
  a function to transform an RGBA image to grayscale
*/
const rgba_to_grayscale = (rgba, nrows, ncols) => {
  var gray = new Uint8Array(nrows * ncols);
  for (var r = 0; r < nrows; ++r)
    for (var c = 0; c < ncols; ++c)
      // gray = 0.2*red + 0.7*green + 0.1*blue
      gray[r * ncols + c] =
        (2 * rgba[r * 4 * ncols + 4 * c + 0] +
          7 * rgba[r * 4 * ncols + 4 * c + 1] +
          1 * rgba[r * 4 * ncols + 4 * c + 2]) /
        10;
  return gray;
};

/*
  this function is called each time you press the button to detect the faces
*/
const findFace = ctx => {
  var rgba = ctx.getImageData(0, 0, 1280, 720).data;

  // prepare input to `run_cascade`
  var image = {
    pixels: rgba_to_grayscale(rgba, 720, 1280),
    nrows: 720,
    ncols: 1280,
    ldim: 1280
  };
  var params = {
    shiftfactor: 0.1, // move the detection window by 10% of its size
    minsize: 20, // minimum size of a face (not suitable for real-time detection, set it to 100 in that case)
    maxsize: 1000, // maximum size of a face
    scalefactor: 1.1 // for multiscale processing: resize the detection window by 10% when moving to the higher scale
  };
  // run the cascade over the image
  // dets is an array that contains (r, c, s, q) quadruplets
  // (representing row, column, scale and detection score)
  var dets = pico.run_cascade(image, facefinder_classify_region, params);
  // cluster the obtained detections
  dets = pico.cluster_detections(dets, 0.2); // set IoU threshold to 0.2
  // draw results
  var qthresh = 5.0; // this constant is empirical: other cascades might require a different one
  var result = [];

  for (var i = 0; i < dets.length; ++i) {
    // check the detection score
    // if it's above the threshold, draw it
    if (dets[i][3] > qthresh)
      result.push({ x: dets[i][1], y: dets[i][0], r: dets[i][2] / 2 });
  }

  return result;
};

setup();

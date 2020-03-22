import raspberryPiCamera from "raspberry-pi-camera-native";
import { createTimer, toFixed } from "./utils";
import { BehaviorSubject } from "rxjs";
import { filter, first, delay } from "rxjs/operators";
import { IFacePoint } from "./interfaces";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { cameraOptions } from "./config";
import { log, addFaceDetectionTime, updateFaces } from "./dashboard";

let pointsSubject: BehaviorSubject<IFacePoint[]> = new BehaviorSubject<
  IFacePoint[]
>(null);
let framesSubject: BehaviorSubject<Buffer> = new BehaviorSubject<Buffer>(null);

let worker: Worker;
let workerMsgs: BehaviorSubject<any> = new BehaviorSubject<any>(null);

// const workerPath = "./dist/worker-faceapi.js";
const workerPath = "./dist/worker-opencv.js";

const sentTimes = [];

export const setup = async (): Promise<BehaviorSubject<IFacePoint[]>> => {
  await createWorker();
  await startCamera();
  await runCamera();
  startListening();
  runProcess();

  return pointsSubject;
};

const createWorker = (): Promise<any> => {
  return new Promise(resolve => {
    worker = new Worker(workerPath, {});
    worker.on("message", data => {
      workerMsgs.next(data);
      if (data && data.type && data.type === "init") {
        // log.log(worker);
        resolve();
      }
    });
  });
};

const startCamera = (): Promise<any> => {
  return new Promise(resolve => {
    raspberryPiCamera.start(cameraOptions, resolve);
  });
};

const runCamera = (): Promise<any> => {
  // const timer = createTimer("frame");
  raspberryPiCamera.on("frame", (buffer: Buffer) => {
    // const timeTaken = timer();
    // log.log("frame " + timeTaken);

    framesSubject.next(buffer);
    // runProcess();
  });
  return framesSubject.pipe(first(frame => !!frame)).toPromise();
};

let sendCount = 0;

const runProcess = () => {
  const msg = {
    type: "detect",
    buffer: framesSubject.value,
    count: sendCount++
  };
  // log.log("sending " + sendCount);
  sentTimes[sendCount] = Date.now();
  worker.postMessage(msg);
};
const startListening = () => {
  const timer = createTimer("points");
  workerMsgs
    .pipe(filter(({ type }) => type === "points"))
    .subscribe(({ points, count }) => {
      log.log("receiving " + count);
      pointsSubject.next(points);

      const delta = timer();
      addFaceDetectionTime(delta);

      const displayPoints = points.map(point => ({
        x: toFixed(point.x, 2),
        y: toFixed(point.y, 2),
        score: point.score
      }));
      updateFaces(displayPoints, delta);

      runProcess();
    });

  workerMsgs
    .pipe(filter(({ type }) => type === "receipt"))
    .subscribe(({ count }) => {
      if (sentTimes[count]) {
        log.log("receipt", count, Date.now() - sentTimes[count]);
      }
    });
};

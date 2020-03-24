import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";

import { IFacePoint } from "./interfaces";
import { getFrames } from "./cameraHelper";
import { getPromise } from "./utils";
import { DETECTION_TYPE, IWorkerDetect } from "./type";

const workerPaths = {
  [DETECTION_TYPE.OPENCV]: "./dist/worker-opencv.js",
  [DETECTION_TYPE.FACEAPI]: "./dist/worker-faceapi.js"
};

let worker;
let workerMsgs: BehaviorSubject<any> = new BehaviorSubject<any>(null);

let pointsSubject: BehaviorSubject<IFacePoint[]> = new BehaviorSubject<
  IFacePoint[]
>(null);
let framesSubject: BehaviorSubject<Buffer> = null;

export const startDetection = async (
  workerType: DETECTION_TYPE
): Promise<BehaviorSubject<IFacePoint[]>> => {
  framesSubject = await getFrames();
  createWorker(workerType);
  startProcessing();
  runProcess();
  await getPromise(pointsSubject);
  return pointsSubject;
};

const createWorker = (workerType: DETECTION_TYPE): Promise<any> => {
  return new Promise(resolve => {
    worker = new Worker(workerPaths[workerType], {});
    worker.on("message", data => {
      workerMsgs.next(data);
      if (data && data.type && data.type === "init") {
        resolve();
      }
    });
  });
};

const runProcess = () => {
  const msg: IWorkerDetect = {
    type: "detect",
    buffer: framesSubject.value
  };
  worker.postMessage(msg);
};

const startProcessing = () => {
  workerMsgs
    .pipe(filter(msg => msg && msg.type === "points"))
    .subscribe(({ points }) => {
      pointsSubject.next(points);
      runProcess();
    });
};

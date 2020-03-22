import { createTimer, toFixed } from "./utils";
import { BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";
import { IFacePoint } from "./interfaces";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { log, addFaceDetectionTime, updateFaces } from "./dashboard";

let pointsSubject: BehaviorSubject<IFacePoint[]> = new BehaviorSubject<
  IFacePoint[]
>(null);

let worker: Worker;
let workerMsgs: BehaviorSubject<any> = new BehaviorSubject<any>(null);

// const workerPath = "./dist/worker-faceapi.js";
const workerPath = "./dist/worker-opencv.js";

export const setup = async (): Promise<BehaviorSubject<IFacePoint[]>> => {
  await createWorker();
  startListening();

  return pointsSubject;
};

const createWorker = (): Promise<any> => {
  console.log("detection - createWorker - A");
  return new Promise(resolve => {
    console.log("detection - createWorker - B");
    worker = new Worker(workerPath, {});
    worker.on("message", data => {
      console.log("detection - createWorker - C");
      workerMsgs.next(data);
      if (data && data.type && data.type === "init") {
        console.log("detection - createWorker - D");
        resolve();
      }
    });
  });
};

const startListening = () => {
  console.log("detection - startListening - A");
  const timer = createTimer("points");
  workerMsgs
    .pipe(filter(({ type }) => type === "points"))
    .subscribe(({ points, count }) => {
      console.log("detection - startListening - B");
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
      console.log("detection - startListening - C");
    });
};

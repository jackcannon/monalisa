import { BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";

import { createTimer, toFixed } from "./utils";
import { IFacePoint } from "./interfaces";
import { log, addFaceDetectionTime, updateFaces } from "./dashboard";
import { startDetection } from "./detection-opencv";

let pointsSubject: BehaviorSubject<IFacePoint[]> = null;

// const workerPath = "./dist/worker-faceapi.js";
const workerPath = "./dist/worker-opencv.js";

export const setup = async (): Promise<BehaviorSubject<IFacePoint[]>> => {
  pointsSubject = await startDetection();
  startListening();

  return pointsSubject;
};

const startListening = () => {
  const timer = createTimer("points");
  pointsSubject.pipe(filter(points => !!points)).subscribe(points => {
    const delta = timer();
    addFaceDetectionTime(delta);

    const displayPoints = points.map(point => ({
      x: toFixed(point.x, 2),
      y: toFixed(point.y, 2),
      score: point.score
    }));
    updateFaces(displayPoints, delta);
  });
};

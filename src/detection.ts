import { BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";

import { createTimer, toFixed } from "./utils";
import { IFacePoint } from "./interfaces";
import { log, addRecord } from "./dashboard";
import { useWorker, detectionType } from "./config";
import { DETECTION_TYPE } from "./type";

import { startDetection as startOpencv } from "./detection-opencv";
// import { startDetection as startFaceapi } from "./detection-faceapi-local";
import { startDetection as startWorker } from "./detection-worker";

let pointsSubject: BehaviorSubject<IFacePoint[]> = null;

const getDetectionStart = (): Function => {
  if (useWorker) {
    return () => startWorker(detectionType);
  } else {
    return {
      [DETECTION_TYPE.OPENCV]: startOpencv
      // [DETECTION_TYPE.FACEAPI]: startFaceapi
    }[detectionType];
  }
};

export const setup = async (): Promise<BehaviorSubject<IFacePoint[]>> => {
  pointsSubject = await getDetectionStart()();
  startListening();

  return pointsSubject;
};

const startListening = () => {
  const timer = createTimer("points");
  pointsSubject.pipe(filter(points => !!points)).subscribe(points => {
    const delta = timer();

    const displayPoints = points.map(point => ({
      x: toFixed(point.x, 2),
      y: toFixed(point.y, 2),
      score: point.score
    }));
    addRecord(displayPoints, delta);
  });
};

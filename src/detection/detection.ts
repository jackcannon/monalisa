import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { createTimer, toFixed } from '../utils/utils';
import { IFaceRecord, DETECTION_TYPE } from '../interfaces';
import { log, addDetections } from '../dashboard/dashboard';
import { useWorker, detectionType } from '../config';

import { startDetection as startOpencv } from './opencv';

let startFaceapi = () => {};
if (detectionType === DETECTION_TYPE.FACEAPI && !useWorker) {
  // import { startDetection as startFaceapi } from "./faceapi";
  startFaceapi = require('./faceapi.js').startDetection;
}
import { startDetection as startWorker } from './worker';

let recordsSubject: BehaviorSubject<IFaceRecord[]> = null;

const getDetectionStart = (): Function => {
  if (useWorker) {
    return () => startWorker(detectionType);
  } else {
    return {
      [DETECTION_TYPE.OPENCV]: startOpencv,
      [DETECTION_TYPE.FACEAPI]: startFaceapi,
    }[detectionType];
  }
};

export const setup = async (): Promise<BehaviorSubject<IFaceRecord[]>> => {
  recordsSubject = await getDetectionStart()();
  startListening();

  return recordsSubject;
};

const startListening = () => {
  const timer = createTimer('points');
  recordsSubject.pipe(filter(points => !!points)).subscribe(points => {
    const delta = timer();

    const displayPoints = points.map(
      point =>
        ({
          x: toFixed(point.x, 2),
          y: toFixed(point.y, 2),
          score: point.score,
          time: point.time,
        } as IFaceRecord),
    );
    addDetections(displayPoints, delta);
  });
};

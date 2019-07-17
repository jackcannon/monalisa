import { IFacePoint, ILookedAt } from './interfaces';
import * as movement from './movement';
import * as eyes from './eyes';
import { BehaviorSubject } from 'rxjs';
import { first, filter } from 'rxjs/operators';
import { distanceBetweenPoints } from './utils';

let facesSubject:BehaviorSubject<IFacePoint[]>;
let count = 0;
let lastLookedAt:ILookedAt;

export const setup = (subject:BehaviorSubject<IFacePoint[]>) => {
  facesSubject = subject;

  facesSubject
    .pipe(filter((faces) => !!(faces)))
    .subscribe((faces:IFacePoint[]) => onFaces(faces));

    facesSubject
      .pipe(first())
      .subscribe(() => {
        eyes.drawFrame();
      })
};

export const updateLookedAt = (pick:IFacePoint, faces:IFacePoint[], sameFace:boolean) => {
  if (!lastLookedAt) {
    lastLookedAt = {
      face: pick,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      count: 1,
      otherFaces: faces.filter((face) => face !== pick)
    }
    return;
  }
  if (sameFace) {
    lastLookedAt.count++;
  } else {
    lastLookedAt.count = 1;
    lastLookedAt.firstSeen = Date.now();
  }
  lastLookedAt.face = pick;
  lastLookedAt.otherFaces = faces.filter((face) => face !== pick);
  lastLookedAt.lastSeen = Date.now();
};

// Determine which of the current faces is most likely to be the last looked at
const getLastLookedByDistances = (faces:IFacePoint[]):IFacePoint[] => {
  if (!lastLookedAt) return faces;
  const distances = faces.map((face) => distanceBetweenPoints(lastLookedAt.face, face));
  const sorted = faces.sort((a, b) => distances[faces.indexOf(a)] - distances[faces.indexOf(b)]);
  return sorted;
}

export const lookAt = (pick:IFacePoint) => {
  movement.lookRelativeDegrees(pick, 25);

  const randomWink = Math.floor(Math.random() * 3) === 0;
  const randomBlink = Math.floor(Math.random() * 25) === 0;
  if (!lastLookedAt && randomWink) {
    eyes.drawFrame([
      {},
      {
        eyelid: 100,
        brow: true,
        cheek: true
      }
    ])
  } else if (randomBlink) {
    eyes.drawFrame([
      {
        eyelid: 100
      },
      {
        eyelid: 100
      }
    ]);
  } else {
    eyes.drawFrame();
  }
};


export const onFaces = (faces:IFacePoint[]) => {
  if (faces.length > 0) {
    onSeeingFaces(faces);
  } else if (lastLookedAt && (Date.now() - lastLookedAt.lastSeen) > 2500) {
    lastLookedAt = null;
    eyes.drawFrame();
  } else {
    eyes.drawFrame();
  }
};

const onSeeingFaces = (faces:IFacePoint[]) => {
  if (faces.length === 1) {
    // look at only person
    lookAt(faces[0]);
    updateLookedAt(faces[0], faces, true);
  } else {
    const lastLookedByDistances = getLastLookedByDistances(faces);

    let pick;
    let wasPickLastLookedAt;

    const timeSince = Date.now()

    if (lastLookedAt && (Date.now() - lastLookedAt.firstSeen) > 5000) {
      const otherFaces = lastLookedByDistances.slice(1);
      pick = otherFaces[Math.floor(Math.random() * otherFaces.length)];
      wasPickLastLookedAt = false;
    } else {
      pick = lastLookedByDistances[0];
      wasPickLastLookedAt = true;
    }
    lookAt(pick);
    updateLookedAt(pick, faces, wasPickLastLookedAt);
  }
};

import { IFacePoint, ILookedAt } from './interfaces';
import * as movement from './movement';
import * as eyes from './eyes';
import { BehaviorSubject } from 'rxjs';
import { first, filter } from 'rxjs/operators';
import { distanceBetweenPoints } from './utils';
import { movementSpeed, dontBlinkDistanceThreshold, durationLookingAtEachFace, durationBeforeForgettingFace } from './config';
import { update } from '@tensorflow/tfjs-layers/dist/variables';

enum EYE_TYPE {
  LOOKING_AT_FACE = 'lookingAtFace',
  NOT_LOOKING = 'notLooking',
  BLINKING = 'blinking',
  WINKING = 'winking',
}

let facesSubject:BehaviorSubject<IFacePoint[]>;
let count = 0;
let lastLookedAt:ILookedAt = {
  face: null,
  firstSeen: null,
  lastSeen: Date.now(),
  count: 1,
  otherFaces: []
}

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

export const drawEyes = (type:EYE_TYPE) => {
  switch (type) {
    case EYE_TYPE.LOOKING_AT_FACE:
      eyes.drawFrame([
        { eyelid: 20 },
        { eyelid: 20 }
      ]);
      return;
    case EYE_TYPE.NOT_LOOKING:
      eyes.drawFrame([
        { eyelid: 30 },
        { eyelid: 30 }
      ]);
      return;
    case EYE_TYPE.WINKING:
      eyes.drawFrame([
        {},
        {
          eyelid: 100,
          brow: true,
          cheek: true
        }
      ]);
      return;
    case EYE_TYPE.BLINKING:
      eyes.drawFrame([
        { eyelid: 100 },
        { eyelid: 100 }
      ]);
      return;
  }
}

export const resetLookedAt = () => {
  lastLookedAt.face = null;
  lastLookedAt.firstSeen = null;
  lastLookedAt.count = 1;
  lastLookedAt.otherFaces = [];
}

export const updateLookedAt = (pick:IFacePoint, faces?:IFacePoint[], sameFace?:boolean) => {
  if (!pick) {
    lastLookedAt.face = null;
    lastLookedAt.count += 1;
    return;
  }
  if (!lastLookedAt.face) {
    lastLookedAt.face = pick;
    lastLookedAt.firstSeen = Date.now();
    lastLookedAt.lastSeen = Date.now();
    lastLookedAt.count = 1;
    lastLookedAt.otherFaces = faces.filter((face) => face !== pick);
    return;
  }
  if (sameFace) {
    lastLookedAt.count++;
    lastLookedAt.lastSeen = Date.now();
  } else {
    lastLookedAt.count = 1;
    lastLookedAt.firstSeen = Date.now();
  }
  lastLookedAt.face = pick;
  lastLookedAt.otherFaces = faces.filter((face) => face !== pick);
};

// Determine which of the current faces is most likely to be the last looked at
const getLastLookedByDistances = (faces:IFacePoint[]):IFacePoint[] => {
  if (!lastLookedAt.face) return faces;
  const distances = faces.map((face) => distanceBetweenPoints(lastLookedAt.face, face));
  const sorted = faces.sort((a, b) => distances[faces.indexOf(a)] - distances[faces.indexOf(b)]);
  return sorted;
}

export const lookAt = (pick:IFacePoint) => {
  const distance = movement.getDistance(pick);
  movement.easeRelativeDegrees(pick, movementSpeed)
    .then(() => eyesAfterLook(distance));
};

const eyesAfterLook = (distance) => {
  const notMoved = distance < dontBlinkDistanceThreshold;
  const randomWink = Math.floor(Math.random() * 3) === 0;
  const randomBlink = Math.floor(Math.random() * 25) === 0;
  if (notMoved && !lastLookedAt.face && randomWink) {
    drawEyes(EYE_TYPE.WINKING);
  } else if (notMoved && randomBlink) {
    drawEyes(EYE_TYPE.BLINKING);
  } else {
    drawEyes(EYE_TYPE.LOOKING_AT_FACE);
  }
}


export const onFaces = (faces:IFacePoint[]) => {
  if (faces.length > 0) {
    onSeeingFaces(faces);
    return;
  } else if (lastLookedAt.face && (Date.now() - lastLookedAt.lastSeen) > durationBeforeForgettingFace) {
    resetLookedAt()
  } else if (!lastLookedAt.face) {
    updateLookedAt(null);
  }
  if (lastLookedAt.face) {
    drawEyes(EYE_TYPE.LOOKING_AT_FACE);
  } else {
    drawEyes(EYE_TYPE.NOT_LOOKING);
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

    const timeSince = Date.now();

    if (lastLookedAt.face && (Date.now() - lastLookedAt.firstSeen) > durationLookingAtEachFace) {
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

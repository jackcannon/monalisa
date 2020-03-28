import { IFaceRecord, ILookedAt, IPoint, MOVEMENT_TYPE, EYE_TYPE } from './interfaces';
import * as movement from './movement';
import * as eyes from './eyes';
import { BehaviorSubject } from 'rxjs';
import { first, filter } from 'rxjs/operators';
import { distanceBetweenPoints, delay, toFixed, randomID } from './utils';
import {
  dontBlinkDistanceThreshold,
  durationLookingAtEachFace,
  durationBeforeForgettingFace,
  lookRandomlyAtSomethingDurationBase,
  lookRandomlyAtSomethingDurationRandom,
  randomBlinking,
} from './config';
import { log, updatesFaces } from './dashboard';
import { faceModel } from './faceModel';

let recordsSubject: BehaviorSubject<IFaceRecord[]>;
let count = 0;
let lastLookedAt: ILookedAt = {
  face: null,
  firstSeen: null,
  lastSeen: Date.now(),
  count: 1,
  otherFaces: [],
};
let lookingAroundRandomly: number = null;

export const setup = (subject: BehaviorSubject<IFaceRecord[]>) => {
  recordsSubject = subject;

  recordsSubject.pipe(filter(faces => !!faces)).subscribe((faces: IFaceRecord[]) => onFaces(faces));

  recordsSubject.pipe(first()).subscribe(() => {
    eyes.drawFrame();
  });
};

export const drawEyes = (type: EYE_TYPE, eyeDirection: IPoint = { x: 0.5, y: 0.5 }) => {
  eyeDirection = {
    x: toFixed((eyeDirection.x * 2 - 1) * 0.8 * -1, 4),
    y: toFixed((eyeDirection.y * 2 - 1) * 0.8 + 0.1, 4),
  };
  switch (type) {
    case EYE_TYPE.LOOKING_AT_FACE:
      eyes.drawFrame([{ eyelid: 18 }, { eyelid: 18 }]);
      return;
    case EYE_TYPE.NOT_LOOKING:
      eyes.drawFrame([
        {
          eyelid: 32,
          // brow: true,
          cheek: true,
          ...eyeDirection,
        },
        {
          eyelid: 32,
          // brow: true,
          cheek: true,
          ...eyeDirection,
        },
      ]);
      return;
    case EYE_TYPE.WINKING:
      eyes.drawFrame([
        {},
        {
          eyelid: 100,
          brow: true,
          cheek: true,
        },
      ]);
      return;
    case EYE_TYPE.BLINKING:
      eyes.drawFrame([{ eyelid: 100 }, { eyelid: 100 }]);
      return;
  }
};

export const resetLookedAt = () => {
  lastLookedAt.face = null;
  lastLookedAt.firstSeen = null;
  lastLookedAt.count = 1;
  lastLookedAt.otherFaces = [];
};

export const updateLookedAt = (pick: IFaceRecord, faces?: IFaceRecord[], sameFace?: boolean) => {
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
    lastLookedAt.otherFaces = faces.filter(face => face !== pick);
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
  lastLookedAt.otherFaces = faces.filter(face => face !== pick);
};

// Determine which of the current faces is most likely to be the last looked at
const getLastLookedByDistances = (faces: IFaceRecord[]): IFaceRecord[] => {
  if (!lastLookedAt.face) return faces;
  const distances = faces.map(face => distanceBetweenPoints(lastLookedAt.face, face));
  const sorted = faces.sort((a, b) => distances[faces.indexOf(a)] - distances[faces.indexOf(b)]);
  return sorted;
};

export const lookAt = (pick: IFaceRecord) => {
  const distance = movement.getDistance(pick);
  movement.toRelativeDegrees(pick, MOVEMENT_TYPE.FACE).then(() => eyesAfterLook(distance));
};

export const lookAroundRandomly = (): Promise<IPoint> => {
  const lookID = randomID();
  lookingAroundRandomly = lookID;
  const direction: IPoint = {
    x: toFixed(Math.random(), 3),
    y: toFixed(Math.random(), 3),
  };
  const move = movement.toRelativeDegrees(direction, MOVEMENT_TYPE.RANDOM);

  move
    .then(() =>
      delay(
        lookRandomlyAtSomethingDurationBase +
          Math.floor(Math.random() * lookRandomlyAtSomethingDurationRandom),
      ),
    )
    .then(() => {
      if (lookID === lookingAroundRandomly) {
        lookingAroundRandomly = null;
      }
    });

  return move.then(() => direction);
};

const eyesAfterLook = distance => {
  const notMoved = distance < dontBlinkDistanceThreshold;
  const randomWink = Math.floor(Math.random() * 3) === 0;
  const randomBlink = Math.floor(Math.random() * 25) === 0;
  if (notMoved && !lastLookedAt.face && randomWink) {
    drawEyes(EYE_TYPE.WINKING);
  } else if (randomBlinking && notMoved && randomBlink) {
    drawEyes(EYE_TYPE.BLINKING);
  } else {
    drawEyes(EYE_TYPE.LOOKING_AT_FACE);
  }
};

export const onFaces = (faces: IFaceRecord[]) => {
  // new stuff
  faceModel.updateFaces(faces);
  const faceData = faceModel.toData();
  updatesFaces(faceData.faces, faceData.target);

  // old stuff
  if (faces.length > 0) {
    onSeeingFaces(faces);
    lookingAroundRandomly = null;
    return;
  } else if (
    lastLookedAt.face &&
    Date.now() - lastLookedAt.lastSeen > durationBeforeForgettingFace
  ) {
    resetLookedAt();
    log.log('forgotten you');
  } else if (!lastLookedAt.face) {
    updateLookedAt(null);
  }
  if (lastLookedAt.face) {
    drawEyes(EYE_TYPE.LOOKING_AT_FACE); // didn't see this time, but still not forgotten
  } else {
    // not seen anyone for a while
    if (!lookingAroundRandomly) {
      lookAroundRandomly().then(direction => drawEyes(EYE_TYPE.NOT_LOOKING, direction));
    } else {
      drawEyes(EYE_TYPE.NOT_LOOKING);
    }
  }
};

const onSeeingFaces = (faces: IFaceRecord[]) => {
  if (faces.length === 1) {
    // look at only person
    lookAt(faces[0]);
    updateLookedAt(faces[0], faces, true);
  } else {
    const lastLookedByDistances = getLastLookedByDistances(faces);

    let pick;
    let wasPickLastLookedAt;

    const timeSince = Date.now();

    if (lastLookedAt.face && Date.now() - lastLookedAt.firstSeen > durationLookingAtEachFace) {
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

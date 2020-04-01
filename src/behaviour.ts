import {
  IFaceRecord,
  IPoint,
  MOVEMENT_TYPE,
  EYE_TYPE,
  BEHAVIOUR_STATE,
  ITargetManager,
  IEyeConfig,
} from './interfaces';
import * as movement from './movement';
import * as eyes from './eyes';
import { BehaviorSubject } from 'rxjs';
import { first, filter } from 'rxjs/operators';
import { distanceBetweenPoints, delay, toFixed, randomID, since } from './utils';
import {
  dontBlinkDistanceThreshold,
  durationSearchingBeforeSleeping,
  searchDurationBase,
  searchDurationRandom,
  enableBlinking,
  sleepingMidPoint,
  sleepingRestPoint,
  enableWinking,
  startingState,
  enableSleeping,
} from './config';
import { updateBehaviour, log } from './dashboard';
import { faceManager, FaceManager, KnownFace } from './faceManager';
import { start } from './worker-eyes';

const eyeConfigs: { [key: string]: (eyeDirection: IPoint) => IEyeConfig } = {
  normal: () => ({}),
  seeing: () => ({ eyelid: 18 }),
  unseeing: eyeDirection => ({ eyelid: 32, cheek: true, ...eyeDirection }),
  winking: () => ({ eyelid: 100, brow: true, cheek: true }),
  drowsy1: () => ({ eyelid: 50, brow: true, cheek: true }),
  drowsy2: () => ({ eyelid: 75, brow: true }),
  closed: () => ({ eyelid: 100 }),
};

const defaultEyeTypes = {
  [BEHAVIOUR_STATE.AT_TARGET]: EYE_TYPE.LOOKING_AT_FACE,
  [BEHAVIOUR_STATE.SEARCHING]: EYE_TYPE.NOT_LOOKING,
};

let recordsSubject: BehaviorSubject<IFaceRecord[]>;
let stateManager = new (class StateManager {
  state: BEHAVIOUR_STATE = null;
  hasChanged: boolean = false;
  update() {
    const oldState = this.state;

    if (enableSleeping && oldState === null) {
      this.state = startingState;
    } else if (enableSleeping && oldState === BEHAVIOUR_STATE.WAKING_UP) {
      // do nothing
    } else if (enableSleeping && oldState === BEHAVIOUR_STATE.SLEEPING) {
      if (faceManager.target) {
        this.state = BEHAVIOUR_STATE.WAKING_UP;
      }
    } else if (faceManager.target) {
      this.state = BEHAVIOUR_STATE.AT_TARGET;
    } else if (searchManager.target) {
      this.state = BEHAVIOUR_STATE.SEARCHING;
    } else if (enableSleeping) {
      this.state = BEHAVIOUR_STATE.SLEEPING;
    }

    this.hasChanged = oldState !== this.state;
  }
})();

class SearchManager implements ITargetManager {
  target: IPoint;
  targetSince: number;
  targetExpiration: number;
  searchingSince: number;
  hasChanged: boolean = false;

  isReadyToSleep(): boolean {
    return (
      enableSleeping &&
      !!this.searchingSince &&
      since(this.searchingSince) > durationSearchingBeforeSleeping
    );
  }

  clear() {
    this.target = null;
    this.targetSince = null;
    this.targetExpiration = null;
    this.searchingSince = null;
  }

  setNewTarget() {
    this.target = {
      x: toFixed(Math.random(), 3),
      y: toFixed(Math.random() * 0.8, 3),
    };
    this.targetSince = Date.now();
    const duration = searchDurationBase + Math.floor(Math.random() * searchDurationRandom);
    this.targetExpiration = Date.now() + duration;
  }

  update(faceTarget: KnownFace): boolean {
    this.hasChanged = false;
    if (faceTarget || this.isReadyToSleep()) {
      this.clear();
      this.hasChanged = true;
    } else {
      const noTarget = !this.target;
      const expired = since(this.targetExpiration) >= 0;
      if (noTarget || expired) {
        this.setNewTarget();
        this.hasChanged = true;
      }
      if (!this.searchingSince) {
        this.searchingSince = Date.now();
      }
    }
    return this.hasChanged;
  }
}
const searchManager = new SearchManager();

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
  let configs = [eyeConfigs.normal, eyeConfigs.normal];
  switch (type) {
    case EYE_TYPE.NORMAL:
      configs = [eyeConfigs.normal, eyeConfigs.normal];
      break;
    case EYE_TYPE.LOOKING_AT_FACE:
      configs = [eyeConfigs.seeing, eyeConfigs.seeing];
      break;
    case EYE_TYPE.NOT_LOOKING:
      configs = [eyeConfigs.unseeing, eyeConfigs.unseeing];
      break;
    case EYE_TYPE.WINKING:
      configs = [eyeConfigs.normal, eyeConfigs.winking];
      break;
    case EYE_TYPE.DROWSY_1:
      configs = [eyeConfigs.drowsy1, eyeConfigs.drowsy1];
      break;
    case EYE_TYPE.DROWSY_2:
      configs = [eyeConfigs.drowsy2, eyeConfigs.drowsy2];
      break;
    case EYE_TYPE.BLINKING:
    case EYE_TYPE.CLOSED:
      configs = [eyeConfigs.closed, eyeConfigs.closed];
      break;
  }
  eyes.drawFrame(configs.map(config => config(eyeDirection)));
};

const lookAt = async (point: IPoint, movementType: MOVEMENT_TYPE) => {
  const distance = movement.getDistance(point);
  await movement.toRelativeDegrees(point, movementType);
  eyesAfterLook(distance);
};

const goToSleep = async () => {
  drawEyes(EYE_TYPE.DROWSY_1);
  await movement.toRelativeDegrees(sleepingMidPoint, MOVEMENT_TYPE.TIRED);
  drawEyes(EYE_TYPE.DROWSY_2);
  await movement.toRelativeDegrees(sleepingRestPoint, MOVEMENT_TYPE.TIRED);
  drawEyes(EYE_TYPE.CLOSED);
};
const blink = async (startEyes: EYE_TYPE = EYE_TYPE.NORMAL, endEyes: EYE_TYPE = startEyes) => {
  if (startEyes) {
    drawEyes(startEyes);
  }
  await delay(1500);
  drawEyes(EYE_TYPE.BLINKING);
  await delay(1500);
  if (endEyes) {
    drawEyes(endEyes);
  }
};
const wakeUp = async () => {
  // await movement.toRelativeDegrees(sleepingRestPoint, MOVEMENT_TYPE.TIRED);
  // await delay(500);

  // const start = Date.now();
  drawEyes(EYE_TYPE.DROWSY_2);
  await movement.toRelativeDegrees(sleepingMidPoint, MOVEMENT_TYPE.TIRED);

  // await blink(EYE_TYPE.DROWSY_1);

  stateManager.state = BEHAVIOUR_STATE.AWAKE;
};

const eyesAfterLook = distance => {
  const notMoved = distance < dontBlinkDistanceThreshold;
  const randomWink = Math.floor(Math.random() * 3) === 0;
  const randomBlink = Math.floor(Math.random() * 25) === 0;

  const eyeType = defaultEyeTypes[stateManager.state];

  if (enableWinking && notMoved && randomWink && !faceManager.target) {
    drawEyes(EYE_TYPE.WINKING);
  } else if (enableBlinking && notMoved && randomBlink) {
    drawEyes(EYE_TYPE.BLINKING);
  } else if (eyeType) {
    drawEyes(eyeType);
  }
};

export const onFaces = (faces: IFaceRecord[]) => {
  faceManager.updateFaces(faces);
  searchManager.update(faceManager.target);
  stateManager.update();

  switch (stateManager.state) {
    case BEHAVIOUR_STATE.AT_TARGET:
      lookAt(faceManager.target.point, MOVEMENT_TYPE.FACE);
      break;
    case BEHAVIOUR_STATE.SEARCHING:
      if (searchManager.hasChanged) {
        lookAt(searchManager.target, MOVEMENT_TYPE.SEARCH);
      }
      break;
    case BEHAVIOUR_STATE.SLEEPING:
      if (stateManager.hasChanged) {
        goToSleep();
      }
      break;
    case BEHAVIOUR_STATE.WAKING_UP:
      if (stateManager.hasChanged) {
        wakeUp();
      }
      break;
    case BEHAVIOUR_STATE.AWAKE:
      throw new Error('Shouldnt be in AWAKE state');
  }

  // update Dashboard
  const faceData = faceManager.toData();
  updateBehaviour(faceData.faces, stateManager.state);
};

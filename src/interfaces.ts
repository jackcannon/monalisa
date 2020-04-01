export interface IPoint {
  x: number;
  y: number;
}

export interface IFacePoint extends IPoint {
  score: number;
}

export interface IFaceRecord extends IFacePoint {
  time: number;
}

export interface IFace {
  point: IFaceRecord; // last known location
  // historicalPoints: IFaceRecord[];
  isTarget: boolean;
  firstSeen: number;
  lastSeen: number;
}

export interface ITargetManager {
  target: any;
  targetSince: number;
}

// export interface ILookedAt {
//   face: IFaceRecord;
//   firstSeen: number;
//   lastSeen: number;
//   count: number;
//   otherFaces?: IFaceRecord[];
// }

export enum BEHAVIOUR_STATE {
  AT_TARGET = 'target',
  SEARCHING = 'searching',
  SLEEPING = 'sleeping',
  WAKING_UP = 'waking',
  AWAKE = 'awake',
}

export interface IEyeConfig {
  x?: number; // -1 -> 1
  y?: number; // -1 -> 1
  eyelid?: number; // 0 -> 100
  brow?: boolean; // is brow furrowed
  cheek?: boolean; // is cheek raised
}

export enum DETECTION_TYPE {
  OPENCV = 'opencv',
  FACEAPI = 'faceapi',
  PICO = 'pico',
}

export enum OLED_LAYER {
  BACK = 0,
  FORE = 1,
}

export enum OLED_COLOR {
  BLACK = 0,
  WHITE = 1,
}

export enum MOVEMENT_TYPE {
  FACE = 'face',
  SEARCH = 'search',
  TIRED = 'tired', // sleeping/waking
}

export enum MOVE_TYPE {
  LOOK = 'look',
  EASE = 'ease',
}

export enum EASE_TYPE {
  linear = 'linear',
  inQuad = 'inQuad',
  outQuad = 'outQuad',
  inOutQuad = 'inOutQuad',
  inCube = 'inCube',
  outCube = 'outCube',
  inOutCube = 'inOutCube',
  inQuart = 'inQuart',
  outQuart = 'outQuart',
  inOutQuart = 'inOutQuart',
  inQuint = 'inQuint',
  outQuint = 'outQuint',
  inOutQuint = 'inOutQuint',
  inSine = 'inSine',
  outSine = 'outSine',
  inOutSine = 'inOutSine',
  inExpo = 'inExpo',
  outExpo = 'outExpo',
  inOutExpo = 'inOutExpo',
  inCirc = 'inCirc',
  outCirc = 'outCirc',
  inOutCirc = 'inOutCirc',
  inBack = 'inBack',
  outBack = 'outBack',
  inOutBack = 'inOutBack',
  inBounce = 'inBounce',
  outBounce = 'outBounce',
  inOutBounce = 'inOutBounce',
}

export enum EYE_TYPE {
  NORMAL = 'normal',
  LOOKING_AT_FACE = 'lookingAtFace',
  NOT_LOOKING = 'notLooking',
  BLINKING = 'blinking',
  WINKING = 'winking',
  DROWSY_1 = 'drowsy1',
  DROWSY_2 = 'drowsy2',
  CLOSED = 'closed',
}

// Worker messages
export interface IWorkerMessage {
  type: string;
}

export interface IWorkerInit extends IWorkerMessage {}

export interface IWorkerDetect extends IWorkerMessage {
  buffer: any;
}

export interface IWorkerPoints extends IWorkerMessage {
  points: IFaceRecord[];
}

// Child Process messages
export interface IChildProcessMessage {
  type: string;
}

export interface IDashboardSetup extends IChildProcessMessage {
  startTime: number;
}
export interface IDashboardLog extends IChildProcessMessage {
  data: any[];
}
export interface IDashboardRecord extends IChildProcessMessage {
  points: IFaceRecord[];
  delta: number;
}

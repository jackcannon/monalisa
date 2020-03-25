import { IFacePoint } from "./interfaces";

export enum DETECTION_TYPE {
  OPENCV = "opencv",
  FACEAPI = "faceapi",
  PICO = "pico"
}

export enum OLED_LAYER {
  BACK = 0,
  FORE = 1
}

export enum OLED_COLOR {
  BLACK = 0,
  WHITE = 1
}

export enum MOVE_TYPE {
  LOOK = "look",
  EASE = "ease"
}

export enum EASE_TYPE {
  linear = "linear",
  inQuad = "inQuad",
  outQuad = "outQuad",
  inOutQuad = "inOutQuad",
  inCube = "inCube",
  outCube = "outCube",
  inOutCube = "inOutCube",
  inQuart = "inQuart",
  outQuart = "outQuart",
  inOutQuart = "inOutQuart",
  inQuint = "inQuint",
  outQuint = "outQuint",
  inOutQuint = "inOutQuint",
  inSine = "inSine",
  outSine = "outSine",
  inOutSine = "inOutSine",
  inExpo = "inExpo",
  outExpo = "outExpo",
  inOutExpo = "inOutExpo",
  inCirc = "inCirc",
  outCirc = "outCirc",
  inOutCirc = "inOutCirc",
  inBack = "inBack",
  outBack = "outBack",
  inOutBack = "inOutBack",
  inBounce = "inBounce",
  outBounce = "outBounce",
  inOutBounce = "inOutBounce"
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
  points: IFacePoint[];
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
  points: IFacePoint[];
  delta: number;
}

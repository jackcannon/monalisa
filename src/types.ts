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

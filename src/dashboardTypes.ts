import { IFaceRecord, IFace } from "./interfaces";
import { KnownFace } from "./faceModel";

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
export interface IDashboardFaces extends IChildProcessMessage {
  faces: IFace[];
  target: IFace;
  time: number;
}

import { IFaceRecord } from "./interfaces";

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

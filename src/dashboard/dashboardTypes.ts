import { IFaceRecord, IFace, BEHAVIOUR_STATE, IPoint } from '../interfaces';

export interface IChildProcessMessage {
  type: string;
}

export interface IDashboardSetup extends IChildProcessMessage {
  startTime: number;
}
export interface IDashboardLog extends IChildProcessMessage {
  data: any[];
}
export interface IDashboardDetections extends IChildProcessMessage {
  points: IFaceRecord[];
  delta: number;
}
export interface IDashboardBehaviour extends IChildProcessMessage {
  faces: IFace[];
  state: BEHAVIOUR_STATE;
  searchTarget: IPoint;
  time: number;
}

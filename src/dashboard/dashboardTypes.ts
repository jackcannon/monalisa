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

export interface IBlessedDispConfig {
  fg: string;
  bold: boolean;
}

export interface IDashComponent {
  gridItem: any;
  init: (grid: any, coors: number[]) => any;
  setup?: () => any;
  update?: (manager: IDashManagerData) => any;
  updateBehaviour?: (msg: IDashboardBehaviour, manager: IDashManagerData) => any;
}

export interface IDashManagerData {
  startTime: number;
  detectionTimes: number[];
  totalRecordCount: number;
  detectionRecords: IFaceRecord[][];
}

export interface IPoint {
  x: number;
  y: number;
}

export interface IFacePoint extends IPoint {
  score: number;
}

export interface ILookedAt {
  face: IFacePoint;
  firstSeen: number;
  lastSeen: number;
  count: number;
  otherFaces?:IFacePoint[];
}

export interface IEyeConfig {
  x?: number; // -1 -> 1
  y?: number; // -1 -> 1
  eyelid?: number; // 0 -> 100
  brow?: boolean; // is brow furrowed
  cheek?: boolean; // is cheek raised
}

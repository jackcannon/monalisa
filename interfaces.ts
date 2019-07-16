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

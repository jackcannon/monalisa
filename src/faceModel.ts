import { IFaceRecord, IPoint } from "./interfaces";
import { sameFaceThreshold, cullFaceThreshold } from "./config";
import { distanceBetweenPoints } from "./utils";

const dataLimit = 100;

class KnownFace {
  point: IFaceRecord; // last known location
  historicalPoints: IFaceRecord[];
  isTarget: boolean;
  firstSeen: Date;
  lastSeen: Date;

  // does given point fall within range to be assumed to be tha same face
  isSameFace(point: IPoint) {
    return distanceBetweenPoints(point, this.point) < sameFaceThreshold;
  }

  // is given point too close to proper face
  isInCullSpace(point: IPoint) {
    return distanceBetweenPoints(point, this.point) < cullFaceThreshold;
  }

  update(newPoint: IFaceRecord) {
    this.historicalPoints.push(newPoint);
    if (this.historicalPoints.length > dataLimit) {
      this.historicalPoints.splice(0, this.historicalPoints.length - dataLimit);
    }
    if (newPoint) {
      this.point = newPoint;
      this.lastSeen = newPoint.timestamp;
    }
  }
}

class FaceModel {
  knownFaces: KnownFace[];
  target: KnownFace;

  updateFaces(points: IFaceRecord) {}
}

export const faceModel = new FaceModel();

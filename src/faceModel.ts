import { IFace, IFaceRecord, IPoint } from './interfaces';
import { sameFaceThreshold, cullFaceThreshold, durationBeforeForgettingFace } from './config';
import { distanceBetweenPoints } from './utils';
import { log } from './dashboard';

const dataLimit = 100;

export class KnownFace implements IFace {
  point: IFaceRecord; // last known location
  historicalPoints: IFaceRecord[] = [];
  isTarget: boolean = false;
  firstSeen: number = null;
  lastSeen: number = null;

  distanceTo(point: IPoint) {
    return distanceBetweenPoints(point, this.point);
  }

  // does given point fall within range to be assumed to be tha same face
  isSameFace(point: IPoint) {
    return this.distanceTo(point) < sameFaceThreshold;
  }

  // is given point too close to proper face
  isInCullSpace(point: IPoint) {
    return this.distanceTo(point) < cullFaceThreshold;
  }

  isForgotten() {
    return Date.now() - this.lastSeen > durationBeforeForgettingFace;
  }

  toData(): IFace {
    const { point, historicalPoints, isTarget, firstSeen, lastSeen } = this;
    return { point, historicalPoints, isTarget, firstSeen, lastSeen } as IFace;
  }

  update(newPoint: IFaceRecord) {
    this.historicalPoints.push(newPoint);
    if (this.historicalPoints.length > dataLimit) {
      this.historicalPoints.splice(0, this.historicalPoints.length - dataLimit);
    }
    if (newPoint) {
      this.point = newPoint;
      this.lastSeen = newPoint.time;
      if (!this.firstSeen) {
        this.firstSeen = newPoint.time;
      }
    }
  }
}

class FaceModel {
  knownFaces: KnownFace[] = [];
  target: KnownFace = null;

  get prioritisedFaces(): KnownFace[] {
    return this.target
      ? [this.target, ...this.knownFaces.filter(face => face !== this.target)]
      : this.knownFaces;
  }

  toData(): { faces: IFace[]; target: IFace } {
    return {
      faces: this.knownFaces.map(face => face.toData()),
      target: this.target && this.target.toData(),
    };
  }

  addFace(point: IFaceRecord) {
    const newFace = new KnownFace();
    newFace.update(point);
    this.knownFaces.push(newFace);
  }

  removeFace(face: KnownFace) {
    if (this.knownFaces.includes(face)) {
      this.knownFaces.splice(this.knownFaces.indexOf(face), 1);
    }
  }

  updateFaces(points: IFaceRecord[]) {
    const unused = [...points];
    this.prioritisedFaces.forEach(face => {
      const pointsDistances = unused.map(point => face.distanceTo(point));
      const matches = unused
        .filter(p => pointsDistances[unused.indexOf(p)])
        .sort((a, b) => pointsDistances[unused.indexOf(a)] - pointsDistances[unused.indexOf(b)]);
      face.update(matches[0]);
      unused.splice(unused.indexOf(matches[0]));
    });

    // removing old faces goes here
    this.prioritisedFaces.filter(face => face.isForgotten()).forEach(face => this.removeFace(face));

    const nonCulled = unused.filter(
      point => !this.knownFaces.find(face => face.isInCullSpace(point)),
    );
    nonCulled.forEach(point => this.addFace(point));
  }
}

export const faceModel = new FaceModel();

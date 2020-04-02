import { IFace, IFaceRecord, IPoint, ITargetManager } from '../interfaces';
import {
  sameFaceThreshold,
  cullFaceThreshold,
  durationBeforeForgettingFace,
  durationLookingAtEachFace,
  minimumDurationToBeTargetable,
} from '../config';
import { distanceBetweenPoints, since } from '../utils';

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
    return since(this.lastSeen) > durationBeforeForgettingFace;
  }

  isTargetable() {
    return since(this.firstSeen) > minimumDurationToBeTargetable;
  }

  toData(): IFace {
    const { point, isTarget, firstSeen, lastSeen } = this;
    return { point, isTarget, firstSeen, lastSeen } as IFace;
  }

  updateTarget(target: KnownFace) {
    this.isTarget = target === this;
    return this.isTarget;
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

export class FaceManager implements ITargetManager {
  knownFaces: KnownFace[] = [];
  target: KnownFace = null;
  targetSince: number = 0;

  get prioritisedFaces(): KnownFace[] {
    return this.target ? [this.target, ...this.otherFaces] : this.knownFaces;
  }

  get otherFaces(): KnownFace[] {
    return this.knownFaces.filter(face => face !== this.target);
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

  updateTarget() {
    const noCurrTarget = !this.target && this.knownFaces.length;
    const targetGone = !this.knownFaces.includes(this.target);
    const timeToSwitch = since(this.targetSince) > durationLookingAtEachFace;
    const eligibleFaces = timeToSwitch && this.otherFaces.filter(face => face.isTargetable());
    if (noCurrTarget || targetGone || (timeToSwitch && eligibleFaces.length)) {
      let candidates = eligibleFaces || this.otherFaces; // eligableFaces only for timeToSwitch
      if (candidates.length) {
        this.target = candidates[Math.floor(Math.random() * candidates.length)];
        this.targetSince = Date.now();
      } else {
        this.target = null;
        this.targetSince = null;
      }
    }
    this.knownFaces.forEach(face => face.updateTarget(this.target));
  }

  updateFaces(points: IFaceRecord[]) {
    const unused = [...points];

    this.prioritisedFaces.forEach(face => {
      let matches = unused.filter(p => face.isSameFace(p));
      const pointsDistances = matches.map(point => face.distanceTo(point));
      matches = matches.sort(
        (a, b) => pointsDistances[matches.indexOf(a)] - pointsDistances[matches.indexOf(b)],
      );
      face.update(matches[0]);
      if (matches[0]) {
        unused.splice(unused.indexOf(matches[0]));
      }
    });
    // removing old faces goes here
    this.prioritisedFaces.filter(face => face.isForgotten()).forEach(face => this.removeFace(face));

    const nonCulled = unused.filter(
      point => !this.knownFaces.find(face => face.isInCullSpace(point)),
    );
    nonCulled.forEach(point => this.addFace(point));

    this.updateTarget();
  }
}

export const faceManager = new FaceManager();

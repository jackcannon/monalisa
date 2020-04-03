import { IFace, IFaceRecord, IPoint, ITargetManager } from '../interfaces';
import {
  sameFaceThreshold,
  cullFaceThreshold,
  durationBeforeIgnoringFace,
  durationBeforeForgettingFace,
  durationLookingAtEachFace,
  minimumDurationToBeTargetable,
} from '../config';
import { distanceBetweenPoints, since } from '../utils/utils';
import nameGenerator from '../utils/names';

const dataLimit = 100;

export class KnownFace implements IFace {
  name: string;
  point: IFaceRecord; // last known location
  historicalPoints: IFaceRecord[] = [];
  isTarget: boolean = false;
  firstSeen: number = null;
  lastSeen: number = null;

  constructor() {
    this.name = nameGenerator();
  }

  get isIgnored(): boolean {
    return since(this.lastSeen) > durationBeforeIgnoringFace;
  }

  get isForgotten(): boolean {
    return since(this.lastSeen) > durationBeforeForgettingFace;
  }

  get isTargetable(): boolean {
    return since(this.firstSeen) > minimumDurationToBeTargetable;
  }

  get isEligible(): boolean {
    return this.isTargetable && !this.isIgnored;
  }

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

  toData(): IFace {
    const {
      name,
      point,
      isTarget,
      firstSeen,
      lastSeen,
      isTargetable,
      isIgnored,
      isEligible,
    } = this;
    return {
      name,
      point,
      isTarget,
      firstSeen,
      lastSeen,
      isTargetable,
      isIgnored,
      isEligible,
    } as IFace;
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
    const targetNotEligible = this.target && !this.target.isEligible;
    const targetGone = !this.knownFaces.includes(this.target);
    const timeToSwitch = since(this.targetSince) > durationLookingAtEachFace;
    const eligibleFaces =
      (targetNotEligible || timeToSwitch) && this.otherFaces.filter(face => face.isEligible);
    if (noCurrTarget || targetNotEligible || targetGone || (timeToSwitch && eligibleFaces.length)) {
      let candidates = eligibleFaces || this.otherFaces; // eligibleFaces for timeToSwitch & targetNotEligible only
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
    this.prioritisedFaces.filter(face => face.isForgotten).forEach(face => this.removeFace(face));

    const nonCulled = unused.filter(
      point => !this.knownFaces.find(face => face.isInCullSpace(point)),
    );
    nonCulled.forEach(point => this.addFace(point));

    this.updateTarget();
  }
}

export const faceManager = new FaceManager();

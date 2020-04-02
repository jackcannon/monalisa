import { IPoint, ITargetManager } from '../interfaces';
import {
  durationSearchingBeforeSleeping,
  searchDurationBase,
  searchDurationRandom,
  enableSleeping,
} from '../config';
import { toFixed, since } from '../utils';

import { KnownFace } from './faceManager';

export class SearchManager implements ITargetManager {
  target: IPoint;
  targetSince: number;
  targetExpiration: number;
  searchingSince: number;
  hasChanged: boolean = false;

  isReadyToSleep(): boolean {
    return (
      enableSleeping &&
      !!this.searchingSince &&
      since(this.searchingSince) > durationSearchingBeforeSleeping
    );
  }

  clear() {
    this.target = null;
    this.targetSince = null;
    this.targetExpiration = null;
    this.searchingSince = null;
  }

  setNewTarget() {
    this.target = {
      x: toFixed(Math.random(), 3),
      y: toFixed(Math.random() * 0.8, 3),
    };
    this.targetSince = Date.now();
    const duration = searchDurationBase + Math.floor(Math.random() * searchDurationRandom);
    this.targetExpiration = Date.now() + duration;
  }

  update(faceTarget: KnownFace): boolean {
    this.hasChanged = false;
    if (faceTarget || this.isReadyToSleep()) {
      this.clear();
      this.hasChanged = true;
    } else {
      const noTarget = !this.target;
      const expired = since(this.targetExpiration) >= 0;
      if (noTarget || expired) {
        this.setNewTarget();
        this.hasChanged = true;
      }
      if (!this.searchingSince) {
        this.searchingSince = Date.now();
      }
    }
    return this.hasChanged;
  }
}

export const searchManager = new SearchManager();

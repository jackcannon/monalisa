import { BEHAVIOUR_STATE } from '../interfaces';
import { startingState, enableSleeping } from '../config';
import { FaceManager } from './faceManager';
import { SearchManager } from './searchManager';

export class StateManager {
  state: BEHAVIOUR_STATE = null;
  hasChanged: boolean = false;
  update(faceManager: FaceManager, searchManager: SearchManager) {
    const oldState = this.state;

    if (enableSleeping && oldState === null) {
      this.state = startingState;
    } else if (enableSleeping && oldState === BEHAVIOUR_STATE.WAKING_UP) {
      // do nothing
    } else if (enableSleeping && oldState === BEHAVIOUR_STATE.SLEEPING) {
      if (faceManager.target) {
        this.state = BEHAVIOUR_STATE.WAKING_UP;
      }
    } else if (faceManager.target) {
      this.state = BEHAVIOUR_STATE.AT_TARGET;
    } else if (searchManager.target) {
      this.state = BEHAVIOUR_STATE.SEARCHING;
    } else if (enableSleeping) {
      this.state = BEHAVIOUR_STATE.SLEEPING;
    }

    this.hasChanged = oldState !== this.state;
  }
}

export const stateManager = new StateManager();

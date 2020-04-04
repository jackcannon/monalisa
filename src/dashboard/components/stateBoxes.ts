import blessed from 'blessed';

import { BEHAVIOUR_STATE, IFace } from '../../interfaces';

import {
  IDashComponent,
  IDashboardBehaviour,
  IBlessedDispConfig,
  IDashManagerData,
} from '../dashboardTypes';
import { dispConfigManager } from '../dispConfigManager';

const dispConfigs = {
  [BEHAVIOUR_STATE.AT_TARGET]: null,
  [BEHAVIOUR_STATE.SEARCHING]: { fg: 'red', bold: true },
  [BEHAVIOUR_STATE.SLEEPING]: { fg: 'blue', bold: true },
  [BEHAVIOUR_STATE.WAKING_UP]: { fg: 'blue', bold: true },
  [BEHAVIOUR_STATE.AWAKE]: { fg: 'blue', bold: true },
};

class StateBoxes implements IDashComponent {
  gridItem: { [state: string]: any };

  target: IFace;

  init(grid: any, coors: number[]) {
    const [sY, sX] = coors;
    this.gridItem = {
      [BEHAVIOUR_STATE.AT_TARGET]: this.createBox(grid, 'AT_TARGET', sY, sX, 3, 1),
      [BEHAVIOUR_STATE.SEARCHING]: this.createBox(grid, 'SEARCHING', sY, sX + 1, 3, 1),
      [BEHAVIOUR_STATE.SLEEPING]: this.createBox(grid, 'SLEEPING', sY, sX + 2, 1, 1),
      [BEHAVIOUR_STATE.WAKING_UP]: this.createBox(grid, 'WAKING_UP', sY + 1, sX + 2, 1, 1),
      [BEHAVIOUR_STATE.AWAKE]: this.createBox(grid, 'AWAKE', sY + 2, sX + 2, 1, 1),
    };
  }

  getArray() {
    return [
      ['AT_TARGET', this.gridItem[BEHAVIOUR_STATE.AT_TARGET]],
      ['SEARCHING', this.gridItem[BEHAVIOUR_STATE.SEARCHING]],
      ['SLEEPING', this.gridItem[BEHAVIOUR_STATE.SLEEPING]],
      ['WAKING_UP', this.gridItem[BEHAVIOUR_STATE.WAKING_UP]],
      ['AWAKE', this.gridItem[BEHAVIOUR_STATE.AWAKE]],
    ];
  }

  createBox(grid, id, ...pos) {
    return grid.set(...pos, blessed.box, {
      label: null,
      content: id,
      tags: true,
      style: {
        fg: 'black',
        bg: 'black',
        bold: true,
        border: {
          fg: 'black',
          bg: 'black',
          bold: true,
        },
      },
    });
  }

  getContent(id: string, box: any) {
    return id === 'AT_TARGET' ? this.getAtTargetContent(id, box) : this.getRegularContent(id, box);
  }

  getAtTargetContent(id: string, box: any) {
    if (!this.target) {
      return this.getRegularContent(id, box);
    }
    const buffer = '\n'.repeat(Math.max(0, Math.floor((box.height - 2 - 3) / 2)));
    let content = `${buffer}{center}${id}{/center}`;
    content += `\n\n{center}Target: ${this.target.name}{/center}`;
    return content;
  }

  getRegularContent(id: string, box: any) {
    const buffer = '\n'.repeat(Math.max(0, Math.floor((box.height - 2 - 1) / 2)));
    return `${buffer}{center}${id}{/center}`;
  }

  getDispConfig(state: BEHAVIOUR_STATE): IBlessedDispConfig {
    if (state === BEHAVIOUR_STATE.AT_TARGET) {
      return dispConfigManager.get(this.target.name);
    }

    return dispConfigs[state];
  }

  updateBehaviour(msg: IDashboardBehaviour, _manager: IDashManagerData) {
    const { state, faces } = msg;

    this.target = faces.find(face => face.isTarget);

    this.getArray().forEach(([id, box]) => {
      box.setContent(this.getContent(id, box));
      box.style = {
        fg: 'black',
        bg: 'black',
        bold: true,
        border: {
          fg: 'black',
          bg: 'black',
          bold: true,
        },
      };
    });
    let dispConfig = this.getDispConfig(state);

    this.gridItem[state].style = {
      ...dispConfig,
      border: {
        ...dispConfig,
      },
    };
  }
}

export const stateBoxes = new StateBoxes();

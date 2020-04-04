import blessed from 'blessed';

import { MOVEMENT_TYPE } from '../../interfaces';
import { formatDataType } from '../../utils/dashUtils';

import { IDashComponent } from '../dashboardTypes';

import {
  savePhotoOnDetection,
  photoWidth,
  moveSpeed,
  durationLookingAtEachFace,
  durationBeforeIgnoringFace,
  durationBeforeForgettingFace,
  moveType,
  enableSleeping,
  enableBlinking,
  enableWinking,
  sameFaceThreshold,
  cullFaceThreshold,
} from '../../config';

const configArr = [
  ['enableSleeping', enableSleeping],
  ['enableBlinking', enableBlinking],
  ['enableWinking', enableWinking],
  ['moveSpeed', Object.values(moveSpeed)],
  ['moveType', Object.values(moveType)],
  ['durationLookingAtEachFace', durationLookingAtEachFace],
  ['durationBeforeIgnoringFace', durationBeforeIgnoringFace],
  ['durationBeforeForgettingFace', durationBeforeForgettingFace],
  ['sameFaceThreshold', sameFaceThreshold],
  ['cullFaceThreshold', cullFaceThreshold],
  ['savePhotoOnDetection', savePhotoOnDetection],
  ['photoWidth', photoWidth],
];

class ConfigBox implements IDashComponent {
  gridItem: any;

  init(grid: any, coors: number[]) {
    this.gridItem = grid.set(...coors, blessed.box, {
      label: 'Config',
      tags: true,
      content: this.getContent(),
      style: {
        border: {
          fg: 'cyan',
        },
      },
    });
  }

  formatLine(id, value) {
    const formattedVal = formatDataType(value);
    return `${id}{|}${formattedVal}`;
  }

  getContent() {
    return configArr.map(([id, value]) => this.formatLine(id, value)).join('\n');
  }
}

export const configBox = new ConfigBox();

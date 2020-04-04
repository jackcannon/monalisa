import blessed from 'blessed';

import { timeSince } from '../../utils/utils';
import { IFace } from '../../interfaces';

import {
  IDashComponent,
  IDashManagerData,
  IDashboardBehaviour,
  IBlessedDispConfig,
} from '../dashboardTypes';
import { dispConfigManager } from '../dispConfigManager';
import { toTags, formatDataType } from '../../utils/dashUtils';

class FaceBoxes implements IDashComponent {
  gridItem: any[];

  init(grid: any, coors: number[]) {
    this.gridItem = [0, 1, 2, 3].map(v => {
      return grid.set(v * coors[0], ...coors.slice(1), blessed.box, {
        label: 'Face ' + (v + 1),
        tags: true,
        style: {
          bold: true,
        },
      });
    });
  }

  format(face: IFace, dispConfig: IBlessedDispConfig) {
    const [startTags, endTags] = toTags('XXX', dispConfig).split('XXX');
    let str = startTags;

    const tickSym = ['      XXX', '     XXX ', 'XXX XXX  ', ' XXXX    ', '  XX     '].join('\n');
    const crossSym = ['XXX   XXX', ' XXX XXX ', '   XXX   ', ' XXX XXX ', 'XXX   XXX'].join('\n');

    if (face) {
      const symbol = face.isEligible ? tickSym : crossSym;

      str += `
{center}${symbol}{/center}
Target: ${formatDataType(face.isTarget)}

First: ${timeSince(face.firstSeen)}
Last: ${timeSince(face.lastSeen)}
Ignored: ${formatDataType(face.isIgnored)}
Targetable: ${formatDataType(face.isTargetable)}
Eligible: ${formatDataType(face.isEligible)}
  `;
    } else {
      str += `
{center}${crossSym}{/center}
  `;
    }
    str += endTags;
    return str;
  }

  updateBehaviour(msg: IDashboardBehaviour, _manager: IDashManagerData) {
    const { faces } = msg;
    this.gridItem.forEach((faceBox, i) => {
      const dispConfig = faces[i]
        ? dispConfigManager.get(faces[i].name)
        : { fg: 'black', bold: true };
      const content = this.format(faces[i], dispConfig);
      faceBox.setLabel(faces[i] ? faces[i].name : 'Face ' + (i + 1));
      faceBox.setContent(content);
      faceBox.style.border = {
        ...dispConfig,
        border: {
          ...dispConfig,
        },
      };
    });
  }
}

export const faceBoxes = new FaceBoxes();

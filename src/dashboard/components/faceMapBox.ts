import blessed from 'blessed';

import { getSymbolsFromAscii, blessedStyleText, toTags } from '../../utils/dashUtils';
import { IPoint } from '../../interfaces';

import {
  IDashComponent,
  IDashManagerData,
  IDashboardBehaviour,
  IBlessedDispConfig,
} from '../dashboardTypes';
import { dispConfigManager } from '../dispConfigManager';

const empty = ' ';
const faceAscii = ['  .---.  ', ' /     \\ ', '|   X   |', ' \\     / ', "  '---'  "];
const faceMarkers = getSymbolsFromAscii(faceAscii);

class FaceMapBox implements IDashComponent {
  gridItem: any;

  width: number;
  height: number;
  space: string[][];

  init(grid: any, coors: number[]) {
    this.gridItem = grid.set(...coors, blessed.box, {
      label: 'Face Map',
      tags: true,
      content: '',
      style: {
        border: {
          fg: 'white',
        },
      },
    });
  }

  limit(val, max) {
    return Math.max(0, Math.min(val, max - 1));
  }
  getCharCoors(point: IPoint): IPoint {
    return {
      x: this.limit(this.width - Math.ceil(this.width * point.x), this.width),
      y: this.limit(Math.floor(this.height * point.y), this.height),
    };
  }

  applyMarkers(
    markers: { x: number; y: number; char: string }[],
    { x, y }: IPoint,
    dispConfig: IBlessedDispConfig,
  ) {
    markers
      .filter(
        ({ x: mX, y: mY }) =>
          this.space[y + mY] && this.space[y + mY][x + mX] && this.space[y + mY][x + mX] === empty,
      )
      .forEach(({ x: mX, y: mY, char }) => {
        const char2 = char === '#' ? ' ' : char;
        const dispChar = toTags(char2, dispConfig);
        this.space[y + mY].splice(x + mX, 1, dispChar);
      });
  }

  updateBehaviour(msg: IDashboardBehaviour, manager: IDashManagerData) {
    const { faces, searchTarget } = msg;
    const detections = manager.detectionRecords[manager.detectionRecords.length - 1];

    this.width = this.gridItem.width - 2;
    this.height = this.gridItem.height - 2;

    this.space = new Array(this.height).fill(1).map(() => new Array(this.width).fill(empty));

    detections.map((detection, i) => {
      const { x, y } = this.getCharCoors(detection);
      const displayString = blessedStyleText('X', 'black', 'white');
      this.space[y].splice(x, 1, displayString);
    });
    faces.map((face, i) => {
      const charCoors = this.getCharCoors(face.point);
      const { x, y } = charCoors;
      const dispConfig = dispConfigManager.get(face.name);
      const displayString = toTags(i + 1, dispConfig);
      this.space[y].splice(x, 1, displayString);

      this.applyMarkers(faceMarkers, charCoors, dispConfig);
    });
    if (searchTarget) {
      const searchAscii = [' .-. ', '| X |', " '-' "];
      const searchMarkers = getSymbolsFromAscii(searchAscii);
      const charCoors = this.getCharCoors(searchTarget);
      const { x, y } = charCoors;
      const displayString = blessedStyleText('X', 'red', null, true);
      this.space[y].splice(x, 1, displayString);

      this.applyMarkers(searchMarkers, charCoors, { fg: 'red', bold: true });
    }
    this.gridItem.setContent(this.space.map(col => col.join('')).join(''));
  }
}

export const faceMapBox = new FaceMapBox();

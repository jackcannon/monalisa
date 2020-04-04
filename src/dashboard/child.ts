import { IFaceRecord } from '../interfaces';

import { lifetimeBox } from './components/lifetimeBox';
import { configBox } from './components/configBox';
import { detectionTimesLine } from './components/detectionTimesLine';
import { faceNumLine } from './components/faceNumLine';
import { faceBoxes } from './components/faceBoxes';
import { faceMapBox } from './components/faceMapBox';
import { stateBoxes } from './components/stateBoxes';

import {
  IDashboardSetup,
  IDashboardDetections,
  IDashboardBehaviour,
  IDashManagerData,
} from './dashboardTypes';

import blessed from 'blessed';
import contrib from 'blessed-contrib';

const dataLength = -100;

const scrn = blessed.screen();
const grid = new contrib.grid({ rows: 12, cols: 12, screen: scrn });

const manager = new (class DashManager implements IDashManagerData {
  startTime: number = Date.now();

  detectionTimes: number[] = [];
  totalRecordCount: number = 0;
  detectionRecords: IFaceRecord[][] = [];

  constructor() {
    lifetimeBox.init(grid, [0, 0, 3, 6]);
    configBox.init(grid, [9, 3, 3, 3]);

    detectionTimesLine.init(grid, [0, 7, 9, 5]);
    faceNumLine.init(grid, [9, 7, 3, 5]);

    faceBoxes.init(grid, [3, 6, 3, 1]);
    faceMapBox.init(grid, [3, 0, 6, 6]);
    stateBoxes.init(grid, [9, 0, 3, 1]);
  }

  tidyData() {
    this.detectionTimes = this.detectionTimes.slice(dataLength);
    this.detectionRecords = this.detectionRecords.slice(dataLength);
  }

  handleIncomingMessage(msg) {
    switch (msg.type) {
      case 'setup':
        return this.setup(msg);
      case 'detections':
        return this.addDetections(msg);
      case 'behaviour':
        return this.updateBehaviour(msg);
    }
  }

  setup(msg: IDashboardSetup) {
    this.startTime = msg.startTime;

    lifetimeBox.start(scrn, this);
  }

  storeDetectionData({ points, delta }: IDashboardDetections) {
    this.totalRecordCount++;
    this.detectionTimes.push(delta);
    this.detectionRecords.push(points);
    this.tidyData();
  }

  addDetections(msg: IDashboardDetections) {
    this.storeDetectionData(msg);

    detectionTimesLine.update(this);
    faceNumLine.update(this);
  }

  updateBehaviour(msg: IDashboardBehaviour) {
    faceMapBox.updateBehaviour(msg, this);
    faceBoxes.updateBehaviour(msg, this);
    stateBoxes.updateBehaviour(msg, this);
  }
})();

process.on('message', msg => manager.handleIncomingMessage(msg));

scrn.render();

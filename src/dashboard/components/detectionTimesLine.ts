import contrib from 'blessed-contrib';

import { IDashComponent, IDashManagerData } from '../dashboardTypes';
import { detectionTimesFormat } from '../../config';
import { SPEED_FORMAT } from '../../interfaces';

class DashDetectionTimesLine implements IDashComponent {
  gridItem: any;

  init(grid: any, coors: number[]) {
    const formatDisp = detectionTimesFormat.toLocaleUpperCase();

    this.gridItem = grid.set(...coors, contrib.line, {
      style: {
        line: 'yellow',
        text: 'yellow',
        baseline: [64, 64, 64],
        border: {
          fg: 'yellow',
        },
      },
      xLabelPadding: 3,
      xPadding: 5,
      showLegend: false,
      numYLabels: 100,
      wholeNumbersOnly: true,
      label: `Camera Detection Times (${formatDisp})`,
    });
  }

  formatLines(times: number[], count: number) {
    const isFPS = detectionTimesFormat === SPEED_FORMAT.FPS;
    const title = isFPS ? 'Detections (Per Second)' : 'Delta Times';

    const y = isFPS ? times.map(dt => 1000 / dt) : times;

    return {
      title,
      x: times.map((_v, i) => (i + count - times.length).toString()),
      y,
    };
  }

  update(manager: IDashManagerData) {
    this.gridItem.setData(this.formatLines(manager.detectionTimes, manager.totalRecordCount));
  }
}

export const detectionTimesLine = new DashDetectionTimesLine();

import contrib from 'blessed-contrib';

import { IDashComponent, IDashManagerData } from '../dashboardTypes';

class DashDetectionTimesLine implements IDashComponent {
  gridItem: any;

  init(grid: any, coors: number[]) {
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
      wholeNumbersOnly: true, //true=do not show fraction in y axis
      label: 'Camera Detection Times',
    });
  }

  formatLines(times: number[], count: number) {
    return {
      title: 'Delta Times',
      x: times.map((_v, i) => (i + count - times.length).toString()),
      y: times,
    };
  }

  update(manager: IDashManagerData) {
    this.gridItem.setData(this.formatLines(manager.detectionTimes, manager.totalRecordCount));
  }
}

export const detectionTimesLine = new DashDetectionTimesLine();

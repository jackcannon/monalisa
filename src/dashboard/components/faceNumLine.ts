import contrib from 'blessed-contrib';

import { IDashComponent, IDashManagerData } from '../dashboardTypes';

class FaceNumLine implements IDashComponent {
  gridItem: any;

  init(grid: any, coors: number[]) {
    this.gridItem = grid.set(...coors, contrib.line, {
      style: {
        line: 'yellow',
        text: 'yellow',
        baseline: [64, 64, 64],
        border: {
          fg: 'brightyellow',
        },
      },
      xLabelPadding: 6,
      xPadding: 5,
      showLegend: false,
      numYLabels: 5,
      wholeNumbersOnly: true, //true=do not show fraction in y axis
      label: 'Faces Seen',
    });
  }

  formatData(records, count: number) {
    return {
      title: 'Faces Seen',
      x: records.map((_v, i) => (i + count - records.length).toString()),
      y: records.map(points => points.length),
    };
  }

  update(manager: IDashManagerData) {
    this.gridItem.setData(this.formatData(manager.detectionRecords, manager.totalRecordCount));
  }
}

export const faceNumLine = new FaceNumLine();

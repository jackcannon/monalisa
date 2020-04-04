import blessed from 'blessed';

import { formatTime } from '../../utils/utils';
import { formatAsciiNumbers } from '../../utils/dashUtils';

import { IDashComponent, IDashManagerData } from '../dashboardTypes';

class LifetimeBox implements IDashComponent {
  gridItem: any;

  screen: any;
  startTime: number;

  init(grid: any, coors: number[]) {
    this.gridItem = grid.set(...coors, blessed.box, {
      tags: true,
      style: {
        bold: true,
        border: {
          fg: 'black',
        },
      },
    });
  }
  start(screen: any, manager: IDashManagerData) {
    this.screen = screen;
    this.startTime = manager.startTime;

    setInterval(() => {
      this.onInterval();
    }, 100);
  }

  onInterval() {
    const now = Date.now();
    const timeAlive = now - this.startTime;
    const timeDisplay = formatTime(timeAlive).replace(/\.[0-9]*$/, '');
    const displayRows = formatAsciiNumbers(timeDisplay);

    let content = "I've been alive for";

    content += '\n'.repeat(Math.max(0, Math.floor((this.gridItem.height - 6) / 2)));

    content += displayRows
      .map(row => `{center}${row}{/center}`)
      .join('\n')
      .replace(/█{1,}/g, match => `{white-bg}${' '.repeat(match.length)}{/white-bg}`);

    this.gridItem.setContent(content);
    this.screen.render();
  }
}

export const lifetimeBox = new LifetimeBox();

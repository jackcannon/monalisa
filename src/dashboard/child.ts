import {
  formatTime,
  formatAsciiNumbers,
  getSymbolsFromAscii,
  blessedStyleText,
  pad,
  timeSince,
} from '../utils/utils';
import {
  savePhotoOnDetection,
  photoWidth,
  moveSpeed,
  dontBlinkDistanceThreshold,
  durationLookingAtEachFace,
  durationBeforeIgnoringFace,
  durationBeforeForgettingFace,
  moveType,
  enableSleeping,
  enableBlinking,
  enableWinking,
  sameFaceThreshold,
  cullFaceThreshold,
} from '../config';
import {
  MOVEMENT_TYPE,
  IPoint,
  IFaceRecord,
  IFace,
  BEHAVIOUR_STATE,
  IBlessedDispConfig,
} from '../interfaces';

import { IDashboardSetup, IDashboardDetections, IDashboardBehaviour } from './dashboardTypes';

const blessed = require('blessed');
const contrib = require('blessed-contrib');

const dataLength = -100;

const dispConfigManager = new (class {
  options: IBlessedDispConfig[] = [
    { fg: 'magenta', bold: true },
    { fg: 'cyan', bold: true },
    { fg: 'yellow', bold: true },
    { fg: 'white', bold: true },
    { fg: 'green', bold: true },
    { fg: 'blue', bold: true },
    { fg: 'magenta', bold: false },
    { fg: 'cyan', bold: false },
    { fg: 'yellow', bold: false },
    { fg: 'white', bold: false },
    { fg: 'green', bold: false },
    { fg: 'blue', bold: false },
  ];
  registry: { [name: string]: IBlessedDispConfig } = {};
  index: number = 0;

  get(name: string) {
    if (!name) {
      return {
        fg: 'black',
        bold: true,
      };
    }
    const reg = this.registry[name];
    if (reg) {
      return reg;
    }
    const newReg = this.options[this.index];
    this.index = (this.index + 1) % this.options.length;
    this.registry[name] = newReg;
    return newReg;
  }
})();

const configArr = [
  ['savePhotoOnDetection', savePhotoOnDetection],
  ['photoWidth', photoWidth],
  ['enableSleeping', enableSleeping],
  ['enableBlinking', enableBlinking],
  ['enableWinking', enableWinking],
  ['moveSpeed - FACE', moveSpeed[MOVEMENT_TYPE.FACE]],
  ['moveSpeed - SEARCH', moveSpeed[MOVEMENT_TYPE.SEARCH]],
  ['moveType - FACE', moveType[MOVEMENT_TYPE.FACE]],
  ['moveType - SEARCH', moveType[MOVEMENT_TYPE.SEARCH]],
  // ['dontBlinkDistanceThreshold', dontBlinkDistanceThreshold],
  ['durationLookingAtEachFace', durationLookingAtEachFace],
  ['durationBeforeIgnoringFace', durationBeforeIgnoringFace],
  ['durationBeforeForgettingFace', durationBeforeForgettingFace],
  ['sameFaceThreshold', sameFaceThreshold],
  ['cullFaceThreshold', cullFaceThreshold],
];

process.on('message', msg => handleIncomingMessage(msg));

const handleIncomingMessage = msg => {
  switch (msg.type) {
    case 'setup':
      setup(msg);
      break;
    // case 'log':
    //   log(msg);
    //   break;
    case 'detections':
      addDetections(msg);
      break;
    case 'behaviour':
      updateBehaviour(msg);
      break;
  }
};

// ADMIN
let startTime = Date.now();
const setup = (msg: IDashboardSetup) => {
  startTime = msg.startTime;
};

const scrn = blessed.screen();
const grid = new contrib.grid({ rows: 12, cols: 12, screen: scrn });

// SETUP GRID
// const dashLog = grid.set(9, 3, 3, 3, contrib.log, {
//   fg: 'brightblue',
//   selectedFg: 'white',
//   label: 'Main Log',
// });
// const log = (msg: IDashboardLog) =>
//   dashLog.log(
//     msg.data
//       .map(arg => {
//         if (typeof arg === 'object') {
//           return JSON.stringify(arg);
//         } else {
//           return arg;
//         }
//       })
//       .join(' '),
//   );

// const debug = (...data) => log({ type: 'log', data });

const detectionLine = grid.set(0, 7, 9, 5, contrib.line, {
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
const faceNumLine = grid.set(9, 7, 3, 5, contrib.line, {
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
const lifetime = grid.set(0, 0, 3, 6, blessed.box, {
  tags: true,
  style: {
    bold: true,
    border: {
      fg: 'black',
    },
  },
});
lifetime.setContent('1234');

const faceBoxes = [0, 1, 2, 3].map(v => {
  return grid.set(v * 3, 6, 3, 1, blessed.box, {
    label: 'Face ' + (v + 1),
    tags: true,
    style: {
      bold: true,
    },
  });
});

const configBox1 = grid.set(9, 3, 3, 3, blessed.box, {
  label: 'Config',
  tags: true,
  content: (() => {
    const formatLine = (id, value) => {
      let color = 'white';
      if (typeof value === 'boolean') {
        color = value ? 'green-fg' : 'red-fg';
      } else if (typeof value === 'string') {
        color = 'blue-fg';
      } else if (typeof value === 'number') {
        color = 'yellow-fg';
      }
      return `${id} {|}{${color}}${value}{/${color}}`;
    };

    return configArr.map(([id, value]) => formatLine(id, value)).join('\n');
  })(),
  style: {
    border: {
      fg: 'cyan',
    },
  },
});

const faceMapBox = grid.set(3, 0, 6, 6, blessed.box, {
  label: 'Face Map',
  tags: true,
  content: '',
  style: {
    border: {
      fg: 'white',
    },
  },
});

const createStateBox = (id, ...pos) => {
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
};
const stateBoxes = {
  [BEHAVIOUR_STATE.AT_TARGET]: createStateBox('AT_TARGET', 9, 0, 3, 1),
  [BEHAVIOUR_STATE.SEARCHING]: createStateBox('SEARCHING', 9, 1, 3, 1),
  [BEHAVIOUR_STATE.SLEEPING]: createStateBox('SLEEPING', 9, 2, 1, 1),
  [BEHAVIOUR_STATE.WAKING_UP]: createStateBox('WAKING_UP', 10, 2, 1, 1),
  [BEHAVIOUR_STATE.AWAKE]: createStateBox('AWAKE', 11, 2, 1, 1),
  get all(): any[][] {
    return [
      ['AT_TARGET', this[BEHAVIOUR_STATE.AT_TARGET]],
      ['SEARCHING', this[BEHAVIOUR_STATE.SEARCHING]],
      ['SLEEPING', this[BEHAVIOUR_STATE.SLEEPING]],
      ['WAKING_UP', this[BEHAVIOUR_STATE.WAKING_UP]],
      ['AWAKE', this[BEHAVIOUR_STATE.AWAKE]],
    ];
  },
};

// FORMAT FUNCTION
const formatDetectionLineData = (times: number[], count: number) => ({
  title: 'Delta Times',
  x: times.map((_v, i) => (i + count - times.length).toString()),
  y: times,
});
const formatFaceNumData = (records, count: number) => ({
  title: 'Faces Seen',
  x: records.map((_v, i) => (i + count - records.length).toString()),
  y: records.map(points => points.length),
});
const formatDataType = value => {
  let color = null;
  if (typeof value === 'boolean') {
    color = value ? 'green-fg' : 'red-fg';
  } else if (typeof value === 'string') {
    color = 'blue-fg';
  } else if (typeof value === 'number') {
    color = 'yellow-fg';
  }
  return color ? `{${color}}${value}{/${color}}` : value;
};
const toTags = (value: any, config: IBlessedDispConfig) => {
  return blessedStyleText(value, config.fg, null, config.bold);
};
const formatFaceContent = (face: IFace, dispConfig: IBlessedDispConfig) => {
  const [startTags, endTags] = toTags('XXX', dispConfig).split('XXX');
  let str = startTags;

  const tickSymbol = ['      XXX', '     XXX ', 'XXX XXX  ', ' XXXX    ', '  XX     '].join('\n');
  const crossSymbol = ['XXX   XXX', ' XXX XXX ', '   XXX   ', ' XXX XXX ', 'XXX   XXX'].join('\n');

  if (face) {
    const symbol = face.isEligible ? tickSymbol : crossSymbol;

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
{center}${crossSymbol}{/center}
`;
  }
  str += endTags;
  return str;
};
const updateFaceBoxes = (faces: IFace[]) => {
  faceBoxes.forEach((faceBox, i) => {
    const dispConfig = faces[i]
      ? dispConfigManager.get(faces[i].name)
      : { fg: 'black', bold: true };
    const content = formatFaceContent(faces[i], dispConfig);
    faceBox.setLabel(faces[i] ? faces[i].name : 'Face ' + (i + 1));
    faceBox.setContent(content);
    faceBox.style.border = {
      ...dispConfig,
      border: {
        ...dispConfig,
      },
    };
  });
};
const updateFaceMapBox = (
  faces: IFace[] = [],
  detections: IFaceRecord[] = [],
  searchTarget: IPoint = null,
) => {
  const width = faceMapBox.width - 2;
  const height = faceMapBox.height - 2;
  const empty = ' ';

  const space = new Array(height).fill(1).map(() => new Array(width).fill(empty));

  const faceAscii = ['  .---.  ', ' /     \\ ', '|   X   |', ' \\     / ', "  '---'  "];
  const faceMarkers = getSymbolsFromAscii(faceAscii);

  const limit = (val, max) => Math.max(0, Math.min(val, max - 1));
  const getCharCoors = (point: IPoint): IPoint => ({
    x: limit(width - Math.ceil(width * point.x), width),
    y: limit(Math.floor(height * point.y), height),
  });
  const applyMarkers = (
    markers: { x: number; y: number; char: string }[],
    { x, y }: IPoint,
    dispConfig: IBlessedDispConfig,
  ) => {
    markers
      .filter(
        ({ x: mX, y: mY }) =>
          space[y + mY] && space[y + mY][x + mX] && space[y + mY][x + mX] === empty,
      )
      .forEach(({ x: mX, y: mY, char }) => {
        const char2 = char === '#' ? ' ' : char;
        const dispChar = toTags(char2, dispConfig);
        space[y + mY].splice(x + mX, 1, dispChar);
      });
  };

  detections.map((detection, i) => {
    const { x, y } = getCharCoors(detection);
    const displayString = blessedStyleText('X', 'black', 'white');
    space[y].splice(x, 1, displayString);
  });
  faces.map((face, i) => {
    const charCoors = getCharCoors(face.point);
    const { x, y } = charCoors;
    const dispConfig = dispConfigManager.get(face.name);
    const displayString = toTags(i + 1, dispConfig);
    space[y].splice(x, 1, displayString);

    applyMarkers(faceMarkers, charCoors, dispConfig);
  });
  if (searchTarget) {
    const searchAscii = [' .-. ', '| X |', " '-' "];
    const searchMarkers = getSymbolsFromAscii(searchAscii);
    const charCoors = getCharCoors(searchTarget);
    const { x, y } = charCoors;
    const displayString = blessedStyleText('X', 'red', null, true);
    space[y].splice(x, 1, displayString);

    applyMarkers(searchMarkers, charCoors, { fg: 'red', bold: true });
  }
  faceMapBox.setContent(space.map(col => col.join('')).join(''));
};

// This is a mess. 3 ifs for AT_TARGET. needs refactor
const updateStateBoxes = (state: string, faces: IFace[]) => {
  let targetName;
  if (state === BEHAVIOUR_STATE.AT_TARGET) {
    const target = faces.find(face => face.isTarget);
    targetName = target ? target.name : '';
  }

  stateBoxes.all.forEach(([id, stateBox]) => {
    let content: string = '';

    if (id === 'AT_TARGET' && targetName !== undefined) {
      const buffer = '\n'.repeat(Math.max(0, Math.floor((stateBox.height - 2 - 3) / 2)));
      content += `${buffer}{center}${id}{/center}`;
      content += `\n\n{center}Target: ${targetName}{/center}`;
    } else {
      const buffer = '\n'.repeat(Math.max(0, Math.floor((stateBox.height - 2 - 1) / 2)));
      content += `${buffer}{center}${id}{/center}`;
    }
    stateBox.setContent(content);
    stateBox.style = {
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
  let dispConfig: IBlessedDispConfig = {
    [BEHAVIOUR_STATE.AT_TARGET]: null,
    [BEHAVIOUR_STATE.SEARCHING]: { fg: 'red', bold: true },
    [BEHAVIOUR_STATE.SLEEPING]: { fg: 'blue', bold: true },
    [BEHAVIOUR_STATE.WAKING_UP]: { fg: 'blue', bold: true },
    [BEHAVIOUR_STATE.AWAKE]: { fg: 'blue', bold: true },
  }[state];

  if (state === BEHAVIOUR_STATE.AT_TARGET) {
    dispConfig = dispConfigManager.get(targetName);
  }

  stateBoxes[state].style = {
    ...dispConfig,
    border: {
      ...dispConfig,
    },
  };
};

// DATA
let detectionTimes = [];
// if (showDashboard) {
//   detectionLine.setData(formatDetectionLineData(detectionTimes, totalDetectionCount));
// }
let totalRecordCount = 0;
let detectionRecords = [];

const tidyData = () => {
  detectionTimes = detectionTimes.slice(dataLength);
  detectionRecords = detectionRecords.slice(dataLength);
};

const addDetections = ({ points, delta }: IDashboardDetections) => {
  totalRecordCount++;
  detectionTimes.push(delta);
  detectionRecords.push(points);
  tidyData();

  detectionLine.setData(formatDetectionLineData(detectionTimes, totalRecordCount));
  faceNumLine.setData(formatFaceNumData(detectionRecords, totalRecordCount));
};

const updateBehaviour = ({ faces, state, time, searchTarget }: IDashboardBehaviour) => {
  faceMapBox.setLabel('' + state + ' ' + (Date.now() - time));

  updateFaceMapBox(faces, detectionRecords[detectionRecords.length - 1], searchTarget);
  updateFaceBoxes(faces);
  updateStateBoxes(state, faces);
};

// RUN
setInterval(() => {
  const now = Date.now();
  const timeAlive = now - startTime;
  const timeDisplay = formatTime(timeAlive).replace(/\.[0-9]*$/, '');
  const displayRows = formatAsciiNumbers(timeDisplay);

  let content = "I've been alive for";

  content += '\n'.repeat(Math.max(0, Math.floor((lifetime.height - 6) / 2)));

  content += displayRows
    .map(row => `{center}${row}{/center}`)
    .join('\n')
    .replace(/█{1,}/g, match => `{white-bg}${' '.repeat(match.length)}{/white-bg}`);

  lifetime.setContent(content);
  scrn.render();
}, 100);

scrn.render();

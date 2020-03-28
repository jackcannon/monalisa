import {
  formatTime,
  formatAsciiNumbers,
  getSymbolsFromAscii,
  blessedStyleText
} from "./utils";
import {
  savePhotoOnDetection,
  photoWidth,
  moveSpeed,
  dontBlinkDistanceThreshold,
  durationLookingAtEachFace,
  durationBeforeForgettingFace,
  randomBlinking,
  lookRandomlyAtSomethingDurationBase,
  lookRandomlyAtSomethingDurationRandom,
  moveType
} from "./config";
import {
  IDashboardSetup,
  IDashboardLog,
  IDashboardRecord,
  IDashboardFaces
} from "./dashboardTypes";
import { MOVEMENT_TYPE } from "./interfaces";

const blessed = require("blessed");
const contrib = require("blessed-contrib");

const dataLength = -100;

const faceColours = [
  "magenta",
  "cyan",
  "yellow",
  "white",
  "red",
  "green",
  "blue"
];

const configArr = [
  ["savePhotoOnDetection", savePhotoOnDetection],
  ["photoWidth", photoWidth],
  ["moveSpeed - FACE", moveSpeed[MOVEMENT_TYPE.FACE]],
  ["moveSpeed - RANDOM", moveSpeed[MOVEMENT_TYPE.RANDOM]],
  ["moveType - FACE", moveType[MOVEMENT_TYPE.FACE]],
  ["moveType - RANDOM", moveType[MOVEMENT_TYPE.RANDOM]],
  ["dontBlinkDistanceThreshold", dontBlinkDistanceThreshold],
  ["durationLookingAtEachFace", durationLookingAtEachFace],
  ["durationBeforeForgettingFace", durationBeforeForgettingFace],
  ["randomBlinking", randomBlinking],
  ["lookRandomlyAtSomethingDurationBase", lookRandomlyAtSomethingDurationBase],
  [
    "lookRandomlyAtSomethingDurationRandom",
    lookRandomlyAtSomethingDurationRandom
  ]
];

process.on("message", msg => handleIncomingMessage(msg));

const handleIncomingMessage = msg => {
  switch (msg.type) {
    case "setup":
      setup(msg);
      break;
    case "log":
      log(msg);
      break;
    case "record":
      addRecord(msg);
      break;
    case "faces":
      updateFaces(msg);
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
const dashLog = grid.set(9, 3, 3, 3, contrib.log, {
  fg: "brightblue",
  selectedFg: "white",
  label: "Main Log"
});
const log = (msg: IDashboardLog) =>
  dashLog.log(
    msg.data
      .map(arg => {
        if (typeof arg === "object") {
          return JSON.stringify(arg);
        } else {
          return arg;
        }
      })
      .join(" ")
  );

const debug = (...data) => log({ type: "log", data });

const detectionLine = grid.set(0, 7, 9, 5, contrib.line, {
  style: {
    line: "yellow",
    text: "yellow",
    baseline: [64, 64, 64],
    border: {
      fg: "yellow"
    }
  },
  xLabelPadding: 3,
  xPadding: 5,
  showLegend: false,
  numYLabels: 100,
  wholeNumbersOnly: true, //true=do not show fraction in y axis
  label: "Camera Detection Times"
});
const faceNumLine = grid.set(9, 7, 3, 5, contrib.line, {
  style: {
    line: "yellow",
    text: "yellow",
    baseline: [64, 64, 64],
    border: {
      fg: "brightyellow"
    }
  },
  xLabelPadding: 6,
  xPadding: 5,
  showLegend: false,
  numYLabels: 5,
  wholeNumbersOnly: true, //true=do not show fraction in y axis
  label: "Faces Seen"
});
const lifetime = grid.set(0, 0, 3, 6, blessed.box, {
  tags: true,
  style: {
    bold: true,
    border: {
      fg: "black"
    }
  }
});
lifetime.setContent("1234");

const faces = [0, 1, 2, 3].map(v => {
  return grid.set(v * 3, 6, 3, 1, blessed.box, {
    label: "Face " + (v + 1),
    tags: true
  });
});

const configBox1 = grid.set(9, 0, 3, 3, blessed.box, {
  label: "Config",
  tags: true,
  content: (() => {
    const formatLine = (id, value) => {
      let color = "white";
      if (typeof value === "boolean") {
        color = value ? "green-fg" : "red-fg";
      } else if (typeof value === "string") {
        color = "blue-fg";
      } else if (typeof value === "number") {
        color = "yellow-fg";
      }
      return `${id} {|}{${color}}${value}{/${color}}`;
    };

    return configArr.map(([id, value]) => formatLine(id, value)).join("\n");
  })(),
  style: {
    border: {
      fg: "brightblue"
    }
  }
});

const faceMapBox = grid.set(3, 0, 6, 6, blessed.box, {
  label: "Face Map",
  tags: true,
  content: "",
  style: {
    border: {
      fg: "white"
    }
  }
});

// FORMAT FUNCTION
const formatDetectionLineData = (times: number[], count: number) => ({
  title: "Delta Times",
  x: times.map((_v, i) => (i + count - times.length).toString()),
  y: times
});
const formatFaceNumData = (records, count: number) => ({
  title: "Faces Seen",
  x: records.map((_v, i) => (i + count - records.length).toString()),
  y: records.map(points => points.length)
});
const formatFaceContent = (points, colour: string) => {
  let str = points ? `{${colour}-fg}` : "{white-fg}";
  if (points) {
    str += `
{center}      XXX{/center}
{center}     XXX {/center}
{center}XXX XXX  {/center}
{center} XXXX    {/center}
{center}  XX     {/center}

X: ${points.x}
Y: ${points.y}
Score: ${points.score}
`;
  } else {
    str += `
{center}XXX   XXX{/center}
{center} XXX XXX {/center}
{center}   XXX   {/center}
{center} XXX XXX {/center}
{center}XXX   XXX{/center}
`;
  }
  str += "{/}";
  return str;
};
const updateFaceBoxes = (records, count) => {
  faces.forEach((face, i) => {
    const colour = faceColours[i % faceColours.length];
    const content = formatFaceContent(records[i], colour);
    face.setContent(content);
    face.style.border = {
      fg: records[i] ? colour : "black"
    };
  });
};
const updateFaceMapBox = (records, count) => {
  const width = faceMapBox.width - 2;
  const height = faceMapBox.height - 2;
  const empty = " ";

  const space = new Array(height)
    .fill(1)
    .map(() => new Array(width).fill(empty));

  // const ascii = [
  //   "  .-----.  ",
  //   " /       \\ ",
  //   "|    X    |",
  //   " \\       / ",
  //   "  '-----'  "
  // ];
  const ascii = [
    "  .---.  ",
    " /     \\ ",
    "|   X   |",
    " \\     / ",
    "  '---'  "
  ];

  const markers = getSymbolsFromAscii(ascii);

  const limit = (val, max) => Math.max(0, Math.min(val, max - 1));
  records.map((face, i) => {
    const x = limit(width - Math.ceil(width * face.x), width);
    const y = limit(Math.floor(height * face.y), height);
    const faceCol = faceColours[i % faceColours.length];
    const displayString = blessedStyleText(i + 1, faceCol);
    space[y].splice(x, 1, displayString);

    markers
      .filter(
        ({ x: mX, y: mY }) =>
          space[y + mY] &&
          space[y + mY][x + mX] &&
          space[y + mY][x + mX] === empty
      )
      .forEach(({ x: mX, y: mY, char }) => {
        const char2 = char === "#" ? " " : char;
        const dispChar = blessedStyleText(char2, faceCol);
        space[y + mY].splice(x + mX, 1, dispChar);
      });
  });
  faceMapBox.setContent(space.map(col => col.join("")).join(""));
};

// DATA

let detectionTimes = [];
// if (showDashboard) {
//   detectionLine.setData(formatDetectionLineData(detectionTimes, totalDetectionCount));
// }
let totalRecordCount = 0;
let faceRecords = [];

const tidyData = () => {
  detectionTimes = detectionTimes.slice(dataLength);
  faceRecords = faceRecords.slice(dataLength);
};

const addRecord = ({ points, delta }: IDashboardRecord) => {
  totalRecordCount++;
  detectionTimes.push(delta);
  faceRecords.push(points);
  tidyData();

  detectionLine.setData(
    formatDetectionLineData(detectionTimes, totalRecordCount)
  );
  faceNumLine.setData(formatFaceNumData(faceRecords, totalRecordCount));
  updateFaceBoxes(points, totalRecordCount);
  // updateFaceMapBox(points, totalRecordCount);

  // scrn.render();
};

const updateFaces = ({ faces, target, time }: IDashboardFaces) => {
  // debug("face time to send:", time, Date.now() - time);
  faceMapBox.setLabel("" + (Date.now() - time));
  const records = faces.map(face => face.point);
  updateFaceMapBox(records, 1);

  // scrn.render();
};

// RUN
setInterval(() => {
  const now = Date.now();
  const timeAlive = now - startTime;
  const timeDisplay = formatTime(timeAlive).replace(/\.[0-9]*$/, "");
  const displayRows = formatAsciiNumbers(timeDisplay);

  let content = "I've been alive for";

  content += "\n".repeat(Math.max(0, Math.floor((lifetime.height - 6) / 2)));

  content += displayRows
    .map(row => `{center}${row}{/center}`)
    .join("\n")
    .replace(
      /█{1,}/g,
      match => `{white-bg}${" ".repeat(match.length)}{/white-bg}`
    );

  lifetime.setContent(content);
  scrn.render();
}, 100);

scrn.render();

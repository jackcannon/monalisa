import { formatTime, formatAsciiNumbers } from "./utils";
import {
  savePhotoOnDetection,
  photoWidth,
  movementSpeed,
  movementSpeedCasual,
  dontBlinkDistanceThreshold,
  durationLookingAtEachFace,
  durationBeforeForgettingFace,
  randomBlinking,
  lookRandomlyAtSomethingDurationBase,
  lookRandomlyAtSomethingDurationRandom
} from "./config";
import {
  IDashboardSetup,
  IDashboardLog,
  IDashboardRecord
} from "./dashboardTypes";

const blessed = require("blessed");
const contrib = require("blessed-contrib");

const dataLength = -100;

const configArr = [
  ["savePhotoOnDetection", savePhotoOnDetection],
  ["photoWidth", photoWidth],
  ["movementSpeed", movementSpeed],
  ["movementSpeedCasual", movementSpeedCasual],
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
const dashLog = grid.set(3, 0, 6, 6, contrib.log, {
  fg: [128, 128, 128],
  selectedFg: [128, 128, 128],
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
  wholeNumbersOnly: true, //true=do not show fraction in y axis
  label: "Faces Seen"
});
const lifetime = grid.set(0, 0, 3, 6, blessed.box, {
  tags: true,
  style: {
    bold: true,
    border: {
      fg: "white"
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

const configBox2 = grid.set(9, 3, 3, 3, blessed.box, {
  label: "---",
  content: "",
  style: {
    border: {
      fg: "blue"
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
const formatFaceContent = points => {
  let str = points ? "{green-fg}" : "{white-fg}";
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
const updateFaceBoxes = (points, count) => {
  faces.forEach((face, i) => {
    const content = formatFaceContent(points[i]);
    face.setContent(content);
    face.style.border = {
      fg: points[i] ? "green" : "black"
    };
  });
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

  scrn.render();
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
    .replace(/█{1,}/g, match => `{white-bg}${match}{/white-bg}`);

  lifetime.setContent(content);
  scrn.render();
}, 100);

scrn.render();

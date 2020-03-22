import { parentPort } from "worker_threads";
import { IEyeConfig } from "./interfaces";

parentPort.on("message", msg => {
  switch (msg.type) {
    case "setup":
      setup();
      break;
    case "reset":
      reset();
      break;
    case "start":
      start();
      break;
    case "drawFrame":
      drawFrame(msg.eyes, msg.waiting);
      break;
  }
});

export const setup = () => {
  screen = getFreshScreen();
  previousScreen = getFreshScreen();
  // start();
  parentPort.postMessage({ type: "setup-complete" });
};

export const reset = () => {
  clearDisplay();
  updateChangedPixels();
};

const getLinePixels = (x0, y0, x1, y1, color) => {
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;

  let err = (dx > dy ? dx : -dy) / 2;

  const output = [];

  while (true) {
    output.push([x0, y0, color]);

    if (x0 === x1 && y0 === y1) break;

    const e2 = err;

    if (e2 > -dx) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dy) {
      err += dx;
      y0 += sy;
    }
  }

  return output;
};

const getRectPixels = (x, y, w, h, color) => {
  let pixels = [];
  pixels = pixels.concat(getLinePixels(x, y, x + w, y, color));
  pixels = pixels.concat(getLinePixels(x, y + 1, x, y + h - 1, color));
  pixels = pixels.concat(getLinePixels(x + w, y + 1, x + w, y + h - 1, color));
  pixels = pixels.concat(getLinePixels(x, y + h - 1, x + w, y + h - 1, color));
  return pixels;
};

const getCirclePixels = (x0, y0, r, color) => {
  let f = 1 - r;
  let ddF_x = 1;
  let ddF_y = -2 * r;
  let x = 0;
  let y = r;

  let output = [
    [x0, y0 + r, color],
    [x0, y0 - r, color],
    [x0 + r, y0, color],
    [x0 - r, y0, color]
  ];

  while (x < y) {
    if (f >= 0) {
      y--;
      ddF_y += 2;
      f += ddF_y;
    }
    x++;
    ddF_x += 2;
    f += ddF_x;

    output.push(
      ...[
        [x0 + x, y0 + y, color],
        [x0 - x, y0 + y, color],
        [x0 + x, y0 - y, color],
        [x0 - x, y0 - y, color],
        [x0 + y, y0 + x, color],
        [x0 - y, y0 + x, color],
        [x0 + y, y0 - x, color],
        [x0 - y, y0 - x, color]
      ]
    );
  }
  return output;
};

const getEllipsePixels = (x0, y0, width, height, color, progression = 6) => {
  const pixels = [];
  let xlast = -1;
  let ylast = -1;
  let ellipseX;
  let ellipseY;
  for (var angle = 0; angle <= 720; angle += progression) {
    ellipseX = Math.floor(
      x0 + width * Math.cos(angle * 2 * (Math.PI / 720)) + 0.5
    );
    ellipseY = Math.floor(
      y0 + height * Math.sin(angle * 2 * (Math.PI / 720)) + 0.5
    );
    if (xlast != ellipseX || ylast != ellipseY) {
      xlast = ellipseX;
      ylast = ellipseY;
      // document.write("<div style='position:absolute;left:"+x+"px;top:"+y+"px'><IMG SRC='3x3.gif' WIDTH=3 HEIGHT=3 BORDER=0></div>");
      pixels.push([ellipseX, ellipseY, color]);
    }
  }
  return pixels;
};

const drawLine = (x0, y0, x1, y1, color) => {
  addPixels(getLinePixels(x0, y0, x1, y1, color));
};

const drawCircle = (x0, y0, r, color) => {
  addPixels(getCirclePixels(x0, y0, r, color));
};

const drawEllipse = (x0, y0, width, height, color, progression) => {
  addPixels(getEllipsePixels(x0, y0, width, height, color, progression));
};

const fill = (outline, color) => {
  const lines = getHorizonalLinesOfCircle(outline);
  const pixels = outline.concat(
    lines
      .map(line =>
        getLinePixels(line[0][0], line[0][1], line[1][0], line[1][1], color)
      )
      .reduce((acc, b) => acc.concat(b))
  );
  addPixels(pixels);
};

const fillShading = (
  arrOfLines,
  shadingAmount = 2,
  inverseDirection = false,
  offset = 0
) => {
  const pixels = arrOfLines
    .map(line => {
      const row = getLinePixels(
        line[0][0],
        line[0][1],
        line[1][0],
        line[1][1],
        0
      );
      row.forEach(pixel => {
        const combined = inverseDirection
          ? -pixel[0] + pixel[1]
          : pixel[0] + pixel[1];
        pixel[2] = Number((combined + offset) % shadingAmount === 0);
      });
      return row;
    })
    .reduce((acc, b) => acc.concat(b), []);
  addPixels(pixels);
};

const fillCircle = (x0, y0, r, color) => {
  fill(getCirclePixels(x0, y0, r, color), color);
};
const fillEllipse = (x0, y0, width, height, color, progression) => {
  fill(getEllipsePixels(x0, y0, width, height, color, progression), color);
};
const fillRect = (x, y, w, h, color) => {
  fill(getRectPixels(x, y, w, h, color), color);
};

const getHorizonalLinesOfCircle = circle => {
  const rows = circle
    .reduce((acc, pixel) => {
      if (!acc[pixel[1]]) {
        acc[pixel[1]] = [];
      }
      acc[pixel[1]].push(pixel);
      return acc;
    }, [])
    .filter(row => row.length)
    .slice(1, -1)
    .map(row => row.sort((a, b) => a[0] - b[0]));

  return rows.map(row => {
    const centre = Math.round(
      row.reduce((acc, pixel) => acc + pixel[0], 0) / row.length
    );
    const limit = [
      row.filter(pixel => pixel[0] < centre).reverse()[0],
      row.filter(pixel => pixel[0] > centre)[0]
    ];
    return [
      [limit[0][0] + 1, limit[0][1], limit[0][3]],
      [limit[1][0] - 1, limit[1][1], limit[1][3]]
    ];
  });
};

// eyelids = percentage the eyes are closed
const drawEyes = (eyes: IEyeConfig[], waiting: boolean = false) => {
  const eyeMoveXDistance = 16; // maximum distance an eye is allow to move on X

  const midpoint = [64, 32];
  const distance = Math.round(32 * 0.6);
  const width = Math.round(32 * 0.7);
  const height = Math.round(32 * 0.9);
  const pupilMoveXDistance = Math.round(width * 0.7); // maximum distance a pupil is allow to move on X
  const pupilMoveYDistance = Math.round(width * 0.6); // maximum distance a pupil is allow to move on Y

  const eyeOffset = Math.round(distance / 2) + width;
  const eyePositions = [
    { x: midpoint[0] - eyeOffset, y: midpoint[1] },
    { x: midpoint[0] + eyeOffset, y: midpoint[1] }
  ];

  eyes.forEach((eye: IEyeConfig, eyeIndex: number) => {
    const eyePos = eyePositions[eyeIndex];
    const outer = getEllipsePixels(eyePos.x, eyePos.y, width, height, 1, 4);
    const horLines = getHorizonalLinesOfCircle(outer);

    // outer line
    addPixels(outer);

    if (waiting) {
      // waiting symbol
      const pupilPosX = Math.round(eyePos.x);
      const pupilPosY = Math.round(eyePos.y + width * 0.1);
      const waitWidth = 9;
      const waitHeight = 13;

      const leftX = Math.floor(pupilPosX - waitWidth / 2);
      const rightX = Math.ceil(pupilPosX + waitWidth / 2);
      const topY = Math.floor(pupilPosY - waitHeight / 2);
      const bottomY = Math.ceil(pupilPosY + waitHeight / 2);

      // Top
      drawLine(leftX, topY, rightX, topY, 1);

      const topWaitOutline = [
        ...getLinePixels(leftX, topY, leftX, topY + 2, 1),
        ...getLinePixels(rightX, topY, rightX, topY + 2, 1),
        ...getLinePixels(leftX, topY + 2, pupilPosX, pupilPosY, 1),
        ...getLinePixels(rightX, topY + 2, pupilPosX, pupilPosY, 1)
      ];
      addPixels(topWaitOutline);
      fillShading(getHorizonalLinesOfCircle(topWaitOutline), 2, !eyeIndex);
      drawLine(leftX + 1, topY + 1, rightX - 1, topY + 1, 0);
      drawLine(leftX + 1, topY + 2, rightX - 1, topY + 2, 0);

      // Bottom
      drawLine(leftX, bottomY, rightX, bottomY, 1);

      const bottomWaitOutline = [
        ...getLinePixels(leftX, bottomY, leftX, bottomY - 2, 1),
        ...getLinePixels(rightX, bottomY, rightX, bottomY - 2, 1),
        ...getLinePixels(leftX, bottomY - 2, pupilPosX, pupilPosY, 1),
        ...getLinePixels(rightX, bottomY - 2, pupilPosX, pupilPosY, 1)
      ];
      addPixels(bottomWaitOutline);
      const bottomShading = [
        ...getLinePixels(leftX + 1, bottomY, leftX + 1, bottomY - 3, 1),
        ...getLinePixels(rightX - 1, bottomY, rightX - 1, bottomY - 3, 1)
      ];
      fillShading(getHorizonalLinesOfCircle(bottomShading), 2, !eyeIndex, 1);
    } else {
      // pupil
      const pupilPosX = eyePos.x + Math.round(eye.x * pupilMoveXDistance);
      const pupilPosY =
        Math.round(eyePos.y + width * 0.1) +
        Math.round(eye.y * pupilMoveYDistance);
      // fillCircle(...pupilPos, Math.round(width * 0.2), 1);
      const pupilBorder = getCirclePixels(
        pupilPosX,
        pupilPosY,
        Math.round(width * 0.25),
        1
      );
      const pupilPixels = getHorizonalLinesOfCircle(pupilBorder);
      fillShading(pupilPixels, 5, !eyeIndex);
      addPixels(pupilBorder);
      // const glint = [pupilPos[0] + Math.round(width * 0.1), pupilPos[1] - Math.round(width * 0.1)];
      // drawPixel(...glint, false);
      // drawPixel(glint[0] - 1, glint[1] - 1, false);
    }

    // eyelids
    const lidLineIndex = Math.min(
      Math.round(horLines.length * (eye.eyelid / 100)),
      horLines.length - 1
    );
    const lidLine = horLines[lidLineIndex];
    const lidLines = horLines.slice(0, lidLineIndex);
    // lidLines.forEach((line) => drawLine(line[0][0], line[0][1], line[1][0], line[1][1], 0));
    fillShading(lidLines, 6, !eyeIndex);
    drawLine(lidLine[0][0], lidLine[0][1], lidLine[1][0], lidLine[1][1], 1);

    // cheek
    if (eye.cheek) {
      const cheekOutline = getEllipsePixels(
        eyePos.x,
        eyePos.y + height * 1.75,
        width * 1.2,
        height,
        1,
        4
      );
      addPixels(cheekOutline);
      fill(cheekOutline, 0);
      fillRect(64 * eyeIndex, 64 - 5, 64, 64, 0);
    }

    // brow
    if (eye.brow) {
      const browOutline = getEllipsePixels(
        eyePos.x,
        eyePos.y - height * 1.7,
        width * 1.35,
        height,
        1,
        4
      );
      addPixels(browOutline);
      fill(browOutline, 0);
      fillRect(64 * eyeIndex, 0, 64, 6, 0);
    }
  });
};
const clearDisplay = () => {
  fillRect(0, 0, 128, 64, 0);
};

// Eye config tools
const areEyesDifferent = (a: IEyeConfig[], b: IEyeConfig[]) => {
  if (!a || !b || !a.length || !b.length || a.length !== b.length) return true;

  return (
    a.filter((eyeA, i) => {
      let eyeB = b[i];
      return (
        Object.keys(eyeA).filter(key => eyeA[key] !== eyeB[key]).length !== 0
      );
    }).length !== 0
  );
};

const makeEyeSafe = (eye: IEyeConfig) => {
  eye = getDefaultEye(eye);
  eye.x = Math.round(eye.x);
  eye.y = Math.round(eye.y);
  eye.eyelid = Math.round(eye.eyelid);
  return eye;
};

const getDefaultEye = (overwrite: IEyeConfig = {}): IEyeConfig => ({
  x: 0,
  y: 0,
  eyelid: 25,
  brow: false,
  cheek: false,
  ...overwrite
});

// Pixel management

const getFreshScreen = () => {
  return new Array(128).fill(1).map(() => new Array(64).fill(0));
};
const updateChangedPixels = (): boolean => {
  const changed = [];

  screen.forEach((inner, x) => {
    inner.forEach((color, y) => {
      if (previousScreen[x][y] !== color) {
        changed.push([x, y, color]);
      }
    });
  });

  // console.log("# of pixels changed:", changed.length);
  const hasAnythingChanged: boolean = changed.length > 0;

  if (hasAnythingChanged) {
    parentPort.postMessage({
      type: "changedPixels",
      changed
    });
  }

  previousScreen = screen;
  screen = getFreshScreen();

  return hasAnythingChanged;
};

const addPixels = newPixels => {
  const filtered = newPixels.filter(
    ([x, y]) => x >= 0 && x < 128 && y >= 0 && y < 64
  );
  // console.log('adding', filtered.length, 'pixels');
  filtered.forEach(([x, y, color]) => (screen[x][y] = color));
};

const printScreen = screen => {
  for (let x = 0; x < 128; x++) {
    let str = "";
    for (let y = 0; y < 64; y++) {
      str += "" + screen[x][y];
    }
    // console.log(str);
  }
};

// Main controls
let loop = 0;
let lastDrawn: number = 0;
let lastChanged: number = 0;
let previousEyes = [];

let screen: any[][] = [[]];
let previousScreen = [];

export const start = () => {
  drawFrame(undefined, true);
};

export const drawFrame = (
  eyes: IEyeConfig[] = [getDefaultEye(), getDefaultEye()],
  waiting: boolean = false
) => {
  const now = Date.now();

  eyes = eyes.map(makeEyeSafe);
  if (
    (waiting || areEyesDifferent(previousEyes, eyes)) &&
    now - lastChanged > 1000
  ) {
    // Set the pixels
    clearDisplay();
    drawEyes(eyes, waiting);

    // Draw what changed
    const haveAnyPixelsChanged = updateChangedPixels();

    if (!waiting && haveAnyPixelsChanged) {
      // Carry the state over for next iteration
      previousEyes = eyes;
      lastChanged = now;
    }
  }

  lastDrawn = now;
  loop++;
};

parentPort.postMessage({ type: "init" });

import * as five from 'johnny-five';
const OLED = require('oled-js');

let oled;

export const setup = (board) => {
  const opts = {
    width: 128,
    height: 64,
    address: 0x3C
  };

  oled = new OLED(board, five, opts);
  screen = getFreshScreen();
  previousScreen = getFreshScreen();
  // start();
}

export const reset = () => {
  clearDisplay();
  // fillRect(0, 0, 128, 64, 1);
  updateChangedPixels();
};



const getLinePixels = (x0, y0, x1, y1, color) => {
  const dx = Math.abs(x1 - x0)
  const sx = x0 < x1 ? 1 : -1
  const dy = Math.abs(y1 - y0)
  const sy = y0 < y1 ? 1 : -1

  let err = (dx > dy ? dx : -dy) / 2

  const output = [];

  while (true) {
    output.push([x0, y0, color]);

    if (x0 === x1 && y0 === y1) break

    const e2 = err

    if (e2 > -dx) { err -= dy; x0 += sx }
    if (e2 < dy) { err += dx; y0 += sy }
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
  let f = 1 - r
  let ddF_x = 1
  let ddF_y = -2 * r
  let x = 0
  let y = r

  let output = [
    [x0, y0 + r, color],
    [x0, y0 - r, color],
    [x0 + r, y0, color],
    [x0 - r, y0, color]
  ]

  while (x < y) {
    if (f >= 0) {
      y--
      ddF_y += 2
      f += ddF_y
    }
    x++
    ddF_x += 2
    f += ddF_x

    output.push(...[
      [x0 + x, y0 + y, color],
      [x0 - x, y0 + y, color],
      [x0 + x, y0 - y, color],
      [x0 - x, y0 - y, color],
      [x0 + y, y0 + x, color],
      [x0 - y, y0 + x, color],
      [x0 + y, y0 - x, color],
      [x0 - y, y0 - x, color]
    ]);
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
    ellipseX = Math.floor(x0 + (width * Math.cos(angle * 2 * (Math.PI / 720))) + 0.5);
    ellipseY = Math.floor(y0 + (height * Math.sin(angle * 2 * (Math.PI / 720))) + 0.5);
    if (xlast != ellipseX || ylast != ellipseY){
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
  const pixels = outline.concat(lines
    .map((line) => getLinePixels(line[0][0], line[0][1], line[1][0], line[1][1], color))
    .reduce((acc, b) => acc.concat(b)));
  addPixels(pixels);
};

const fillShading = (arrOfLines, shadingAmount = 2, inverseDirection = false, offset = 0) => {
  const pixels = arrOfLines.map((line) => {
    const row = getLinePixels(line[0][0], line[0][1], line[1][0], line[1][1], 0);
    row.forEach((pixel) => {
      const combined = (inverseDirection) ? (-pixel[0] + pixel[1]) : (pixel[0] + pixel[1]);
      pixel[2] = Number(((combined + offset) % shadingAmount) === 0);
    });
    return row;
  }).reduce((acc, b) => acc.concat(b), []);
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




const getHorizonalLinesOfCircle = (circle) => {
  const rows = circle
    .reduce((acc, pixel) => {
      if (!acc[pixel[1]]) {
        acc[pixel[1]] = []
      }
      acc[pixel[1]].push(pixel);
      return acc;
    }, [])
    .filter((row) => row.length)
    .slice(1, -1)
    .map((row) => row.sort((a, b) => a[0] - b[0]));

  return rows.map((row) => {
    const centre = Math.round(row.reduce((acc, pixel) => acc + pixel[0], 0) / row.length);
    const limit = [
      row.filter((pixel) => pixel[0] < centre).reverse()[0],
      row.filter((pixel) => pixel[0] > centre)[0]
    ];
    return [
      [limit[0][0] + 1, limit[0][1], limit[0][3]],
      [limit[1][0] - 1, limit[1][1], limit[1][3]]
    ]
  });
};

// eyelids = percentage the eyes are closed
const drawEyes = (lookX = 0, lookY = 0, eyelidA = 10, eyelidB = eyelidA) => {
  const eyelids = [eyelidA, eyelidB];
  const eyeMoveXDistance = 16; // maximum distance an eye is allow to move on X

  const pivotPoint = 100; // at what stage do we stop moving the pupils and start moving the eyes
  const direction = lookX / Math.abs(lookX);
  let eyeMoveX = (Math.abs(lookX) <= pivotPoint) ? 0 : (Math.max(Math.abs(lookX) - pivotPoint, 0) / (100 - pivotPoint)) * direction;
  let pupilMoveX = Math.min(Math.max(lookX / pivotPoint, -1), 1);
  let pupilMoveY = lookY / 100;

  if (Number.isNaN(eyeMoveX)) eyeMoveX = 0;
  if (Number.isNaN(pupilMoveX)) pupilMoveX = 0;
  if (Number.isNaN(pupilMoveY)) pupilMoveY = 0;

  const midpoint = [64 + Math.round(eyeMoveX * eyeMoveXDistance), 32];
  const distance = Math.round(32 * 0.6);
  const width = Math.round(32 * 0.7);
  const height = Math.round(32 * 0.9);
  const pupilMoveXDistance = Math.round(width * 0.7); // maximum distance a pupil is allow to move on X
  const pupilMoveYDistance = Math.round(width * 0.6); // maximum distance a pupil is allow to move on Y


  const eyeOffset = Math.round((distance) / 2) + width;
  const eyePos = [
    [midpoint[0] - eyeOffset, midpoint[1]],
    [midpoint[0] + eyeOffset, midpoint[1]],
  ];

  eyePos.forEach((eye, eyeIndex) => {
    const outer = getEllipsePixels(eye[0], eye[1], width, height, 1, 4);
    const horLines = getHorizonalLinesOfCircle(outer);

    // outer line
    addPixels(outer);

    // pupil
    const pupilPosX = eye[0] + Math.round(pupilMoveX * pupilMoveXDistance)
    const pupilPosY = Math.round(eye[1] + (width * 0.1)) + Math.round(pupilMoveY * pupilMoveYDistance);
    // fillCircle(...pupilPos, Math.round(width * 0.2), 1);
    const pupilBorder = getCirclePixels(pupilPosX, pupilPosY, Math.round(width * 0.25), 1);
    const pupilPixels = getHorizonalLinesOfCircle(pupilBorder);
    fillShading(pupilPixels, 5, !eyeIndex);
    addPixels(pupilBorder);
    // const glint = [pupilPos[0] + Math.round(width * 0.1), pupilPos[1] - Math.round(width * 0.1)];
    // drawPixel(...glint, false);
    // drawPixel(glint[0] - 1, glint[1] - 1, false);

    // eyelids
    const lidLineIndex = Math.min(Math.round(horLines.length * (eyelids[eyeIndex] / 100)), horLines.length - 1);
    const lidLine = horLines[lidLineIndex];
    const lidLines = horLines.slice(0, lidLineIndex);
    // lidLines.forEach((line) => drawLine(line[0][0], line[0][1], line[1][0], line[1][1], 0));
    fillShading(lidLines, 6, !eyeIndex);
    drawLine(lidLine[0][0], lidLine[0][1], lidLine[1][0], lidLine[1][1], 1);

    const isWinking = eyelids[0] !== eyelids[1] && eyelids[eyeIndex] > eyelids[Number(!eyeIndex)];
    // const isWinking = eyeIndex;
    if (isWinking) {
      // cheek
      const cheekOutline = getEllipsePixels(eye[0], eye[1] + (height * 1.75), width * 1.2, height, 1, 4);
      addPixels(cheekOutline);
      fill(cheekOutline, 0);
      fillRect(64 * eyeIndex, 64 - 5, 64, 64, 0);

      // brow
      const browOutline = getEllipsePixels(eye[0], eye[1] - (height * 1.7), width * 1.35, height, 1, 4);
      addPixels(browOutline);
      fill(browOutline, 0);
      fillRect(64 * eyeIndex, 0, 64, 6, 0);
    }
  })
};

const blink = {
  isBlinking: false,
  isGoingDown: true,
  startHeight: 25,
  current: 25,
  // speed: 7.5,
  // speed: 4,
  speed: 75,
  frequency: 15,
  blinksInARow: 0
};
const getBlinkValue = (loop) => {
  if (blink.isBlinking && !blink.isGoingDown && blink.current <= blink.startHeight) {
    // const isDoubleBlink = Math.floor(loop / blink.frequency) % 5 === 0 && blink.blinksInARow < 1;
    const isDoubleBlink = false;
    if (isDoubleBlink) {
      blink.isBlinking = true;
      blink.blinksInARow++;
    } else {
      blink.isBlinking = false;
      blink.blinksInARow = 0;
    }
    blink.isGoingDown = true;
    blink.current = 25;
  }
  if (!blink.isBlinking && Math.floor(loop + (blink.frequency * 0.5)) % blink.frequency === 0) {
    blink.isBlinking = true;
  }

  if (blink.isBlinking) {
    if (blink.isGoingDown) {
      blink.current += blink.speed;
    } else {
      blink.current -= blink.speed;
    }
    blink.current = Math.max(blink.current, 0);
    if (blink.current > 100) {
      blink.current = Math.max(100 - (blink.current - 100), 0);
      blink.isGoingDown = false;
    }
  }

  return [blink.current, blink.current];
};

const look = {
  x: -100,
  y: 100,
  movingX: 1,
  movingY: -1.5,
  position: 0,
  speed: 1 / 8,
};
const getLookValues = ():number[] => {
  look.position += look.speed;
  look.position = look.position % 1;

  const radius = 100;
  look.x = 0 + Math.sin(look.position * 2 * Math.PI) * radius;
  look.y = 0 - Math.cos(look.position * 2 * Math.PI) * radius;

  return [look.x, look.y];
};

const areValuesDifferent = (a, b) => {
  if (a.length !== b.length) return true;
  return a.filter((v, i) => v !== b[i]).length !== 0;
};

const clearDisplay = () => {
  fillRect(0, 0, 128, 64, 0);
};


// Pixel management

const getFreshScreen = () => {
  return new Array(128).fill(1)
    .map(() => new Array(64).fill(0));
};


const updateChangedPixels = () => {
  const changed = [];

  screen.forEach((inner, x) => {
    inner.forEach((color, y) => {
      if (previousScreen[x][y] !== color) {
        changed.push([x, y, color]);
      }
    });
  });

  console.log('# of pixels changed:', changed.length);

  oled.drawPixel(changed, false);
  oled.update();

  previousScreen = screen;
  screen = getFreshScreen();
};

const addPixels = (newPixels) => {
  const filtered = newPixels.filter(([x, y]) => x >= 0 && x < 128 && y >= 0 && y < 64);
  // console.log('adding', filtered.length, 'pixels');
  filtered.forEach(([x, y, color]) => screen[x][y] = color);
};

const printScreen = (screen) => {
  for(let x = 0; x < 128; x++) {
    let str = '';
    for(let y = 0; y < 64; y++) {
      str += '' + screen[x][y];
    }
    console.log(str);
  }
};



// Main controls
let loop = 0;
let previousValues = [];

let screen:any[][] = [[]];
let previousScreen = [];

export const start = () => {
  drawFrame();
};

export const drawFrame = () => {
  // const values = [...getLookValues(), ...getBlinkValue(loop)];
  const values = [0, 0, ...getBlinkValue(loop)];


  if (areValuesDifferent(previousValues, values)) {
    console.log('eyes blink', loop);

    // Set the pixels
    clearDisplay();
    drawEyes(...values);

    // Draw what changed
    updateChangedPixels();

    // Carry the state over for next iteration
    previousValues = values;
  }

  loop++;
  // timer = setTimeout(() => drawFrame(), 2000);
};

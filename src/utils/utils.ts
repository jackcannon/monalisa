import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

export const createTimer = name => {
  const start = Date.now();
  let last = Date.now();

  return function(...args) {
    const now = Date.now();
    const diff = now - last;
    last = now;
    return diff;
  };
};

export const delay = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

export const since = (time: number) => Date.now() - time;

export const toFixed = (num, decimalPlaces = 3) =>
  Math.round(num * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);

export const padLeft = (num: number, places: number = 3) =>
  (Math.pow(10, places) + '' + num).substr(-places);

export const pad = (value: any, length: number = 3, char: string = ' ', after: boolean = false) => {
  let str: any = '';
  if (typeof value === 'number') {
    str = toFixed(value, length - (value.toString().split('.')[0].length + 1));
  } else if (value !== null && value !== undefined) {
    str = value.toString();
  }
  const buffer = char.repeat(length - str.length);
  return after ? str + buffer : buffer + str;
};

export const formatTime = (ms: number) => new Date(ms).toISOString().substr(11, 12);

export const timeSince = (since: number) => {
  const now = Date.now();
  const diff = now - since;
  if (diff >= 1000) {
    const secs = Math.floor(diff / 1000);

    let str = '';
    if (secs > 60) {
      const mins = Math.floor(secs / 60);
      str += `${mins}m `;
    }

    str += `${secs % 60}s ago`;
    return str;
  } else {
    return `${diff}ms ago`;
  }
};

export const distanceBetweenPoints = (pointA, pointB): number => {
  const distanceX = Math.abs(pointA.x - pointB.x);
  const distanceY = Math.abs(pointA.y - pointB.y);
  return Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
};

export const randomID = () => 1000000 + Math.floor(Math.random() * 9000000);

export const getPromise = (subject: Subject<any>): Promise<any> =>
  subject.pipe(first(item => !!item)).toPromise();

export const blessedStyleText = (text: any, fg?: string, bg?: string, bold?: boolean) => {
  let result = text;
  if (fg) {
    result = `{${fg}-fg}${result}{/${fg}-fg}`;
  }
  if (bg) {
    result = `{${bg}-bg}${result}{/${bg}-bg}`;
  }
  if (bold) {
    result = `{bold}${result}{/bold}`;
  }
  return result;
};

export const formatAsciiNumbers = (str: string): string[] => {
  const chars = {
    '0': ['  ███  ', '██   ██', '██   ██', '██   ██', '  ███  '],
    '1': ['   ██  ', '  ███  ', '   ██  ', '   ██  ', '███████'],
    '2': ['  ███  ', '██   ██', '    ███', '  ██   ', '███████'],
    '3': ['  ███  ', '██   ██', '    ██ ', '██   ██', '  ███  '],
    '4': ['██  ██ ', '██  ██ ', '███████', '    ██ ', '    ██ '],
    '5': ['███████', '██     ', '██████ ', '     ██', '██████ '],
    '6': ['  ████ ', '██     ', '██████ ', '██   ██', '  ████ '],
    '7': ['███████', '    ██ ', '  ██   ', ' ██    ', '██     '],
    '8': [' █████ ', '██   ██', ' █████ ', '██   ██', ' █████ '],
    '9': ['  ████ ', '██   ██', ' ██████', '     ██', '  ████ '],
    ':': ['  ██  ', '  ██  ', '      ', '  ██  ', '  ██  '],
    '.': ['      ', '      ', '      ', '  ██  ', '  ██  '],
  };

  return [0, 1, 2, 3, 4].map(row =>
    str
      .split('')
      .map(char => chars[char][row])
      .join('  '),
  );
};

// Used to generate symbol lists for faceMapBox display
export const getSymbolsFromAscii = (
  ascii: string[],
  empty = ' ',
): { x: number; y: number; char: string }[] => {
  let centre = { x: 0, y: 0 };
  let symbols = [];
  ascii.forEach((row, y) =>
    row.split('').forEach((char, x) => {
      if (char === 'X') {
        centre = { x, y };
      } else if (char !== empty) {
        symbols.push({ x, y, char });
      }
    }),
  );
  return symbols.map(({ x, y, char }) => ({
    x: x - centre.x,
    y: y - centre.y,
    char,
  }));
};

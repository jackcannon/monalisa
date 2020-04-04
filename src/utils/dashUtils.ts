import { IBlessedDispConfig } from '../dashboard/dashboardTypes';

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

export const formatDataType = value => {
  let dispConfig = null;
  if (value instanceof Array) {
    dispConfig = { fg: 'white', bold: false };
    value = value.map(formatDataType).join(' / ');
  } else if (typeof value === 'boolean') {
    const fg = value ? 'green' : 'red';
    dispConfig = { fg, bold: true };
  } else if (typeof value === 'string') {
    dispConfig = { fg: 'blue', bold: true };
  } else if (typeof value === 'number') {
    dispConfig = { fg: 'yellow', bold: false };
  }
  return dispConfig ? toTags(value, dispConfig) : value;
};

export const toTags = (value: any, config: IBlessedDispConfig) => {
  return blessedStyleText(value, config.fg, null, config.bold);
};

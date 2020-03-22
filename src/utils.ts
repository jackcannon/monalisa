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

export const toFixed = (num, decimalPlaces = 3) =>
  Math.round(num * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);

export const padLeft = (num: number, places: number = 3) =>
  (Math.pow(10, places) + "" + num).substr(-places);

export const formatTime = (ms: number) =>
  new Date(ms).toISOString().substr(11, 12);

export const distanceBetweenPoints = (pointA, pointB): number => {
  const distanceX = Math.abs(pointA.x - pointB.x);
  const distanceY = Math.abs(pointA.y - pointB.y);
  return Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
};

export const randomID = () => 1000000 + Math.floor(Math.random() * 9000000);

export const formatAsciiNumbers = (str: string): string[] => {
  const chars = {
    "0": ["  ███  ", "██   ██", "██   ██", "██   ██", "  ███  "],
    "1": ["   ██  ", "  ███  ", "   ██  ", "   ██  ", "███████"],
    "2": ["  ███  ", "██   ██", "    ███", "  ██   ", "███████"],
    "3": ["  ███  ", "██   ██", "    ██ ", "██   ██", "  ███  "],
    "4": ["██  ██ ", "██  ██ ", "███████", "    ██ ", "    ██ "],
    "5": ["███████", "██     ", "██████ ", "     ██", "██████ "],
    "6": ["  ████ ", "██     ", "██████ ", "██   ██", "  ████ "],
    "7": ["███████", "    ██ ", "  ██   ", " ██    ", "██     "],
    "8": [" █████ ", "██   ██", " █████ ", "██   ██", " █████ "],
    "9": ["  ████ ", "██   ██", " ██████", "     ██", "  ████ "],
    ":": ["  ██  ", "  ██  ", "      ", "  ██  ", "  ██  "],
    ".": ["      ", "      ", "      ", "  ██  ", "  ██  "]
  };

  return [0, 1, 2, 3, 4].map(row =>
    str
      .split("")
      .map(char => chars[char][row])
      .join("  ")
  );
};

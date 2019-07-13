export const createTimer = (name) => {
  const start = Date.now();
  let last = Date.now();

  return function log(...args) {
    const now = Date.now();
    const diff = now - last;
    last = now;
    console.log(`[${name}]`, diff, ...args);
  }
};

export const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const toFixed = (num, decimalPlaces = 3) => Math.round(num * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);

export const padLeft = (num:number, places:number = 3) => (Math.pow(10, places) + '' + num).substr(-places);

export const formatTime = (ms:number) => new Date(ms).toISOString().substr(11, 12);

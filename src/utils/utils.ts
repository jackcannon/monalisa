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

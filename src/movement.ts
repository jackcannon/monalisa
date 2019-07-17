import {Servo} from 'johnny-five';
import { IPoint } from './interfaces';
import { createTimer, toFixed, distanceBetweenPoints } from './utils';

import { FOVX, FOVY } from './config';

const servos:{[servoName:string]: Servo} = {};

const startingPosX = 90;
const startingPosY = 90;

const centrePosX = 85;
const centrePosY = 102;

const timer = createTimer('movement');

export const setup = () => {
  servos.base = new Servo({
    controller: 'PCA9685',
    pin: 0,
    center: true,
    startAt: startingPosX
  });

  servos.head = new Servo({
    controller: 'PCA9685',
    pin: 3,
    range: [0, 125],
    startAt: startingPosY
  });
};

export const reset = () => {
  servos.base.to(startingPosX);
  servos.head.to(startingPosY);
};

export const move = (servoName, position, time = 1000) => {
  let servo = servos[servoName];
  if (!servo && typeof servoName !== 'string' && servoName instanceof Servo) {
    servo = servoName;
  }
  return new Promise((resolve, reject) => {
    servo.once('move:complete', resolve);
    servo.to(position, time);
  });
};

export const look = (pos:IPoint = {x: 90, y: 90}, speed:number = 20) => {
  const current = getCurrent();
  const distance = distanceBetweenPoints(pos, current);
  const duration = distance * speed;

  return Promise.all([
    move('base', pos.x, duration),
    move('head', pos.y, duration)
  ]);
};

export const getCurrent = () => ({
  x: servos.base.value,
  y: servos.head.value
});

export const lookRelativeDegrees = (posCardinal:IPoint = {x: 0.5, y: 0.5}, speed?:number) => {
  const pos = cardinalToDegrees(posCardinal);
  return look(pos, speed);
};

export const moveRelativeDegrees = (posCardinal:IPoint = {x: 0.5, y: 0.5}, duration:number = 10) => {
  const pos = cardinalToDegrees(posCardinal);
  return Promise.all([
    move('base', pos.x, duration),
    move('head', pos.y, duration)
  ]);
};

const cardinalToDegrees = (pos:IPoint, baseDegrees = {x: centrePosX, y: centrePosY}) => ({
  x: toFixed((baseDegrees.x - (FOVX / 2)) + ((1 - pos.x) * FOVX), 1),
  y: toFixed((baseDegrees.y - (FOVY / 2)) + (pos.y * FOVY), 1)
});

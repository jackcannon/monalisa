import {Servo} from 'johnny-five';
import { IPoint } from './interfaces';
import { createTimer, toFixed } from './utils';

const servos:{[servoName:string]: Servo} = {};

// Standard RaspiCam
const FOVX = 70;
const FOVY = 60;

// WideAngle 3rd Party Cam
// const FOVX = 180;
// const FOVY = 120;

const timer = createTimer('movement');

export const setup = () => {
  servos.base = new Servo({
    controller: 'PCA9685',
    pin: 0,
    center: true
  });

  servos.head = new Servo({
    controller: 'PCA9685',
    pin: 3,
    range: [0, 125],
    startAt: 90
  });
};

export const reset = () => {
  servos.base.to(90);
  servos.head.to(90);
};

export const move = (servoName, position, time = 1000) => {
  const servo = servos[servoName];
  return new Promise((resolve, reject) => {
    servo.once('move:complete', resolve);
    servo.to(position, time);
  });
};

export const look = (pos:IPoint = {x: 90, y: 90}, speed:number = 20) => {
  const current = getCurrent();

  const distanceX = Math.abs(pos.x - current.x);
  const distanceY = Math.abs(pos.y - current.y);
  const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

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

const cardinalToDegrees = (pos:IPoint, baseDegrees = {x: 90, y: 90}) => ({
  x: toFixed((baseDegrees.x - (FOVX / 2)) + ((1 - pos.x) * FOVX), 1),
  y: toFixed((baseDegrees.y - (FOVY / 2)) + (pos.y * FOVY), 1)
});

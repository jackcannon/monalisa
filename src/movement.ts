import {Servo, Servos, Animation} from 'johnny-five';
import { IPoint } from './interfaces';
import { createTimer, toFixed, distanceBetweenPoints } from './utils';

import { FOVX, FOVY } from './config';

const servos:{[servoName:string]: Servo} = {};

let animationX:Animation;
let animationY:Animation;

let current:Promise<any> = Promise.resolve();

const startingPosX = 90;
const startingPosY = 90;

const centrePosX = 85;
// const centrePosY = 102;
const centrePosY = 98;

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

  animationX = new Animation(servos.base);
  animationY = new Animation(servos.head);
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

const getDurationFromSpeed = (pos:IPoint, speed:number = 20) => {
  const current = getCurrent();
  const distance = distanceBetweenPoints(pos, current);
  const duration = distance * speed;
  // console.log(`speed: ${toFixed(speed, 3)}, distance: ${toFixed(distance, 3)}, duration: ${toFixed(duration, 3)}`);
  return duration;
}

// Speed. Higher = slower
export const look = (pos:IPoint = {x: 90, y: 90}, speed?:number) => {
  const duration = getDurationFromSpeed(pos, speed);
  return Promise.all([
    move('base', pos.x, duration),
    move('head', pos.y, duration)
  ]);
};

const queueEaseAnimation = (animation:Animation, fromVal:number, toVal:number, duration:number) =>
  new Promise((resolve, reject) => {
    animation.enqueue({
      duration,
      cuePoints: [0, 1],
      keyFrames: [
        {degrees: fromVal, easing: 'inQuad'},
        {degrees: toVal}
      ],
      // onstop: reject,
      onstop: resolve,
      oncomplete: resolve
    });
  });

// Speed. Higher = slower
export const ease = (pos:IPoint = {x: 90, y: 90}, speed:number = 20) => {
  current = current.then(() => {
    // animationX.stop();
    // animationY.stop();
    const currentPos = getCurrent();
    const duration = getDurationFromSpeed(pos, speed);
    return Promise.all([
      queueEaseAnimation(animationX, currentPos.x, pos.x, duration),
      queueEaseAnimation(animationY, currentPos.y, pos.y, duration),
    ]);
  });
  return current;
}

export const getCurrent = () => ({
  x: servos.base.value,
  y: servos.head.value
});

// Speed. Higher = slower
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

// Speed. Higher = slower
export const easeRelativeDegrees = (posCardinal:IPoint = {x: 0.5, y: 0.5}, speed?:number) => {
  const pos = cardinalToDegrees(posCardinal);
  return ease(pos, speed);
};

const cardinalToDegrees = (pos:IPoint, baseDegrees = {x: centrePosX, y: centrePosY}) => ({
  x: toFixed((baseDegrees.x - (FOVX / 2)) + ((1 - pos.x) * FOVX), 1),
  y: toFixed((baseDegrees.y - (FOVY / 2)) + (pos.y * FOVY), 1)
});

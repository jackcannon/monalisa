import { Servo, Servos, Animation } from "johnny-five";
import { IPoint } from "./interfaces";
import {
  createTimer,
  toFixed,
  distanceBetweenPoints,
  getPromise
} from "./utils";
import { log } from "./dashboard";

import { FOVX, FOVY, easeType, moveSpeed, moveType } from "./config";
import { MOVE_TYPE, MOVEMENT_TYPE } from "./types";
import { Subject } from "rxjs";

const servos: { [servoName: string]: Servo } = {};

const moveCompleteSubject: { [servoName: string]: Subject<void> } = {};

let animationX: Animation;
let animationY: Animation;

let current: Promise<any> = Promise.resolve();

const startingPosX = 90;
const startingPosY = 90;

const centrePosX = 85;
// const centrePosY = 102;
const centrePosY = 98;

const timer = createTimer("movement");

export const setup = () => {
  servos.base = new Servo({
    controller: "PCA9685",
    pin: 0,
    center: true,
    startAt: startingPosX
  });
  setupMoveCompleteSubject(servos.base, "base");

  servos.head = new Servo({
    controller: "PCA9685",
    pin: 3,
    range: [0, 125],
    startAt: startingPosY
  });
  setupMoveCompleteSubject(servos.base, "head");

  animationX = new Animation(servos.base);
  animationY = new Animation(servos.head);
};

const setupMoveCompleteSubject = (servo, servoName) => {
  moveCompleteSubject[servoName] = new Subject<void>();
  servo.on("move:complete", () => {
    moveCompleteSubject[servoName].next();
  });
};

export const reset = () => {
  servos.base.to(startingPosX);
  servos.head.to(startingPosY);
};

export const move = async (servoName, position, time = 1000) => {
  let servo = servos[servoName];
  if (!servo && typeof servoName !== "string" && servoName instanceof Servo) {
    servo = servoName;
  }
  const moveComplete = getPromise(moveCompleteSubject[servoName]);
  servo.to(position, time);
  return await moveComplete;
};

const getDurationFromSpeed = (pos: IPoint, speed: number = 20) => {
  const current = getCurrent();
  const distance = distanceBetweenPoints(pos, current);
  const duration = distance * speed;
  // log.log(`speed: ${toFixed(speed, 3)}, distance: ${toFixed(distance, 3)}, duration: ${toFixed(duration, 3)}`);
  return duration;
};

export const toPos = (
  pos: IPoint = { x: 90, y: 90 },
  movementType: MOVEMENT_TYPE
) => {
  const type = moveType[movementType];
  const speed = moveSpeed[movementType];
  switch (type) {
    case MOVE_TYPE.LOOK:
      return look(pos, speed);
    case MOVE_TYPE.EASE:
      return ease(pos, speed, movementType);
  }
};

// Speed. Higher = slower
export const look = (
  pos: IPoint = { x: 90, y: 90 },
  speed?: number
): Promise<any> => {
  const duration = getDurationFromSpeed(pos, speed);
  return Promise.all([
    move("base", pos.x, duration),
    move("head", pos.y, duration)
  ]);
};

const queueEaseAnimation = (
  animation: Animation,
  fromVal: number,
  toVal: number,
  duration: number,
  movementType: MOVEMENT_TYPE
): Promise<any> =>
  new Promise((resolve, reject) => {
    log.log("easing func", easeType[movementType]);
    animation.enqueue({
      duration,
      cuePoints: [0, 1],
      keyFrames: [
        { degrees: fromVal, easing: easeType[movementType] },
        { degrees: toVal }
      ],
      // onstop: reject,
      onstop: resolve,
      oncomplete: resolve
    });
  });

// Speed. Higher = slower
export const ease = (
  pos: IPoint = { x: 90, y: 90 },
  speed: number = 20,
  movementType: MOVEMENT_TYPE
): Promise<any> => {
  current = current.then(() => {
    // animationX.stop();
    // animationY.stop();
    const currentPos = getCurrent();
    const duration = getDurationFromSpeed(pos, speed);
    return Promise.all([
      queueEaseAnimation(
        animationX,
        currentPos.x,
        pos.x,
        duration,
        movementType
      ),
      queueEaseAnimation(
        animationY,
        currentPos.y,
        pos.y,
        duration,
        movementType
      )
    ]);
  });
  return current;
};

export const getCurrent = () => ({
  x: servos.base.value,
  y: servos.head.value
});

// Speed. Higher = slower
export const toRelativeDegrees = (
  posCardinal: IPoint = { x: 0.5, y: 0.5 },
  movementType: MOVEMENT_TYPE
): Promise<any> => {
  const pos = cardinalToDegrees(posCardinal);
  return toPos(pos, movementType);
};

// Deprecated. Use toRelativeDegrees
// export const lookRelativeDegrees = (
//   posCardinal: IPoint = { x: 0.5, y: 0.5 },
//   speed?: number
// ): Promise<any> => {
//   const pos = cardinalToDegrees(posCardinal);
//   return look(pos, speed);
// };

// Deprecated. Use toRelativeDegrees
// export const moveRelativeDegrees = (
//   posCardinal: IPoint = { x: 0.5, y: 0.5 },
//   duration: number = 10
// ): Promise<any> => {
//   const pos = cardinalToDegrees(posCardinal);
//   return Promise.all([
//     move("base", pos.x, duration),
//     move("head", pos.y, duration)
//   ]);
// };

// Deprecated. Use toRelativeDegrees
// export const easeRelativeDegrees = (
//   posCardinal: IPoint = { x: 0.5, y: 0.5 },
//   speed?: number
// ): Promise<any> => {
//   const pos = cardinalToDegrees(posCardinal);
//   return ease(pos, speed);
// };

export const getDistance = (
  posCardinal: IPoint = { x: 0.5, y: 0.5 }
): number => {
  const pos = cardinalToDegrees(posCardinal);
  const current = getCurrent();
  const distance = distanceBetweenPoints(pos, current);
  return distance;
};

const cardinalToDegrees = (
  pos: IPoint,
  baseDegrees = { x: centrePosX, y: centrePosY }
) => ({
  x: toFixed(baseDegrees.x - FOVX / 2 + (1 - pos.x) * FOVX, 1),
  y: toFixed(baseDegrees.y - FOVY / 2 + pos.y * FOVY, 1)
});

import {
  DETECTION_TYPE,
  OLED_COLOR,
  MOVE_TYPE,
  EASE_TYPE,
  MOVEMENT_TYPE,
  IPoint,
} from './interfaces';

// ----------------------------
//
//           MAIN
//
// ----------------------------

export const showDashboard = true;

// USE FACEAPI
// export let detectionType = DETECTION_TYPE.FACEAPI;
// export let useWorker = true;

// USE OPENCV
export let detectionType = DETECTION_TYPE.OPENCV;
export let useWorker = false;

// ----------------------------
//
//    CAMERA / FACE DETECTION
//
// ----------------------------

// Standard RaspiCam
export const FOVX = 70;
export const FOVY = 60;

// Magnetic Wide Angle 0.65x Lens
// export const FOVX = 95;
// export const FOVY = 70;

// Magnetic Super Fisheye Lens
// export const FOVX = 120;
// export const FOVY = 80;

export const savePhotoOnDetection = false;

export const photoRatio = 480 / 640;
// export const photoWidth = 640;
// export const photoWidth = 480;
export const photoWidth = 320;
// export const photoWidth = 280;
// export const photoWidth = 240;

export const cameraOptions = {
  width: photoWidth,
  height: photoWidth * photoRatio,
  fps: 20,
  encoding: 'JPEG',
  quality: 95,
};

export const faceApiConfig = {
  singleFace: true,
  // higher = faster, lower = smaller/further-away faces
  // minFaceSize: photoWidth * 0.025,
  // minFaceSize: photoWidth * 0.05,
  // minFaceSize: photoWidth * 0.075,
  // minFaceSize: photoWidth * 0.1,
  // minFaceSize: photoWidth * 0.125,
  // minFaceSize: photoWidth * 0.15,
  // minFaceSize: photoWidth * 0.175,
  // minFaceSize: photoWidth * 0.2,
  minFaceSize: photoWidth * 0.225,
  // minFaceSize: photoWidth * 0.25,
  // minFaceSize: photoWidth * 0.275,
  // minFaceSize: photoWidth * 0.3,
};

export const opencvConfig = {
  // dataName: "haarcascade_frontalface_alt_tree"
  dataName: 'haarcascade_frontalface_alt',
  // dataName: "haarcascade_frontalface_alt2"
  // dataName: "haarcascade_frontalface_default"
  // dataName: 'haarcascade_frontalface_profileface',
};

// ----------------------------
//
//    DISPLAY
//
// ----------------------------

export let oledForeColor = OLED_COLOR.BLACK;

// ----------------------------
//
//    MOVEMENT
//
// ----------------------------

// Speed. Higher = slower
export const moveSpeed = {
  [MOVEMENT_TYPE.FACE]: 25,
  [MOVEMENT_TYPE.SEARCH]: 60,
  [MOVEMENT_TYPE.TIRED]: 90,
};

// method to move to look at subject (LOOK, EASE)
export const moveType = {
  [MOVEMENT_TYPE.FACE]: MOVE_TYPE.EASE,
  [MOVEMENT_TYPE.SEARCH]: MOVE_TYPE.EASE,
  [MOVEMENT_TYPE.TIRED]: MOVE_TYPE.EASE,
};

export const easeType = {
  [MOVEMENT_TYPE.FACE]: EASE_TYPE.inQuad,
  [MOVEMENT_TYPE.SEARCH]: EASE_TYPE.inOutQuad,
  [MOVEMENT_TYPE.TIRED]: EASE_TYPE.inOutBounce,
};

// Don't blink if moving more distance than this
export const dontBlinkDistanceThreshold = 1;

// ----------------------------
//
//    BEHAVIOUR
//
// ----------------------------

export const durationLookingAtEachFace = 5000;
export const durationBeforeForgettingFace = 4000;
export const minimumDurationToBeTargetable = 1000;

export const enableSleeping = false;
export const enableBlinking = false;
export const enableWinking = false;

export const sleepingMidPoint: IPoint = { x: 0.5, y: 0.5 };
export const sleepingRestPoint: IPoint = { x: 0.5, y: 0.8 };

export const searchDurationBase = 5000;
export const searchDurationRandom = 5000;

export const sameFaceThreshold = 0.1;
export const cullFaceThreshold = 0.15;

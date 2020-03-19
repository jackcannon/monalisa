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

export const detectSingleFace = true;

export const savePhotoOnDetection = false;

// higher = faster, lower = smaller/further-away faces
// export const faceDetectMinFaceSize = 45;
// export const faceDetectMinFaceSize = 50;
// export const faceDetectMinFaceSize = 55;
// export const faceDetectMinFaceSize = 60;
// export const faceDetectMinFaceSize = 65;
// export const faceDetectMinFaceSize = 70;
export const faceDetectMinFaceSize = 75;
// export const faceDetectMinFaceSize = 80;
// export const faceDetectMinFaceSize = 85;
// export const faceDetectMinFaceSize = 90;
// export const faceDetectMinFaceSize = 95;
// export const faceDetectMinFaceSize = 100;

const ratio = 480 / 640;
// const width = 640;
// const width = 480;
// const width = 320;
// const width = 280;
const width = 240;

export const cameraOptions = {
  width,
  height: width * ratio,
  fps: 20,
  encoding: "JPEG",
  quality: 95
};

// ----------------------------
//
//    MOVEMENT
//
// ----------------------------

// Speed. Higher = slower
export const movementSpeed = 25;

// Speed when casually looking around
export const movementSpeedCasual = 60;

// Don't blink if moving more distance than this
export const dontBlinkDistanceThreshold = 1;

// ----------------------------
//
//    BEHAVIOUR
//
// ----------------------------

export const durationLookingAtEachFace = 5000;
export const durationBeforeForgettingFace = 4000;

export const lookRandomlyAtSomethingDurationBase = 5000;
export const lookRandomlyAtSomethingDurationRandom = 5000;

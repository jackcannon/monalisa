// ----------------------------
//
//           LOGGING
//
// ----------------------------

export const showDashboard = true;

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

export const detectSingleFace = false;

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
  encoding: "JPEG",
  quality: 95
};

// higher = faster, lower = smaller/further-away faces
// export const faceDetectMinFaceSize = photoWidth * 0.025;
// export const faceDetectMinFaceSize = photoWidth * 0.05;
// export const faceDetectMinFaceSize = photoWidth * 0.075;
// export const faceDetectMinFaceSize = photoWidth * 0.1;
// export const faceDetectMinFaceSize = photoWidth * 0.125;
// export const faceDetectMinFaceSize = photoWidth * 0.15;
// export const faceDetectMinFaceSize = photoWidth * 0.175;
// export const faceDetectMinFaceSize = photoWidth * 0.2;
export const faceDetectMinFaceSize = photoWidth * 0.225;
// export const faceDetectMinFaceSize = photoWidth * 0.25;
// export const faceDetectMinFaceSize = photoWidth * 0.275;
// export const faceDetectMinFaceSize = photoWidth * 0.3;
// export const faceDetectMinFaceSize = 45;
// export const faceDetectMinFaceSize = 50;
// export const faceDetectMinFaceSize = 55;
// export const faceDetectMinFaceSize = 60;
// export const faceDetectMinFaceSize = 65;
// export const faceDetectMinFaceSize = 70;
// export const faceDetectMinFaceSize = 75;
// export const faceDetectMinFaceSize = 80;
// export const faceDetectMinFaceSize = 85;
// export const faceDetectMinFaceSize = 90;
// export const faceDetectMinFaceSize = 95;
// export const faceDetectMinFaceSize = 100;

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

export const randomBlinking = false;

export const lookRandomlyAtSomethingDurationBase = 5000;
export const lookRandomlyAtSomethingDurationRandom = 5000;

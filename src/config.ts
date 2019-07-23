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

// higher = faster, lower = smaller/further-away faces
// export const faceDetectMinFaceSize = 45;
// export const faceDetectMinFaceSize = 50;
// export const faceDetectMinFaceSize = 55;
// export const faceDetectMinFaceSize = 60;
export const faceDetectMinFaceSize = 65;

const ratio = 480 / 640;
// const width = 640;
// const width = 480;
const width = 320;
// const width = 280;
// const width = 240;

export const cameraOptions = {
  width,
  height: width * ratio,
  fps: 20,
  encoding: 'JPEG',
  quality: 95
};

// ----------------------------
//
//    MOVEMENT
//
// ----------------------------

// Speed. Higher = slower
export const movementSpeed = 40;

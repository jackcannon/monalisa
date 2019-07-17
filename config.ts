// Standard RaspiCam
// export const FOVX = 70;
// export const FOVY = 60;

// Magnetic Wide Angle 0.65x Lens
export const FOVX = 95;
export const FOVY = 70;

// Magnetic Super Fisheye Lens
// export const FOVX = 120;
// export const FOVY = 80;

export const detectSingleFace = false;

export const savePhotoOnDetection = false;

export const faceDetectMinFaceSize = 45; // higher = faster, lower = smaller/further-away faces

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
}

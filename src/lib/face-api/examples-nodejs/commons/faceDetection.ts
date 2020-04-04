import * as faceapi from 'face-api.js';

// export let faceDetectionNet = faceapi.nets.ssdMobilenetv1;
// export let faceDetectionNet = faceapi.nets.tinyFaceDetector
export let faceDetectionNet = faceapi.nets.mtcnn;

// SsdMobilenetv1Options
const minConfidence = 0.5;

// TinyFaceDetectorOptions
const inputSize = 416;
const scoreThreshold = 0.5;

// MtcnnOptions
const minFaceSize = 50;
const scaleFactor = 0.8;

export function getFaceDetectorOptions(net: faceapi.NeuralNetwork<any>, options) {
  // @ts-ignore
  if (net === faceapi.nets.ssdMobilenetv1) {
    return new faceapi.SsdMobilenetv1Options({ minConfidence });
    // @ts-ignore
  } else if (net === faceapi.nets.tinyFaceDetector) {
    return new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
  } else {
    return new faceapi.MtcnnOptions(options);
  }
}

// @ts-ignore
export const faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet, {
  minFaceSize,
  scaleFactor,
});

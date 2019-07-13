const PiCamera = require('pi-camera');

console.log('starting A');

const now = (new Date()).toISOString().replace(/T|:|\./g, '-').substring(0, 19);
const myCamera = new PiCamera({
  mode: 'photo',
  output: `${ __dirname }/photos/${now}.jpg`,
  width: 640,
  height: 480,
  // width: 3280,
  // height: 2464,
  nopreview: true,
});
console.log('starting B');

myCamera.snap()
  .then((result) => {
      console.log('result', result);
      // Your picture was captured
    })
    .catch((error) => {
      console.log('error', error);
     // Handle your error
  });

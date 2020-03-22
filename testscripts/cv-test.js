var cv = require("opencv");
var raspberryPiCamera = require("raspberry-pi-camera-native");

const photoRatio = 480 / 640;
// const photoWidth = 640;
// const photoWidth = 480;
const photoWidth = 320;
// const photoWidth = 280;
// const photoWidth = 240;
const cameraOptions = {
  width: photoWidth,
  height: photoWidth * photoRatio,
  fps: 20,
  encoding: "JPEG",
  quality: 95
};

let currentFrame = null;

const createTimer = name => {
  const start = Date.now();
  let last = Date.now();

  return function(...args) {
    const now = Date.now();
    const diff = now - last;
    last = now;
    console.log(name, ...args, diff);
    return diff;
  };
};

const startCamera = () =>
  new Promise(resolve => {
    const timer = createTimer("camera");
    raspberryPiCamera.start(cameraOptions, function() {
      // console.log("test A");
      raspberryPiCamera.on("frame", frame => {
        // console.log("test b");
        // startProcessLoop(frame);
        timer();
        currentFrame = frame;
        return resolve(frame);
      });
    });
  });

const startProcessLoop = timer => {
  // console.log("test c");
  cv.readImage(currentFrame, function(err, im) {
    // console.log("test d");
    if (err) throw err;
    if (im.width() < 1 || im.height() < 1) throw new Error("Image has no size");
    // console.log("test e");

    im.detectObject(
      "../node_modules/opencv/data/haarcascade_frontalface_alt.xml",
      {},
      function(err, faces) {
        // console.log("test f");
        if (err) throw err;
        // console.log("test g");

        for (var i = 0; i < faces.length; i++) {
          // console.log("face", faces[i]);
          var face = faces[i];
          im.ellipse(
            face.x + face.width / 2,
            face.y + face.height / 2,
            face.width / 2,
            face.height / 2
          );
        }
        timer("faces", faces);
        startProcessLoop(timer);

        // console.log("test h");

        // const filePath = "../photos/";
        // const fileName = new Date().toISOString() + ".png";

        // im.save(filePath + fileName);
        // console.log("Image saved to " + filePath + fileName);
      }
    );
  });
};

const run = () => {
  console.log("run 1");
  startCamera().then(() => {
    console.log("run 2");
    const timer = createTimer("run");
    startProcessLoop(timer);
  });
};

run();

console.log("a");

const Raspi = require("raspi-io").RaspiIO;

console.log("b");

const five = require("johnny-five");

console.log("c");

const io = new Raspi();

console.log("d");
const board = new five.Board({
  io
});

console.log("e");

board.on("ready", () => {
  console.log("f ready");

  // const base = new five.Servo({
  //   controller: "PCA9685",
  //   pin: 0,
  //   center: true,
  //   startAt: 10
  // });

  const head = new five.Servo({
    controller: "PCA9685",
    pin: 3,
    range: [0, 125],
    startAt: 90
  });

  // base.to(1);
  head.to(100);

  console.log("g finished");
});

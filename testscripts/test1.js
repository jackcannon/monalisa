const five = require("johnny-five");
const Raspi = require("raspi-io").RaspiIO;
const board = new five.Board({
  io: new Raspi()
});
console.log('a');

board.on("ready", () => {
  console.log('ready');
  // Create an Led on pin 13
  const led = new five.Led(13);

  led.blink(500);
});

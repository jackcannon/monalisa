console.log('a');

const Raspi = require('raspi-io').RaspiIO;

console.log('b');

const five = require('johnny-five');

console.log('c');

const io = new Raspi();

console.log('d');
const board = new five.Board({
  io
});

console.log('e');

board.on('ready', () => {
  console.log('f ready');

  // Create an Led on pin 7 (GPIO4) on P1 and strobe it on/off
  // Optionally set the speed; defaults to 100ms
  (new five.Led('P1-7')).strobe();
});

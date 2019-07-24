
const Raspi = require('raspi-io').RaspiIO;


const five = require('johnny-five');


const io = new Raspi();

const boardA = new five.Board({
  io
});


boardA.on('ready', () => {

  // Create an Led on pin 7 (GPIO4) on P1 and strobe it on/off
  // Optionally set the speed; defaults to 100ms
  (new five.Led('P1-7')).strobe();
});

const boardB = new five.Board({
  io
});

boardB.on('ready', () => {

  // Create an Led on pin 7 (GPIO4) on P1 and strobe it on/off
  // Optionally set the speed; defaults to 100ms
  (new five.Led('P1-7')).strobe();
});

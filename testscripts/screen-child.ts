const five = require('johnny-five');
const Raspi = require('raspi-io').RaspiIO;
const OLED = require('oled-js');
const eyes = require('./eyes');

const events = require('events');

const;

const board = new five.Board({
  io: new Raspi(),
});

events.EventEmitter.defaultMaxListeners = 30;

board.on('ready', () => {
  console.log('Connected to Arduino, ready.');

  const opts = {
    width: 128,
    height: 64,
    address: 0x3c,
  };

  const oled = new OLED(board, five, opts);

  oled.clearDisplay();
  oled.drawLine(1, 1, 128, 64, 1);
  oled.fillRect(0, 0, 128, 64, 0);
});

process.on('message', msg => handleIncomingMessage(msg));

const handleIncomingMessage = msg => {
  switch (msg.type) {
  }
};

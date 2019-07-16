const five = require('johnny-five');
const OLED = require('oled-js');
const RaspiIO =  require('raspi-io').RaspiIO;



const board = new five.Board({
  io: new (RaspiIO)()
});


const opts = {
  width: 128,
  height: 64,
  address: 0x3C
};

oled = new OLED(board, five, opts);


let frame = 0;
let x = 0;
let direction = 10;
const drawFrame = () => {
  oled.clearDisplay();
  oled.fillRect(x, 0, x + 10, 64, 1);

  x += direction
  if (x > 117) {
    x = 117;
    direction *= -1
  }
  if (x < 0) {
    x = 0;
    direction *= -1
  }
  frame++;
}

setInterval(drawFrame, 1000);

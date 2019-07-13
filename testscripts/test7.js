const five = require('johnny-five');
const Raspi = require('raspi-io').RaspiIO;
const board = new five.Board({
  io: new Raspi()
});
console.log('a');






const start = Date.now();

board.on('ready', () => {
  console.log('ready');

  const base = new five.Servo({
    controller: 'PCA9685',
    pin: 0,
    center: true
  });

  const head = new five.Servo({
    controller: 'PCA9685',
    pin: 3,
    range: [0, 125],
    startAt: 90
  });

  const move = (servo, position, time) => {
    return new Promise((resolve, reject) => {
      servo.once('move:complete', resolve);
      servo.to(position, time);
    });
  }
  const look = (pos = {x: 90, y: 90}, speed = 20) => {
    const before = {
      x: base.value,
      y: head.value
    };

    const distanceX = Math.abs(pos.x - before.x);
    const distanceY = Math.abs(pos.y - before.y);
    const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

    const duration = distance * speed;

    console.log(distance, duration);

    return Promise.all([
      move(base, pos.x, duration),
      move(head, pos.y, duration)
    ]);
  }



  let tickNum = 0;
  const lookObj = {
    x: -100,
    y: 100,
    movingX: 1,
    movingY: -1.5,
    position: 0,
    speed: 1 / 128,
  };

  const tick = () => {
    const now = Date.now() - start;
    console.log('tick', tickNum, now, Math.floor((now / tickNum) * 100) / 100);
    lookObj.position += lookObj.speed;
    lookObj.position = lookObj.position % 1;

    const radius = 100;
    lookObj.x = 0 + Math.sin(lookObj.position * 2 * Math.PI);
    lookObj.y = 0 - Math.cos(lookObj.position * 2 * Math.PI);

    // Promise.all([
    //   move(base, 90 + (lookObj.x * 40), 50),
    //   move(head, 90 + (lookObj.y * 25), 50),
    // ]).then(() => {
    //   tickNum++;
    //   tick();
    // })
    look({
      x: 90 + (lookObj.x * 25),
      y: 90 + (lookObj.y * 25)
    }, 20).then(() => {
      tickNum++;
      tick();
    })
  };

  tick();

  board.on('exit', function() {
    // base.home();
    // head.home();
  });
});

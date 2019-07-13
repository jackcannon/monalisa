const { workerData, parentPort, isMainThread } = require("worker_threads");

console.log('start child');

parentPort.on('message', ({type}) => {
  switch (type) {
    case 'start':
      start();
      break;
  }
});


const start = () => {
  parentPort.postMessage({ type: 'starting' });
  for(var i = 0; i < 1000000; i++) {
    if (i % 100000 === 0) {
      console.log('child', i);
    }
  }
  parentPort.postMessage({ type: 'finished' });
}

// parentPort.postMessage({ start: workerData, isMainThread });

import {
  Worker, isMainThread, parentPort, workerData
} from 'worker_threads';

console.log('start parent');

let worker;

const handleMsg = ({type}) => {
  switch (type) {
    case 'starting':
      start();
      break;
  }
}

const setup = () => {
  worker = new Worker('./workers-child.js', {});
  worker.on('message', handleMsg);

  worker.postMessage({type: 'start'});
}

const start = () => {
  for(var i = 0; i < 1000000; i++) {
    if (i % 100000 === 0) {
      console.log('parent', i);
    }
  }
}


setup();

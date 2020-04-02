import { fork } from 'child_process';

let childProcess;

export const setup = start => {
  childProcess = fork(__dirname + '/child.js');
  childProcess.on('message', msg => handleIncomingMessage(msg));

  childProcess.send({
    type: 'setup',
    startTime: start,
  });
};

const handleIncomingMessage = msg => {
  switch (msg.type) {
  }
};

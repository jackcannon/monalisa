import { fork } from 'child_process';
import { showDashboard } from '../config';
import { IFaceRecord, IFace, BEHAVIOUR_STATE } from '../interfaces';
import {
  IChildProcessMessage,
  IDashboardSetup,
  IDashboardLog,
  IDashboardDetections,
  IDashboardBehaviour,
} from './dashboardTypes';
import { since } from '../utils';

let log = { log: console.log };
let childProcess;

const handleIncomingMessage = (msg: IChildProcessMessage) => {};

// ADMIN

export const onChildKilled = () =>
  new Promise(resolve => {
    childProcess.once('exit', resolve);
    childProcess.once('close', resolve);
  });

export const shutdown = async () => {
  if (childProcess) {
    // const killProm = onChildKilled();
    childProcess.kill(0);
    // await killProm;
  }
};

export const setup = start => {
  if (showDashboard) {
    childProcess = fork(__dirname + '/child.js');
    childProcess.on('message', msg => handleIncomingMessage(msg));
    log.log = (...args) => {
      childProcess.send({
        type: 'log',
        data: args,
      } as IDashboardLog);
    };

    childProcess.send({
      type: 'setup',
      startTime: start,
    } as IDashboardSetup);
  }
};

const start = Date.now();

// PUBLIC FUNCTIONS
export const addDetections = (points: IFaceRecord[], delta: number) => {
  if (showDashboard && childProcess) {
    childProcess.send({
      type: 'detections',
      points,
      delta,
    } as IDashboardDetections);
  } else {
    const buffer = ' '.repeat(9 - delta.toString().length);
    log.log(since(start), 'Delta:', buffer, delta, '  Faces:', JSON.stringify(points));
  }
};
export const updateBehaviour = (faces: IFace[], state: BEHAVIOUR_STATE) => {
  if (showDashboard && childProcess) {
    childProcess.send({
      type: 'behaviour',
      faces,
      state,
      time: Date.now(),
    } as IDashboardBehaviour);
  } else {
    const buffer = ' '.repeat(9 - state.length);
    log.log(since(start), 'State:', buffer, state, '  Faces:', JSON.stringify(faces));
  }
};

export { log };

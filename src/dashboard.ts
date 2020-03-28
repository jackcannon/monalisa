import { fork } from "child_process";
import { showDashboard } from "./config";
import { IFaceRecord, IFace } from "./interfaces";
import {
  IChildProcessMessage,
  IDashboardSetup,
  IDashboardLog,
  IDashboardRecord,
  IDashboardFaces
} from "./dashboardTypes";

let log = { log: console.log };
let childProcess;

const handleIncomingMessage = (msg: IChildProcessMessage) => {};

// ADMIN

export const onChildKilled = () =>
  new Promise(resolve => {
    childProcess.once("exit", resolve);
    childProcess.once("close", resolve);
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
    childProcess = fork(__dirname + "/dashboard-child.js");
    childProcess.on("message", msg => handleIncomingMessage(msg));
    log.log = (...args) => {
      childProcess.send({
        type: "log",
        data: args
      } as IDashboardLog);
    };

    childProcess.send({
      type: "setup",
      startTime: start
    } as IDashboardSetup);
  }
};

// PUBLIC FUNCTIONS
export const addRecord = (points: IFaceRecord[], delta: number) => {
  if (showDashboard && childProcess) {
    childProcess.send({
      type: "record",
      points,
      delta
    } as IDashboardRecord);
  } else {
    const buffer = " ".repeat(4 - delta.toString().length);
    log.log("Delta:", buffer, delta, "  Faces:", JSON.stringify(points));
  }
};
export const updatesFaces = (faces: IFace[], target: IFace) => {
  if (showDashboard && childProcess) {
    childProcess.send({
      type: "faces",
      faces,
      target,
      time: Date.now()
    } as IDashboardFaces);
  } else {
    // const buffer = " ".repeat(4 - delta.toString().length);
    // log.log("Delta:", buffer, delta, "  Faces:", JSON.stringify(points));
  }
};

export { log };

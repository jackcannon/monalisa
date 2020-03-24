import { fork } from "child_process";
import { showDashboard } from "./config";
import { IFacePoint } from "./interfaces";
import {
  IChildProcessMessage,
  IDashboardSetup,
  IDashboardLog,
  IDashboardRecord
} from "./dashboardTypes";

let log = { log: console.log };
let childProcess;

const handleIncomingMessage = (msg: IChildProcessMessage) => {};

// ADMIN

export const shutdown = () => {
  if (childProcess) {
    childProcess.kill(0);
  }
};

export const setup = start => {
  if (showDashboard) {
    childProcess = fork(__dirname + "/child-dashboard.js");
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
export const addRecord = (points: IFacePoint[], delta: number) => {
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

export { log };

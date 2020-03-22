const { workerData, parentPort, isMainThread } = require("worker_threads");
// import { getFrames } from "../src/cameraHelper";
import { Board } from "johnny-five";
import { RaspiIO } from "raspi-io";

console.log("start child");

parentPort.on("message", ({ type, num }) => {
  switch (type) {
    case "start":
      start(num);
      break;
  }
});

const start = num => {
  // getFrames();

  const board: any = new Board({
    io: new (RaspiIO as any)()
  });

  // parentPort.postMessage({ type: "starting", num });
  // for (var i = 0; i < 1000000; i++) {
  //   if (i % 100000 === 0) {
  //     console.log("child", num, i);
  //   }
  // }
  // parentPort.postMessage({ type: "finished", num });
};

// parentPort.postMessage({ start: workerData, isMainThread });

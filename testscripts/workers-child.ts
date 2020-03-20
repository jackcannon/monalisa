const { workerData, parentPort, isMainThread } = require("worker_threads");

console.log("start child");

parentPort.on("message", ({ type, num }) => {
  switch (type) {
    case "start":
      start(num);
      break;
  }
});

const start = num => {
  parentPort.postMessage({ type: "starting", num });
  for (var i = 0; i < 1000000; i++) {
    if (i % 100000 === 0) {
      console.log("child", num, i);
    }
  }
  parentPort.postMessage({ type: "finished", num });
};

// parentPort.postMessage({ start: workerData, isMainThread });

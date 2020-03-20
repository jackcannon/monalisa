import { Worker, isMainThread, parentPort, workerData } from "worker_threads";

console.log("start parent");

let worker;

const handleMsg = ({ type, num }) => {
  switch (type) {
    case "starting":
      start(num);
      break;
  }
};

const setup = num => {
  worker = new Worker("./workers-child.js", {});
  worker.on("message", handleMsg);

  worker.postMessage({ type: "start", num });
};

const start = num => {
  for (var i = 0; i < 1000000; i++) {
    if (i % 100000 === 0) {
      console.log("parent", num, i);
    }
  }
};

setup(1);
setup(2);
setup(3);
setup(4);

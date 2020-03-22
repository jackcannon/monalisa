import { Worker } from "worker_threads";

export const setup = async (): Promise<any> => {
  await createWorker1();

  console.log("done 1");

  await createWorker2();
  console.log("done 2");
  return true;
};

let worker: Worker;

const createWorker1 = (): Promise<any> => {
  return new Promise(resolve => {
    worker = new Worker("./dist/worker-faceapi.js", {});
    worker.on("message", data => {
      console.log(data);
      if (data && data.type && data.type === "init") {
        // log.log(worker);
        resolve();
      }
    });
  });
};
const createWorker2 = (): Promise<any> => {
  return new Promise(resolve => {
    worker = new Worker("./dist/worker-pico.js", {});
    worker.on("message", data => {
      console.log(data);
      if (data && data.type && data.type === "init") {
        // log.log(worker);
        resolve();
      }
    });
  });
};

setup();

import { Board } from "johnny-five";
import { RaspiIO } from "raspi-io";
import readline from "readline";

import * as movement from "./movement";
import * as detection from "./detection";
import * as eyes from "./eyes";
import * as behaviour from "./behaviour";
import * as dashboard from "./dashboard";
import { formatTime } from "./utils";

const start = Date.now();

const board: any = new Board({
  io: new (RaspiIO as any)()
});

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on("keypress", (str, key) => {
  if (key.ctrl && key.name === "c") {
    shutdown();
  } else {
    dashboard.log.log(`You pressed the "${str}" key`);
    dashboard.log.log();
    dashboard.log.log(key);
    dashboard.log.log();
  }
});

const shutdown = () => {
  eyes.reset();
  movement.reset();
  dashboard.shutdown();
  setTimeout(() => {
    console.log("I've been alive for:", formatTime(Date.now() - start));
    console.log();
    console.log();
    process.kill(0);
  }, 500);
};

board.on("ready", async () => {
  dashboard.setup(start);
  await eyes.setup(board);
  eyes.start();
  movement.setup();
  const faceSubject = await detection.setup();
  behaviour.setup(faceSubject);

  board.on("exit", function() {
    shutdown();
  });
});
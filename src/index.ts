import { Board } from "johnny-five";
import { RaspiIO } from "raspi-io";
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

const shutdown = () => {
  eyes.reset();
  movement.reset();
  dashboard.log.log("I've been alive for:", formatTime(Date.now() - start));
};

board.on("ready", async () => {
  dashboard.setup(shutdown, start);
  await eyes.setup(board);
  eyes.start();
  movement.setup();
  const faceSubject = await detection.setup();
  behaviour.setup(faceSubject);

  board.on("exit", function() {
    shutdown();
  });
});

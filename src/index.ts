import { Board } from "johnny-five";
import { RaspiIO } from "raspi-io";
import * as movement from "./movement";
import * as camera from "./camera";
import * as eyes from "./eyes";
import * as behaviour from "./behaviour";
import { formatTime } from "./utils";

const start = Date.now();

const board: any = new Board({
  io: new (RaspiIO as any)()
});

board.on("ready", async () => {
  await eyes.setup(board);
  eyes.start();
  movement.setup();
  const faceSubject = await camera.setup();
  behaviour.setup(faceSubject);

  board.on("exit", function() {
    console.log("I've been alive for:", formatTime(Date.now() - start));
    eyes.reset();
    movement.reset();
  });
});

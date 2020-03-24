import { log } from "./dashboard-test";

function func(input) {
  log("child " + JSON.stringify(input));
  process.send("Hello " + input);
}

process.on("message", function(m) {
  func(m);
});

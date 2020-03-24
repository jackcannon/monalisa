var fork = require("child_process").fork;
var example1 = fork(__dirname + "/childProc-child.js");

example1.on("message", function(response) {
  // console.log(response);
});

example1.send({ func: "input" });

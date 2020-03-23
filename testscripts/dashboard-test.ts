// const blessed = require("blessed");
// const contrib = require("blessed-contrib");

export const runDashboard = () => {};
console.log("hello");

const scrn = blessed.screen();
const grid = new contrib.grid({ rows: 12, cols: 12, screen: scrn });
const lifetime = grid.set(0, 0, 3, 6, blessed.box, {
  tags: true,
  style: {
    bold: true,
    border: {
      fg: "white"
    }
  }
});
lifetime.setContent("1234");

scrn.render();
console.log("hello2");

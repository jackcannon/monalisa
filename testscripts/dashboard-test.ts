const blessed = require("blessed");
const contrib = require("blessed-contrib");

const scrn = blessed.screen();
const grid = new contrib.grid({ rows: 12, cols: 12, screen: scrn });

const dashLog = grid.set(3, 0, 6, 6, contrib.log, {
  fg: [128, 128, 128],
  selectedFg: [128, 128, 128],
  label: "Main Log"
});

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

export const log = (...args) => {
  dashLog.log(...args);
};

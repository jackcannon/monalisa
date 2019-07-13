const { StillCamera, Rotation } = require("pi-camera-connect");
const fs = require('fs');

const stillCamera = new StillCamera({
  rotation: Rotation.Rotate180
});

stillCamera.takeImage().then(image => {
  const now = (new Date()).toISOString().replace(/T|:|\./g, '-').substring(0, 19);
  const outputName = `${ __dirname }/../photos/${now}.jpg`;
  console.log(image);
  fs.writeFileSync(outputName, image);
});

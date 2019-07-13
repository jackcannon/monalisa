const path = require('path');

console.log('compiling worker code');
try {
  require('ts-node').register();
  require(path.resolve(__dirname, './worker-faces.ts'));
} catch (error) {
  console.log('worker compilation error:', error);
}

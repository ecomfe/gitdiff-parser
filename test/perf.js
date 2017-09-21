const parser = require('../index');
const path = require('path');

const text = require('fs').readFileSync(path.resolve(__dirname, 'large.diff'), 'utf-8');
console.time('parse');
parser.parse(text);
console.timeEnd('parse');

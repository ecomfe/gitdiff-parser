const parser = require('../index');
const path = require('path');

const text = require('fs').readFileSync(path.resolve(__dirname, 'hg.diff'), 'utf-8');
console.time('parse');
console.log( JSON.stringify(parser.parse(text), null, 2) );
console.timeEnd('parse');

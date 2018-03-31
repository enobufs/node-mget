#!/usr/bin/env node

'use strict';

const program = require('commander');
const util = require('util');
const path = require('path');
const mget = require(path.join(__dirname, '..'));
const { getProgress } = mget.tool;
const { version } = require(path.join(__dirname, '../package'));
const { sprintf } = require('sprintf-js');

function resolve(ipath) {
    return path.resolve(process.cwd(), ipath);
}
 
program
    .usage('[options] <url>')
    .version(version, '-v, --version')
    .option('-c, --concurrency <num>', 'Concurrency. (default: 0 - auto)', parseInt)
    .option('-o, --output <pathname>', 'Output file path.)', resolve)
    .parse(process.argv);

const opts = {};
if (program.concurrency > 0) {
    opts.concurrency = program.concurrency
}

const m = mget.create(opts);
m.on('progress', getProgress);

m.start(program.args[0], program.output)
.then(() => {
    console.log();
    process.exit(0)
})
.catch((err) => {
    console.error('\n', err);
    process.exit(1)
});


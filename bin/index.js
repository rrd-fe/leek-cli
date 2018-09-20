#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const cli = require('../src/cli');
const print = require('../src/utils/print');

print.info('参数列表：start');
print.info(argv);
print.info('参数列表：end');

cli.processCommand(argv);

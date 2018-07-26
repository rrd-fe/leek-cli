
/**
 *
 * 打印命令行信息
 *
 */

/* eslint no-console: ["error", { allow: ["log"] }] */

const chalk = require('chalk');

const enableDebug = process.env.DEBUG;

function out(...args) {
    console.log(...args);
}

function info(...args) {
    if (enableDebug === 'true') {
        out(...args);
    }
}

function yellow(msg) {
    out(chalk.yellow(msg));
}

function red(msg) {
    out(chalk.red(msg));
}

module.exports = {
    info,
    out,
    red,
    yellow,
};

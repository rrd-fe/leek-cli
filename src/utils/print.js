
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

function green(msg) {
    out(chalk.green(msg));
}

function currentTime(before) {
    if (before) {
        green(process.uptime(before));
    } else {
        green(process.uptime());
    }
}

module.exports = {
    info,
    out,
    red,
    yellow,
    currentTime,
};

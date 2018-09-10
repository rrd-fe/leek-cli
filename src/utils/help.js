/**
* @Author: dushaobin <rrd>
* @Date:   2017-03-29
* @Email:  dushaobin@we.com
* @Project: wern
* @Last modified by:   rrd
* @Last modified time: 2017-03-30
*/

const gradient = require('gradient-string');
const conf = require('../config/conf');

const print = require('./print');
const pkg = require('../../package.json');

function getCliTitle() {
    return conf.logo.val;
}


function getCliDesc() {
    const des = (
        `${conf.cons.headerPaddig}${conf.text.description}
    `);
    return des;
}

function printCliHeader() {
    print.out(gradient.summer(getCliTitle()));
    print.out(conf.cons.headerPaddig + conf.text.currentVersion + pkg.version);
    print.out(getCliDesc());
}

module.exports = {
    getCliTitle,
    getCliDesc,
    printCliHeader,
};

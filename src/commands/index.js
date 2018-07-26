/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-03-28
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-03-31
 */


const Command = require('../base/Command');

const init = require('./init');
const whoami = require('./whoami');

const server = require('./server');

const help = require('./help');
const version = require('./version');

const print = require('../utils/print');
const util = require('../utils/util');

const commands = {
    init,
    whoami,
    server,
};

const sortedCmds = {};

Object.keys(commands).sort().forEach((v) => {
    sortedCmds[v] = commands[v];
});

const rootCommand = new Command({
    action: () => {
        const infos = util.getUsageInfo(rootCommand);
        help.printHelpInfo();
        infos.forEach((v) => {
            print.out(v);
        });
    },
});

rootCommand.addSumCmds(sortedCmds);

rootCommand.addOptions({
    help,
    version,
});

// 替换默认的help action
rootCommand.updateOptionAction(help.actions);

module.exports = rootCommand;

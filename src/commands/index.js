/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-03-28
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-03-31
 */


const Command = require('../base/Command');
const help = require('./help');
const version = require('./version');
const print = require('../utils/print');
const util = require('../utils/util');
const commands = require('../index');

const sortedCmds = util.sortCmd(commands);

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

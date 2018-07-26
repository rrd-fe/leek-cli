/**
* @Author: dushaobin <rrd>
* @Date:   2017-03-31
* @Email:  dushaobin@we.com
* @Project: wern
* @Last modified by:   rrd
* @Last modified time: 2017-03-31
*/

const helpUtil = require('../../utils/help');
const print = require('../../utils/print');

module.exports = {
    name: 'help',
    type: 'options',
    command: '-h, --help',
    description: '帮助说明',
    printHelpInfo: helpUtil.printCliHeader,
    actions: {
        h: {
            action: (cmd) => {
                // print.info(cmd.action);
                if (cmd.action) {
                    cmd.action();
                }
                // cmd.action && cmd.action();
            },
        },
        help: {
            action: (cmd) => {
                if (cmd.action) {
                    cmd.action();
                }
            },
        },
    },
};

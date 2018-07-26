/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-03-31
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-03-31
 */

import print from '../../utils/print';
import conf from '../../config/conf';
import util from '../../utils/util';
import shelljs from 'shelljs';

import Command from '../../base/Command';

function startRNServer(cmd, args) {
    
    util.startDebugServer();
}

let startServerCmd = new Command({
    name: 'start',
    description: '开启RN调试服务',
    command: 'start',
    action: startRNServer,
});

startServerCmd.addHelpSpec('开启RN调试服务');
startServerCmd.addHelpExample('   grn server start');


let serverCmd = new Command({
    name: 'server',
    description: 'RN调试服务',
    command: 'server'
});
serverCmd.addHelpSpec('RN调试服务器');
serverCmd.addHelpExample('   grn server start');


serverCmd.addSubCmd(startServerCmd);


module.exports = serverCmd;

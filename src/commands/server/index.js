/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-03-31
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-03-31
 */

const util = require('../../utils/util');
const print = require('../../utils/print');

const Command = require('../../base/Command');
const Option = require('../../base/Option');


function startRNServer() {
    util.startDebugServer();
}

const buildCmd = new Command({
    name: 'build',
    description: '构建服务端代码',
    command: 'build',
    action: (cmd) => {
        print.out('构建服务端代码');
    },
});

buildCmd.addHelpSpec('构建服务端代码');
buildCmd.addHelpExample('   grn server start');

buildCmd.addOption('env', new Option({
    name: 'query',
    command: '-e, --env',
    description: '需要传入的额外参数，需要JSON格式',
    action: (cmd) => {
        print.out('env options');
    },
}));


const startServerCmd = new Command({
    name: 'start',
    description: '开启RN调试服务',
    command: 'start',
    action: startRNServer,
});

startServerCmd.addHelpSpec('开启RN调试服务');
startServerCmd.addHelpExample('   grn server start');


const serverCmd = new Command({
    name: 'server',
    description: 'RN调试服务',
    command: 'server',
});
serverCmd.addHelpSpec('RN调试服务器');
serverCmd.addHelpExample('   grn server start');


serverCmd.addSubCmd(startServerCmd);
serverCmd.addSubCmd(buildCmd);


module.exports = serverCmd;

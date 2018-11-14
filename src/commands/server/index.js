/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-03-31
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-03-31
 */

const print = require('../../utils/print');
const Command = require('../../base/Command');
const Option = require('../../base/Option');

const buildCmd = new Command({
    name: 'build',
    description: '构建服务端代码',
    command: 'build',
    action: (cmd, opts) => {
        // todofixed: remove
        // console.log('参数', opts)

        const server = require('./server'); // eslint-disable-line global-require
        if (server.checkEnv() === false) {
            return;
        }
        server.buildServer();
        if (opts.watch || opts.w) {
            setTimeout(() => {
                server.startWatch();
            }, 1000);
        }
    },
});

buildCmd.addHelpSpec('构建服务端代码');
buildCmd.addHelpExample('   leek server build');

buildCmd.addOption('env', new Option({
    name: 'environment',
    command: '-e, --env',
    description: '当前构建的环境',
    actions: {
        'e;env': {
            action: () => {
                print.out('构建环境暂未支持...');
            },
        },
    },
}));

buildCmd.addOption('watch', new Option({
    name: 'watch',
    command: '-w, --watch',
    description: '监控文件变化自动构建代码',
}));

const startServerCmd = new Command({
    name: 'start',
    description: '启动node服务',
    command: 'start',
    action: (cmd, opts) => {
        // 启动服务 默认情况
        const server = require('./server'); // eslint-disable-line global-require
        server.startServer(opts || {});
    },
});

startServerCmd.addHelpSpec('启动node服务');
startServerCmd.addHelpExample('   leek server start');

startServerCmd.addOption('watch', new Option({
    name: 'watch',
    command: '-w, --watch',
    description: '监控文件变化自动重启服务',
}));

startServerCmd.addOption('env', new Option({
    name: 'env',
    command: '-e, --env',
    description: '设置当前运行的环境',
}));

const serverCmd = new Command({
    name: 'server',
    description: '后端node服务',
    command: 'server',
});

serverCmd.addHelpSpec('后端node服务');
serverCmd.addHelpExample('   leek server build -e production');

serverCmd.addSubCmd(startServerCmd);
serverCmd.addSubCmd(buildCmd);

module.exports = serverCmd;

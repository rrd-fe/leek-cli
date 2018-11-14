
/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-03-31
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-03-31
 */
const allCmd = require('./all');

const Command = require('../../base/Command');
const Option = require('../../base/Option');


const bundleCmd = new Command({
    name: 'bundle',
    description: '打包客户端资源',
    command: 'bundle',
    action: (cmd, opts) => {
        // load module in exec
        const bundle = require('./bundle'); // eslint-disable-line global-require
        if (bundle.checkEnv() === false) {
            return;
        }
        bundle.bundleSource(opts);
    },
});

bundleCmd.addHelpSpec('打包客户端代码');
bundleCmd.addHelpExample('   leek bundle all');

bundleCmd.addOption('env', new Option({
    name: 'environment',
    command: '-e, --env',
    description: '当前构建的环境',
}));

bundleCmd.addOption('watch', new Option({
    name: 'watch',
    command: '-w, --watch',
    description: '监控文件变化自动构建代码',
}));

bundleCmd.addOption('module', new Option({
    name: 'module',
    command: '-m, --module',
    description: '打包的模块名',
}));

bundleCmd.addOption('page', new Option({
    name: 'page',
    command: '-p, --page',
    description: '打包的页面名',
}));

bundleCmd.addOption('inlineCss', new Option({
    name: 'inlineCss',
    command: '-i, --inlineCss',
    description: 'css样式是否打包为内联形式',
}));

bundleCmd.addOption('noLoading', new Option({
    name: 'noLoading',
    command: '-n, --noLoading',
    description: '不显示loding',
}));

bundleCmd.addSubCmd(allCmd);

module.exports = bundleCmd;

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

//初始化项目
function initProject(cmd, args) {
    //检查grn配置文件
    util.getGRNConfig(conf => {
        //检查package.json文件
        if (!util.checkProjectPkg()) {
            return;
        }
        //设置npm,为npm.we.com
        log.print('npm 配置 registry');
        shelljs.exec('npm set registry http://npm.we.com');
        log.print('npm 配置 registry: 完成');
        //npm install安装项目
        log.print('npm 安装依赖: 开始');
        shelljs.exec('npm install');
        log.print('npm 安装依赖: 完成');

        //检查react-native-cli是否安装
        // if (!util.checkRNC()) {
        //     shelljs.exec('npm install -g react-native-cli');
        // }
        log.print('项目初始化完成');
    });
}


function printInitHelp(cmd, ccmd) {
    if (ccmd) {
        util.printCmdTitle(ccmd);
    }
    print.out('说明: 初始化项目');
    util.printCmdHelp(cmd);
    print.out('例子:');
    print.out('   grn init');
}


module.exports = {
    name: 'init',
    description: '初始化RN项目',
    command: 'init',
    action: initProject,
    options: {
        help: {
            name: 'help',
            type: 'options',
            command: '-h, --help',
            description: '帮助说明',
        },
    },
    $options: {
        h: {
            action: (cmd) => {
                printInitHelp(cmd, 'init');
            },
        },
        help: {
            action: (cmd) => {
                printInitHelp(cmd, 'init');
            },
        },
    },
};

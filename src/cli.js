/**
* @Author: dushaobin <rrd>
* @Date:   2017-03-29
* @Email:  dushaobin@we.com
* @Project: wern
* @Last modified by:   rrd
* @Last modified time: 2017-04-01
*/
//
// 命令的处理逻辑：
// 1.命令包含参数和子命令
// 2.如果没有子命令则处理参数
// 3.如果有子命令则处理子命令
// 4.如果子命令包含参数：先要判断子命令参数是否有特殊处理如果有则直接按照参数处理，否则按照子命令处理
// 5.如果子命令包含多个参数，并且多个参数有多个处理则一次处理，子命令处理忽略

const util = require('./utils/util');
const print = require('./utils/print');

const rootCommand = require('./commands/');
const conf = require('./config/conf');


function execCmd(opt, rootCmd, args, cmdHooks) {
    if (cmdHooks && cmdHooks.before) {
        // 使用shell 执行命令
        // cmdHooks.before(cmd,args);
        // 文件复制到临时目录，并且替换新的命令，设置指定的工作目录，然后启动命令
        util.execCmd(cmdHooks.before);
        // shelljs.exec(cmdHooks.before);
    }
    opt.action(rootCmd, args);
    if (cmdHooks && cmdHooks.after) {
        // cmdHooks.before(cmd,args);
        // shelljs.exec(cmdHooks.after);
        util.execCmd(cmdHooks.after);
    }
}

function prcessOptions(cmd, args, cmdHooks) {
    let isOptActionCalled = false;
    Object.keys(args).forEach((v) => {
        if (v === '_') {
            return;
        }
        // var opt = cmd.$options && cmd.$options[v];
        // 找出当前匹配的命令
        const opt = util.matchOpt(cmd, v.toString());
        if (opt && opt.action) {
            // 执行命令
            execCmd(opt, cmd, args, cmdHooks);
            // if (cmdHooks && cmdHooks.before) {
            //     // 使用shell 执行命令
            //     // cmdHooks.before(cmd,args);
            //     // 文件复制到临时目录，并且替换新的命令，设置指定的工作目录，然后启动命令
            //     util.execCmd(cmdHooks.before);
            //     // shelljs.exec(cmdHooks.before);
            // }
            // opt.action(cmd, args);
            // if (cmdHooks && cmdHooks.after) {
            //     // cmdHooks.before(cmd,args);
            //     // shelljs.exec(cmdHooks.after);
            //     util.execCmd(cmdHooks.after);
            // }
            isOptActionCalled = true;
        }
    });

    // 如果没有执行命令 重新调用一边, 对于没有子命令的情况下
    if (!isOptActionCalled) {
        // 当前命令就是 跟命令
        execCmd(cmd, cmd, args, cmdHooks);
    }
}

// 处理命令
function processCommand(args) {
    let isCmdVerifyed = true;
    const subCommands = args._;
    // 如果不存在子命令，立即执行
    if (subCommands.length < 1) {
        // 直接处理options
        prcessOptions(rootCommand, args);
        return;
    }

    let subCmd = rootCommand;
    let cmdHooks = {};
    const packages = util.getPckageInfo();
    if (packages && packages.leekConfig && packages.leekConfig.commands) {
        cmdHooks = packages.leekConfig.commands;
    }
    subCommands.forEach((v) => {
        if (cmdHooks && cmdHooks[v]) {
            cmdHooks = cmdHooks[v];
        }
        if (subCmd.commands && subCmd.commands[v]) {
            subCmd = subCmd.commands[v];
        } else {
            isCmdVerifyed = false;
            print.red(conf.text.cmdNotReg + v);
        }
    });

    if (!isCmdVerifyed) {
        return;
    }
    // subComs，最终定位到的命令
    prcessOptions(subCmd, args, cmdHooks);
}


module.exports = {
    processCommand,
};

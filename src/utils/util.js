/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-04-01
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-04-01
 */

const path = require('path');
const os = require('os');
const fs = require('graceful-fs');
const pad = require('pad');
const shelljs = require('shelljs');

const conf = require('../config/conf');
const print = require('./print');

const pwd = process.cwd();

const tmpDir = `${process.env.HOME}/.grnTemp/`;

// 该命令行必须在项目根目录运行
function getPckageInfo() {
    const packagePath = path.join(pwd, '/package.json');
    if (!fs.existsSync(packagePath)) {
        print.red('package.json文件不存在，请在项目根目录下运行');
        return false;
    }

    try {
        const pkg = fs.readFileSync(packagePath);
        return JSON.parse(pkg);
    } catch (e) {
        print.red(e);
        print.red('package.json 文件解析错误！');
        return false;
    }
}

// 检查当前目录是否是项目所在目录
// 判断标准：
// 1.是否包含package.json文件
// 2.react-native模块是否安装
// 3.

function checkProjectPkg() {
    const packagePath = path.join(pwd, '/package.json');
    if (!fs.existsSync(packagePath)) {
        print.red('package.json文件不存在，请在项目根目录下运行');
        return false;
    }
    try {
        const pkg = fs.readFileSync(packagePath);
        const pkgJSON = JSON.parse(pkg);
        if (pkgJSON.dependencies && pkgJSON.dependencies['react-native']) {
            print.out(`当前使用的RN版本: ${pkgJSON.dependencies['react-native']}`);
        } else {
            print.red('读取RN版本失败');
            return false;
        }
    } catch (e) {
        print.red('package.json 文件解析错误！');
        return false;
    }
    return true;
}

function checkProjectEnv() {
    if (!checkProjectPkg()) {
        return false;
    }
    const cliPath = path.join(pwd, '/node_modules/react-native/local-cli/cli.js');
    if (!fs.existsSync(cliPath)) {
        print.red('react native 模块没有安装');
        return false;
    }
    return true;
}

// 获取时间戳
function getTimesp() {
    const timesp = (new Date()).getTime();
    return () => `${timesp}`;
}

// 创建当前的临时时间戳
const currRunTimesp = getTimesp();

// 获取临时目录信息
function getTempDirs() {
    const timesp = currRunTimesp();
    const currDir = path.join(tmpDir, timesp, path.sep);
    return {
        tmpDir,
        currDir,
    };
}

function mkTempDir(dirName) {
    const tmpInfo = getTempDirs();
    try {
        if (!fs.existsSync(tmpInfo.tmpDir)) {
            fs.mkdirSync(tmpInfo.tmpDir);
        }
        fs.mkdirSync(path.join(tmpInfo.tmpDir, path.sep, dirName));
    } catch (e) {
        print.info(`创建临时目录: ${dirName} 失败`);
    }
}

// grn检查配置文件是否存在，如果不存在则直接打包
function getGRNConfig(callback) {
    const confPath = path.join(pwd, conf.cons.configFileName);
    fs.readFile(confPath, (err, data) => {
        if (err) {
            print.red(`读取配置文件失败: ${confPath}`);
            return;
        }
        try {
            const confData = JSON.parse(data);
            if (callback) {
                callback(confData);
            }
        } catch (e) {
            print.red(e);
            print.red(`配置文件格式错误: ${confPath}`);
        }
    });
}

// 填充空白字符
function piddingReset(str, len) {
    if (!str) {
        return '';
    }
    if (str.length > len) {
        return `${str.substr(0, len - 3)}...`;
    }
    return pad(str, len);
}

// 获取使用信息
function getUsageInfo(cmd, ccmd) {
    if (!cmd) {
        return null;
    }
    const rootCommand = cmd;
    const infos = [];
    if (ccmd) {
        infos.push(conf.text.usageTitle.replace('<{ccmd}>', ccmd));
    }

    if (rootCommand.commands) {
        infos.push(conf.text.commanTitle);
        Object.keys(rootCommand.commands).forEach((v) => {
            infos.push(piddingReset(`    ${rootCommand.commands[v].command}`, 50) + rootCommand.commands[v].description);
        });
    }

    if (rootCommand.options) {
        infos.push(conf.text.optionsTitle);
        Object.keys(rootCommand.options).forEach((v) => {
            infos.push(piddingReset(`    ${rootCommand.options[v].command}`, 50) + rootCommand.options[v].description);
        });
    }
    return infos;
}


// 输出命令行帮助文档
function printCmdHelp(cmd) {
    const infos = getUsageInfo(cmd);
    infos.forEach((v) => {
        print.out(v);
    });
}

function printCmdTitle(cmdName) {
    let cName = '';
    if (cmdName) {
        cName = `${cmdName} `;
    }
    print.out(conf.text.usageTitle.replace('<{ccmd}>', cName));
}

// 开启RN调试服务器
function startDebugServer() {
    // 检查当前的工作环境
    if (!checkProjectEnv()) {
        return;
    }
    // 检查配置文件
    getGRNConfig((confData) => {
        if (!confData) {
            print.red('grn 配置文件不存在');
            return;
        }
        // 开启服务
        const startCmd = 'node node_modules/react-native/local-cli/cli.js start';
        try {
            shelljs.config.silent = false;
            shelljs.exec(startCmd);
        } catch (e) {
            print.red(e);
            print.red('启动服务失败');
        }
    });
}

// 获取本机的ip地址
function getIpAddr() {
    const ifaces = os.networkInterfaces();
    const ips = [];
    Object.keys(ifaces).forEach((ifname) => {
        ifaces[ifname].forEach((iface) => {
            if (iface.family !== 'IPv4' || iface.internal !== false) {
                return;
            }
            ips.push(iface.address);
        });
    });
    return ips;
}

// 获取匹配的cmd
function matchOpt(cmd, opt) {
    let optCmd = null;
    if (!cmd || !cmd.$options || !opt) {
        return optCmd;
    }
    Object.keys(cmd.$options).forEach((v) => {
        if (!v) {
            return;
        }
        const ks = v.split(';');
        ks.forEach((vs) => {
            if (vs === opt) {
                optCmd = cmd.$options[v];
            }
        });
    });
    return optCmd;
}

// 匹配hooks
function matchHook(cmd, opt) {
    let optCmd = null;
    if (!cmd || !cmd.$options || !opt) {
        return optCmd;
    }

    Object.keys(cmd.$options).forEach((v) => {
        if (!v) {
            return;
        }
        const ks = v.split(';');
        ks.forEach((vs) => {
            if (vs === opt) {
                optCmd = cmd.$options[v];
            }
        });
    });
    return optCmd;
}

// 打开新的shell 窗口，需要动态生成脚本
function startServerInNewWindow(cmdSrc) {
    // const scriptFile = /^win/.test(process.platform) ? 'grnCmd.bat' : 'grnCmd.command';
    const launchPackagerScript = cmdSrc;
    const procConfig = { cwd: process.cwd() };
    if (process.platform === 'darwin') {
        return shelljs.exec(`open ${launchPackagerScript}`, procConfig);
    }
    if (process.platform === 'linux') {
        procConfig.detached = true;
        return shelljs.exec(`sh ${launchPackagerScript}`, procConfig);
    }
    if (/^win/.test(process.platform)) {
        procConfig.detached = true;
        procConfig.stdio = 'ignore';
        return shelljs.exec(`cmd.exe ${['/C', launchPackagerScript].join(' ')}`, procConfig);
    }
    print.red(`Cannot start the packager. Unknown platform ${process.platform}`);
    return false;
}

// 在新窗口中执行hook命令
function execCmd(cmdStr) {
    if (!cmdStr) {
        return;
    }
    const scriptFile = /^win/.test(process.platform) ? 'template.bat' : 'template.command';

    try {
        // 确保临时文件夹存在
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir);
        }
    } catch (e) {
        print.red('读取命令脚本失败', e);
        fs.mkdirSync(tmpDir);
    }

    const cmd = fs.readFileSync(path.resolve(__dirname, `../shell/${scriptFile}`), { encoding: 'utf8' });
    const newCmdFile = path.join(tmpDir, 'grnCmd.command');
    const currenWork = process.cwd();

    const newCmdStr = `cd ${currenWork}\n${cmdStr}`;
    const newCmds = cmd.replace('<{cmds}>', newCmdStr);
    try {
        const stat = fs.statSync(newCmdFile);
        if (stat.isFile()) {
            fs.unlinkSync(newCmdFile);
            fs.writeFileSync(newCmdFile, newCmds);
        }
    } catch (e) {
        print.red('读取命令脚本失败', e);
        fs.writeFileSync(newCmdFile, newCmds);
    }

    try {
        shelljs.chmod('-R', 'a+x', newCmdFile);
    } catch (e) {
        print.red('修改脚本权限失败', e);
    }

    startServerInNewWindow(newCmdFile);
}

// 对命令行做排序
function sortCmd(sourceCmd) {
    const sortedCmds = {};
    Object.keys(sourceCmd).sort().forEach((v) => {
        sortedCmds[v] = sourceCmd[v];
    });
    return sortedCmds;
}

function getNpmVersion() {
    return shelljs.exec('npm -v', { silent: true });
}

function getYarnVersion() {
    return shelljs.exec('yarn -v', { silent: true });
}

module.exports = {
    checkProjectEnv,
    getGRNConfig,
    getTimesp: currRunTimesp,
    getTempDirs,
    getUsageInfo,
    printCmdHelp,
    piddingReset,
    printCmdTitle,
    startDebugServer,
    checkProjectPkg,
    matchOpt,
    getIpAddr,
    getPckageInfo,
    execCmd,
    mkTempDir,
    matchHook,
    startServerInNewWindow,
    sortCmd,
    getNpmVersion,
    getYarnVersion,
};

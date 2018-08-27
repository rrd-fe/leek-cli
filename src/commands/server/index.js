/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-03-31
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-03-31
 */

const path = require('path');
const glob = require('glob');
const fse = require('fs-extra');
const chokidar = require('chokidar');
const chalk = require('chalk');

const util = require('../../utils/util');
const print = require('../../utils/print');
const conf = require('../../config/conf');
const serverUtil = require('./serverUtil');

const Command = require('../../base/Command');
const Option = require('../../base/Option');

const complieMap = {};

let watchListFile = [];

// 处理watch 列表
function processWatch(v, leekConf, serverConf) {
    if (!v) {
        return;
    }
    if (v.indexOf('#') > -1) {
        v = v.replace('#', '');
        watchListFile.push(path.join(leekConf.leekConfPath, serverConf.relPath, v));
    } else {
        const sourcePath = path.join(leekConf.leekConfPath, serverConf.relPath, v);
        try {
            const matchFiles = glob.sync(sourcePath);
            // tobeFiexed: remove
            // console.log('watch matchFiles:', sourcePath, matchFiles);
            watchListFile = watchListFile.concat(matchFiles);
        } catch (e) {
            print.red(conf.text.server.build.notFoundBuildSource, e);
        }
    }

    watchListFile = watchListFile.filter((item, pos) => {
        return watchListFile.indexOf(item) === pos;
    });
}

// 获取配置信息
function getLeeekConfigInfo() {
    const leekConfInfo = util.getLeekProjectInfo();
    if (!leekConfInfo) {
        print.red(conf.text.leekConfNotExist);
    }
    return leekConfInfo;
}

// 获取服务器配置信息
function getServerConfigInfo(leekConfInfo) {
    const serverPgkInfo = serverUtil.getServerPackage(leekConfInfo);
    if (!serverPgkInfo) {
        print.red(conf.text.serverPkgError);
    }
    return serverPgkInfo;
}

// 获取server构建配置
function getServerBuildConf(leekConfInfo, serverPgkInfo) {
    const serverBuildInfo = Object.assign({},
        serverPgkInfo.serverBuildConfig, leekConfInfo.leekConfData.server);
    // const leekConf = util.getLeekConfig();
    if (!serverBuildInfo) {
        print.err(conf.text.server.build.mustBeConf);
    }
    return serverBuildInfo;
}

function checkEnv() {
    const pkgInfo = util.getPckageInfo();
    if (!pkgInfo) {
        print.red(conf.text.pkgNotExist);
        return false;
    }
    const leekConfInfo = getLeeekConfigInfo();
    if (!leekConfInfo) {
        return false;
    }
    const serverPgkInfo = getServerConfigInfo(leekConfInfo);
    if (!serverPgkInfo) {
        return false;
    }
}

function buildServer() {
    const pkgInfo = util.getPckageInfo();
    if (!pkgInfo) {
        print.red(conf.text.pkgNotExist);
        return;
    }
    const leekConfInfo = getLeeekConfigInfo();
    if (!leekConfInfo) {
        return;
    }
    // tobeFixed: remove
    // print.info(leekConfInfo);

    const serverPgkInfo = getServerConfigInfo(leekConfInfo);
    if (!serverPgkInfo) {
        return;
    }
    // tobeFixed: remove
    // print.info('project server package info:', serverPgkInfo);

    const serverBuildInfo = getServerBuildConf(leekConfInfo, serverPgkInfo);
    // const leekConf = util.getLeekConfig();
    if (!serverBuildInfo) {
        return;
    }
    print.out(conf.text.server.build.startBuild);
    if (serverBuildInfo.contentPath) {
        serverBuildInfo.contentPath.forEach((v) => {
            if (v) {
                // todofixed: remove
                // print.out(serverBuildInfo);

                processWatch(v, leekConfInfo, serverBuildInfo);
                if (v.indexOf('#') > -1) {
                    v = v.replace('#', '*');
                }
                const sourcePath = path.join(leekConfInfo.leekConfPath, serverBuildInfo.relPath, v);
                const distPath = path.join(leekConfInfo.leekConfPath,
                    leekConfInfo.leekConfData.dist);
                try {
                    const matchFiles = glob.sync(sourcePath);
                    matchFiles.forEach((mf) => {
                        if (mf) {
                            const dbName = path.basename(mf);
                            fse.copySync(mf, path.join(distPath, dbName));
                            complieMap[mf] = path.join(distPath, dbName);
                        }
                    });
                } catch (e) {
                    print.red(conf.text.server.build.notFoundBuildSource, e);
                }
            }
        });
        print.out(conf.text.server.build.finishedBuild);
    } else {
        print.red(conf.text.server.build.notFoundConf);
    }
    // todoFixed: remove
    // console.log('当前需要监控文件列表:', watchListFile);
}

// 删除编译后的文件
function deleteFile(source) {
    if (!source) {
        return;
    }
    const pkgInfo = util.getPckageInfo();
    if (!pkgInfo) {
        print.red(conf.text.pkgNotExist);
        return;
    }
    const leekConfInfo = getLeeekConfigInfo();
    if (!leekConfInfo) {
        return;
    }
    // tobeFixed: remove
    // print.info(leekConfInfo);
    const serverPgkInfo = getServerConfigInfo(leekConfInfo);
    if (!serverPgkInfo) {
        return;
    }
    const serverBuildInfo = getServerBuildConf(leekConfInfo, serverPgkInfo);
    // const leekConf = util.getLeekConfig();
    if (!serverBuildInfo) {
        return;
    }
    const sourceList = Object.keys(complieMap);
    sourceList.forEach((v) => {
        if (!v) {
            return;
        }
        if (source.indexOf(v) > -1) {
            const target = complieMap[v];
            const relDir = source.replace(v, '');
            const targetPath = path.join(target, relDir);
            fse.removeSync(targetPath);
        }
    });
}

function startWatch() {
    print.out(conf.text.server.build.startWatch);
    if (watchListFile.length > 0) {
        const watcher = chokidar.watch(watchListFile, {
            ignored: /(^|[\/\\])\../,
        });
        watcher
            .on('ready', () => {
                // todoFixed: rmove
                // console.log('watch启动完成');
                print.out(conf.text.server.build.startWatchOver);
                watcher
                    .on('add', () => {
                        buildServer();
                    })
                    .on('change', () => {
                        buildServer();
                    })
                    .on('unlink', (wPath) => {
                        deleteFile(wPath);
                    })
                    .on('unlinkDir', (wPath) => {
                        deleteFile(wPath);
                    })
                    .on('error', (err) => {
                        print.red('watch error:', err);
                    });
            });
    }
}

const buildCmd = new Command({
    name: 'build',
    description: '构建服务端代码',
    command: 'build',
    action: (cmd, opts) => {
        // todofixed: remove
        // console.log('参数', opts)
        if (checkEnv() === false) {
            return;
        }
        buildServer();
        if (opts.watch || opts.w) {
            setTimeout(() => {
                startWatch();
            }, 1000);
        }
    },
});

buildCmd.addHelpSpec('构建服务端代码');
buildCmd.addHelpExample('   grn server build');

buildCmd.addOption('env', new Option({
    name: 'environment',
    command: '-e, --env',
    description: '当前构建的环境',
    actions: {
        'e;env': {
            action: (cmd) => {
                print.out('env options');
            },
        },
    },
}));

buildCmd.addOption('watch', new Option({
    name: 'watch',
    command: '-w, --watch',
    description: '当前构建的环境',
}));

const startServerCmd = new Command({
    name: 'start',
    description: '启动node服务',
    command: 'start',
    action: (cmd) => {

    },
});

startServerCmd.addHelpSpec('启动node服务');
startServerCmd.addHelpExample('   grn server start');


const serverCmd = new Command({
    name: 'server',
    description: 'node服务',
    command: 'server',
});
serverCmd.addHelpSpec('后端node服务');
serverCmd.addHelpExample('   grn server build -e production');


serverCmd.addSubCmd(startServerCmd);
serverCmd.addSubCmd(buildCmd);

module.exports = serverCmd;

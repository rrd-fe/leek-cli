
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
const shelljs = require('shelljs');
const webpack = require('webpack');

const allCmd = require('./all');

const util = require('../../utils/util');
const print = require('../../utils/print');
const conf = require('../../config/conf');
const dllConf = require('../../config/webpack.config.dll');

const Command = require('../../base/Command');
const Option = require('../../base/Option');


// 获取配置信息
function getLeeekConfigInfo() {
    const leekConfInfo = util.getLeekProjectInfo();
    if (!leekConfInfo) {
        print.red(conf.text.leekConfNotExist);
    }
    return leekConfInfo;
}

// 获取客户端package.json信息
function getClientConfigInfo(leekConfInfo) {
    if (!leekConfInfo) {
        return;
    }
    const clientPgkInfo = util.getPckageInfo(leekConfInfo.leekClientDir);
    if (!clientPgkInfo) {
        print.red(conf.text.serverPkgError);
    }
    return clientPgkInfo;
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
    const clientPkgInfo = getClientConfigInfo(leekConfInfo);
    if (!clientPkgInfo) {
        return false;
    }
}

function bundleDll(leekConfInfo, clientInfo, cmdOpts, clientPkgInfo) {
    let isProd = false;
    if (cmdOpts.e === 'production' || cmdOpts.env === 'production') {
        isProd = true;
    }

    let isWatch = false;
    if (cmdOpts.w || cmdOpts.watch) {
        isWatch = true;
    }

    const distDir = path.join(leekConfInfo.leekConfPath, leekConfInfo.leekConfData.dist);
    let jsEntrys = [];
    if (clientInfo.dll && clientInfo.dll.vendors) {
        jsEntrys = clientInfo.dll.vendors;
    }

    let cssEntrys = [];
    if (clientInfo.dll && clientInfo.dll.css) {
        cssEntrys = clientInfo.dll.css;
    }

    let resolveData = {};
    if (clientInfo.dll && clientInfo.dll.resolve) {
        resolveData = clientInfo.dll.resolve;
    }
    const distVendor = path.join(distDir, clientInfo.vendorDir);
    const publicPath = path.join(leekConfInfo.leekConfData.prefix, leekConfInfo.leekConfData.publicPath);
    const sassIncludePath = clientInfo.sassIncludePaths;
    const opts = {
        isProd,
        isWatch,
        distDir,
        jsEntrys,
        cssEntrys,
        resolve: resolveData,
        distVendor,
        publicPath,
        sassIncludePath,
        manifestConfDir: util.getManifestConfDir(leekConfInfo),
        module: clientInfo.module,
        plugins: clientInfo.plugins,
    };
    const dllWpConf = dllConf.getDllWPConf(opts);
    process.chdir(leekConfInfo.leekConfDir);
    util.startLoading('开始进行webpack编译');
    webpack(dllWpConf, (err, stats) => {
        const info = stats.toJson();
        util.stopLoading('编译结束');
        print.out(`编译耗时： ${(info.time / 1000)} s`);
        if (err || stats.hasErrors()) {
            if (stats.hasErrors()) {
                print.red('\n###################      webpack error      ####################\n');
                print.red(info.errors);
                print.red('\n\n');
            }

            if (stats.hasWarnings()) {
                print.yellow('\n###################      webpack warnings      ####################\n');
                print.yellow(info.warnings);
                print.yellow('\n\n');
            }
        }
    });
}


function bundleSource(opts) {
    const leekConfInfo = getLeeekConfigInfo();
    const clientPkgInfo = getClientConfigInfo(leekConfInfo);
    const clientInfo = Object.assign({}, conf.client, leekConfInfo.leekConfData.client);
    if (opts.m === 'dll' || opts.module === 'dll') {
        bundleDll(leekConfInfo, clientInfo, opts, clientPkgInfo);
        return;
    }

    if (opts.m === 'common' || opts.module === 'common') {
        
    }

}

const bundleCmd = new Command({
    name: 'bundle',
    description: '打包客户端资源',
    command: 'bundle',
    action: (cmd, opts) => {
        if (checkEnv() === false) {
            return;
        }
        bundleSource(opts);
    },
});

bundleCmd.addHelpSpec('打包客户端代码');
bundleCmd.addHelpExample('   grn bundle all');

bundleCmd.addOption('env', new Option({
    name: 'environment',
    command: '-e, --env',
    description: '当前构建的环境',
    actions: {
        'e;env': {
            action: (cmd) => {
            },
        },
    },
}));

bundleCmd.addOption('watch', new Option({
    name: 'watch',
    command: '-w, --watch',
    description: '监控文件变化自动构建代码',
}));

bundleCmd.addSubCmd(allCmd);

module.exports = bundleCmd;

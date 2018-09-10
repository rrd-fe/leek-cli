
/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-03-31
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-03-31
 */

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const _ = require('lodash');

const allCmd = require('./all');
const util = require('../../utils/util');
const print = require('../../utils/print');
const wpUtil = require('../../utils/webpackUtil');
const conf = require('../../config/conf');

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
        return null;
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
    return true;
}

function bundleDll(leekConfInfo, clientInfo, cmdOpts) {
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
    const distVendor = path.join(distDir, clientInfo.module.staticDir, clientInfo.vendorDir);
    const publicPath = path.join(leekConfInfo.leekConfData.prefix,
        leekConfInfo.leekConfData.publicPath);
    const sassIncludePath = clientInfo.dll.sassIncludePaths;
    const opts = {
        isProd,
        isWatch,
        distDir,
        jsEntrys,
        cssEntrys,
        resolve: resolveData,
        distVendor,
        publicPath: path.join(publicPath, clientInfo.vendorDir),
        sassIncludePath,
        manifestConfDir: util.getManifestConfDir(leekConfInfo),
        module: clientInfo.dll.module,
        plugins: clientInfo.dll.plugins,
        assetDir: clientInfo.assetsDir,
    };

    const dllConf = wpUtil.getWebpackConfInfo(leekConfInfo, 'dll');
    const dllWpConf = dllConf.getConfig(opts);
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

function bundleCommon(moduleName, pmoduleInfo, leekConfInfo, clientInfo, opts) {
    const moduleInfos = {
        entry: [],
        noEntry: [],
        watchFiles: [],
    };

    if (!pmoduleInfo || !pmoduleInfo[moduleName]) {
        print.out(`没有找到 ${moduleName} 模块`);
        return;
    }
    const mInfo = pmoduleInfo[moduleName];
    let isWatch = false;
    let isProd = false;
    let inlineCss = false;
    if (opts.w || opts.watch) {
        isWatch = true;
    }

    if (opts.e === 'production' || opts.env === 'production') {
        isProd = true;
    }

    if (opts.i || opts.inlineCss) {
        inlineCss = true;
    }

    const publicPath = path.join(leekConfInfo.leekConfData.prefix,
        leekConfInfo.leekConfData.publicPath);

    const distDir = path.join(leekConfInfo.leekConfPath, leekConfInfo.leekConfData.dist);

    let tplInfo = null;
    const pageName = opts.p || opts.page;
    if (_.isString(pageName) && pageName) {
        const specPagePath = path.join(mInfo.pagePath, pageName);
        if (!fs.existsSync(specPagePath)) {
            print.out('没有找到指定的页面');
            print.out(specPagePath);
            return;
        }
        // finalPath = specPagePath;
        tplInfo = wpUtil.findTpl(leekConfInfo, {
            moduleName,
            isWatch,
            isProd,
            publicPath,
            finalPath: specPagePath,
            incss: inlineCss,
            moduleDir: mInfo.moduleRoot, // 当前模块的路径 jsEntry是相对该目录的
            srcDir: path.join(leekConfInfo.leekClientDir, clientInfo.sourceDir), // 项目的源代码目录
            clientNodeModules: path.join(leekConfInfo.leekClientDir, './node_modules'),
            assetDir: clientInfo.assetsDir,
            sassIncludePath: clientInfo.common.sassIncludePaths,
            distDir,
            manifestDir: util.getManifestConfDir(leekConfInfo),
            commonJSName: 'manifest-commonDll.json',
            commonCssName: 'manifest-commonCss.json',
        }, clientInfo);
    } else {
        // 获取页面信息
        tplInfo = wpUtil.findTpl(leekConfInfo, {
            moduleName,
            isWatch,
            isProd,
            publicPath,
            finalPath: mInfo.pagePath,
            incss: inlineCss,
            moduleDir: mInfo.moduleRoot, // 当前模块的路径 jsEntry是相对该目录的
            srcDir: path.join(leekConfInfo.leekClientDir, clientInfo.sourceDir), // 项目的源代码目录
            clientNodeModules: path.join(leekConfInfo.leekClientDir, './node_modules'),
            assetDir: clientInfo.assetsDir,
            sassIncludePath: clientInfo.common.sassIncludePaths,
            distDir,
            manifestDir: util.getManifestConfDir(leekConfInfo),
            commonJSName: 'manifest-commonDll.json',
            commonCssName: 'manifest-commonCss.json',
        }, clientInfo);
    }
    const widgetInfo = wpUtil.findWidet(leekConfInfo, {
        moduleName,
        isWatch,
        isProd,
        publicPath,
        widgetPath: mInfo.widgetPath,
        incss: inlineCss,
    }, clientInfo);

    moduleInfos.entry = moduleInfos.entry.concat(tplInfo.entry);
    moduleInfos.noEntry = moduleInfos.noEntry.concat(tplInfo.noEntry);

    moduleInfos.entry = moduleInfos.entry.concat(widgetInfo.entry);
    moduleInfos.noEntry = moduleInfos.noEntry.concat(widgetInfo.noEntry);

    wpUtil.execBuildPage(moduleInfos, {
        moduleName,
        pageName,
    }, leekConfInfo);
    wpUtil.execBuildNoEntryPage(moduleInfos, leekConfInfo);
}

function bundleSource(opts) {
    const leekConfInfo = getLeeekConfigInfo();
    const clientPkgInfo = getClientConfigInfo(leekConfInfo);
    const clientInfo = Object.assign({}, conf.client, leekConfInfo.leekConfData.client);
    if (opts.m === 'dll' || opts.module === 'dll') {
        bundleDll(leekConfInfo, clientInfo, opts, clientPkgInfo);
        return;
    }
    const pmoduleInfo = wpUtil.getModuleInfos(clientInfo, leekConfInfo);
    const moduleName = opts.m || opts.module;
    if (_.isString(moduleName) && moduleName) {
        bundleCommon(moduleName, pmoduleInfo, leekConfInfo, clientInfo, opts);
    } else {
        print.out('没有指定打包的模块');
    }

    if (moduleName === 'all') {
        print.out('构建所有的模块');
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

bundleCmd.addSubCmd(allCmd);

module.exports = bundleCmd;

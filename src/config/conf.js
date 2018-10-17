/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-03-30
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-03-30
 */

const cons = {
    configFileName: '.leek.config.js', // 配置文件名
    projectShowName: 'Leek cli',
    commandName: 'leek',
    headerPaddig: '    ',
};

const text = {
    description: `${cons.projectShowName} 为leek项目提供快捷易用的命令`,
    usageTitle: `Usage: ${cons.commandName} <{ccmd}>[命令] [选项]`,
    commanTitle: '命令:',
    optionsTitle: '选项:',
    currentVersion: '当前版本: ',
    cmdNotReg: '命令未注册:',
    serverPkgError: '获取 server package 失败',
    clientPkgError: '获取 client package 失败',
    pkgNotExist: 'package.json文件不存在，请在项目根目录下运行',
    leekConfNotExist: '没有找到leek配置文件',
    pkgParseError: 'package.json 文件解析错误！',
    server: {
        build: {
            startBuild: '开始构建服务端代码...',
            finishedBuild: '构建成功',
            notFoundConf: '没有找相应的服务端配置',
            notFoundBuildSource: '找不到要打包的文件，检查配置是否有问题',
            startWatch: '正在启动watch服务...',
            startWatchOver: 'watch服务启动完成',
            mustBeConf: '没有找到服务编译配置, 必须配置需要编译的内容',
            notConfServerStart: '没有配置服务启动命令',
        },
    },
    init: {
        startGenConf: '开始生成配置文件',
        endGenConf: '配置文件生成完成',
        confExists: '配置文件已经被创建了',
        confFailed: '配置文件生成失败',
    },
    bundle: {
        all: {
            startComplie: '开始编译项目所有模块',
            endComplie: '项目所有模块完成',
        },
        notFundModule: '没有指定打包的模块',
        startComplie: '开始编译 模块: ',
        endComplie: '模块编译完成',
    },
};

const logo = {
    get val() {
        return (
            `
        :::            ::::::::::     ::::::::::     :::    ::: 
        :+:            :+:            :+:            :+:   :+:   
        +:+            +:+            +:+            +:+  +:+     
        +#+            +#++:++#       +#++:++#       +#++:++       
        +#+            +#+            +#+            +#+  +#+       
        #+#            #+#            #+#            #+#   #+#       
        ##########     ##########     ##########     ###    ###     

    ===============================================================
`);
    },
};

const client = {
    sourceDir: './src',
    vendorDir: 'vendor/',
    assetsDir: './assets/',
    webpackConfDirTmp: 'webpack.config.{name}.js',
    commonJSName: 'manifest-commonDll.json',
    commonCSSName: 'manifest-commonCss.json',
    cssModulesTypings: false,
    module: {
        pageDir: 'page/',
        uiDir: 'ui/',
        widgetDir: 'widget/',
        viewsDir: 'views/',
        staticDir: 'static/',
    },
    dll: {},
    common: {
    },
    base: {},
};

module.exports = {
    text,
    cons,
    logo,
    client,
};

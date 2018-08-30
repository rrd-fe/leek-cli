
const fs = require('fs');
const path = require('path');
const print = require('./print');
const conf = require('../config/conf');
const util = require('./util');

const webpackUtil = {
    // 获取模块详情
    getModuleInfos(clientConfInfo, leekConf) {
        const sourcePath = path.join(leekConf.leekClientDir, clientConfInfo.sourceDir);
        const webpackConfPath = util.getWebpackConfDir();
        const modules = {};
        try {
            let tmpMod = fs.readdirSync(sourcePath);
            tmpMod = tmpMod.filter((v) => {
                // 过滤掉无用的隐藏文件
                if (v.indexOf('.') === 0) {
                    return false;
                }
                modules[v] = {
                    configPath: path.resolve(webpackConfPath, conf.client.webpackConfDirTmp.replace('{name}', v)),
                    pagePath: path.resolve(sourcePath, v, conf.client.module.pageDir),
                    widgetPath: path.resolve(sourcePath, v, conf.client.module.widgetDir),
                    uiPath: path.resolve(sourcePath, v, conf.client.module.pageDir),
                };
                return true;
            });
        } catch (e) {
            print.red(e);
        }
        return modules;
    },
    buildDll() {

    },
};

module.exports = webpackUtil;
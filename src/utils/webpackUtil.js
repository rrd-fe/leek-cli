
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const webpack = require('webpack');

const print = require('./print');
const conf = require('../config/conf');
const util = require('./util');

const webpackUtil = {
    // 获取模块详情
    getModuleInfos(clientConfInfo, leekConf) {
        const sourcePath = path.join(leekConf.leekClientDir, clientConfInfo.sourceDir);
        const webpackConfPath = util.getWebpackConfDir(leekConf);
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
                    uiPath: path.resolve(sourcePath, v, conf.client.module.uiDir),
                    moduleRoot: path.resolve(sourcePath, v),
                };
                return true;
            });
        } catch (e) {
            print.red(e);
        }
        return modules;
    },
    findPage(pagePath, callback) {
        if (!pagePath || !callback) {
            return;
        }
        const lists = fs.readdirSync(pagePath);
        const info = this.dirInfo(lists, pagePath);
        if (info.hasTpl) {
            callback(info);
            return;
        }
        lists.forEach((v) => {
            const fPath = path.join(pagePath, v);
            const stat = fs.statSync(fPath);
            if (stat.isDirectory()) {
                this.findPage(fPath, callback);
            }
        });
    },
    dirInfo(files, pagePath) {
        if (!files || !pagePath) {
            return null;
        }
        const res = {
            hasTpl: false,
            hasJS: false,
            hasCss: false,
        };
        files.forEach((v) => {
            if (/\.tpl|\.html$/.test(v)) {
                res.hasTpl = true;
                res.tpl = path.join(pagePath, v);
            }
            if (/\.sass|\.css|\.scss$/.test(v)) {
                res.hasCss = true;
                res.css = path.join(pagePath, v);
            }
            if (/\.js|\.jsx|\.vue$/.test(v)) {
                res.hasJS = true;
                res.js = path.join(pagePath, v);
            }
        });
        return res;
    },
    complieTpl(configModule) {
        this.execBuildNoEntryPage(configModule);
        this.execBuildWidget(configModule);
    },
    // 构建没有js 入口的页面
    execBuildNoEntryPage(moduleInfos, leekConfInfo) {
        const watchFiles = [];
        if (!Array.isArray(moduleInfos.noEntry)) {
            return null;
        }
        const distDir = path.join(leekConfInfo.leekConfPath, leekConfInfo.leekConfData.dist);
        moduleInfos.noEntry.forEach((v) => {
            const distPath = path.join(distDir, v.config.viewPath);
            if (fs.existsSync(distPath)) {
                fse.removeSync(distPath);
            }
            if (v && v.info) {
                fse.copy(v.info.tpl, distPath);
            }
            if (v.config.watch) {
                watchFiles.push(v.info.tpl);
            }
        });
        return watchFiles;
    },
    // 构建 widget 
    execBuildWidget(moduleInfos, leekConfInfo) {
        const watchFiles = [];
        if (!Array.isArray(moduleInfos.noEntry)) {
            return null;
        }
        const distDir = path.join(leekConfInfo.leekConfPath, leekConfInfo.leekConfData.dist);
        moduleInfos.noEntry.forEach((v) => {
            const distPath = path.join(distDir, v.config.viewPath);
            if (fs.existsSync(distPath)) {
                fse.removeSync(distPath);
            }
            if (v && v.info) {
                fse.copy(v.info.tpl, distPath);
            }
            if (v.config.watch) {
                watchFiles.push(v.info.tpl);
            }
        });
        return watchFiles;
    },
    // 构建有js入口的页面
    execBuildPage(webpackConfigs, configModule, leekConfInfo) {
        if (webpackConfigs.entry.length < 1) {
            return;
        }
        const config = webpackConfigs.entry.shift();
        const finalConfig = configModule.getConfig(config);

        process.chdir(leekConfInfo.leekConfDir);
        util.startLoading('开始进行webpack编译');
        webpack(finalConfig, (err, stats) => {
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
            this.execBuildPage(webpackConfigs, configModule, leekConfInfo);
        });
    },
    findTpl(leekConf, options, clientInfo) {
        const entrys = {
            entry: [],
            noEntry: [],
        };
        if (!options) {
            return entrys;
        }
        const opts = Object.assign({}, {
            finalPath: '',
            moduleName: '',
            publicPath: '',
            isWatch: false,
            isProd: false,
            incss: false,
            moduleDir: '',
            srcDir: path.join(leekConf.leekClientDir, clientInfo.sourceDir), // 项目的源代码目录
            clientNodeModules: path.join(leekConf.leekClientDir, './node_modules'),
            assetDir: clientInfo.assestDir,
            sassIncludePath: clientInfo.common.sassIncludePath,
            distDir: '',
            manifestDir: '',
            commonJSName: '',
            commonCssName: '',
        }, options);

        this.findPage(opts.finalPath, (res) => {
            let jsEntryName = '';
            let jsPath = '';
            const relRoot = res.tpl.replace(leekConf.leekClientDir + path.sep, '');
            // const tplPath = relRoot.replace('/client/', '');
            let pagePath = path.dirname(relRoot);
            const srcRepStr = clientInfo.sourceDir.replace(/\W/ig, '') + path.sep;
            // const publicPath = path.join(opts.publicPath, pagePath.replace(srcRepStr, ''));
            pagePath = (`./${pagePath}`).replace(srcRepStr, '');
            if (res.hasJS) {
                jsPath = res.js.replace(leekConf.leekClientDir, '');
                jsPath = jsPath.replace('/' + srcRepStr + opts.moduleName + '/', './');
                jsEntryName = path.basename(res.js, path.extname(res.js));
            }
            const finalConfig = {
                // jsEntryName: jsEntryName,
                // jsEntry: jsPath,
                tplPath: relRoot,
                publicPath: path.join(opts.publicPath, pagePath) + path.sep,
                outputDist: path.join(opts.distDir, path.join(clientInfo.module.staticDir, pagePath)),
                cleanView: path.join(clientInfo.module.viewsDir, pagePath),
                cleanStatic: path.join(clientInfo.module.staticDir, pagePath),
                viewPath: relRoot.replace(srcRepStr, clientInfo.module.viewsDir),
                watch: opts.isWatch,
                isProd: opts.isProd,
                moduleName: opts.moduleName,
                incss: opts.incss,
                moduleDir: opts.moduleDir,
                distDir: opts.distDir,
                pageSource: res.tpl,
                srcDir: opts.srcDir,
                clientNodeModules: opts.clientNodeModules,
                assetDir: opts.assetDir,
                sassIncludePath: opts.sassIncludePath,
                pageDist: path.join(opts.distDir, relRoot.replace(srcRepStr, clientInfo.module.viewsDir)),
                commonJSName: opts.commonJSName,
                commonCssName: opts.commonCssName,
                manifestDir: opts.manifestDir,
            };

            if (jsEntryName) {
                finalConfig.jsEntryName = jsEntryName;
            }

            if (jsPath) {
                finalConfig.jsEntry = jsPath;
                entrys.entry.push(finalConfig);
            } else {
                entrys.noEntry.push({
                    config: finalConfig,
                    info: res,
                });
            }
        });
        return entrys;
    },
    findWidet(leekConf, options, clientInfo) {
        const entrys = {
            entry: [],
            noEntry: [],
        };
        if (!options) {
            return entrys;
        }
        const opts = Object.assign({}, {
            widgetPath: '',
            isWatch: false,
            isProd: false,
            incss: false,
        }, options);

        if (!fs.existsSync(opts.widgetPath)) {
            print.out('当前模块 不包含 widget 模块:', opts.widgetPath);
            return null;
        }
        this.findPage(opts.widgetPath, (widget) => {
            const relRoot = widget.tpl.replace(leekConf.leekClientDir, '');
            const srcRepStr = clientInfo.sourceDir.replace(/\W/ig, '') + path.sep;
            const finalConfig = {
                viewPath: relRoot.replace(srcRepStr, clientInfo.module.viewsDir),
                watch: opts.isWatch,
                isProd: opts.isProd,
                incss: opts.incss,
            };
            entrys.noEntry.push({
                config: finalConfig,
                info: widget,
            });
        });
        return entrys;
    },
};

module.exports = webpackUtil;

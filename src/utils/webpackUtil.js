
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const chokidar = require('chokidar');
// const webpack = require('webpack');

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
            const tmpMod = fs.readdirSync(sourcePath);
            if (tmpMod) {
                tmpMod.filter((v) => {
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
            }
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
            if (/\.js|\.jsx|\.vue|\.ts|\.tsx$/.test(v)) {
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
    // 获取webpack配置信息
    getWebpackConfInfo(leekConf, moduleName, pageName) {
        if (!moduleName) {
            return null;
        }
        // 优先获取 自定义配置，如果没有找到自定义配置 则使用默认配置
        const wpCustomDir = util.getWebpackConfDir(leekConf);
        let relName = '';
        if (moduleName) {
            relName += moduleName;
        }
        if (pageName) {
            relName += `.${pageName}`;
        }
        // 当 pageName 不存在的时候 relName === moduleName
        const pageConfName = `webpack.config.${relName}.js`;
        const moduleConfName = `webpack.config.${moduleName}.js`;
        let moduleConf = null;
        try {
            let configPath = '';
            // 判断是否存在 自定配置
            if (fs.existsSync(path.join(wpCustomDir, pageConfName))) {
                configPath = path.join(wpCustomDir, pageConfName);
            } else if (fs.existsSync(path.join(wpCustomDir, moduleConfName))) {
                configPath = path.join(wpCustomDir, moduleConfName);
            }
            // 如果不存在则 寻找 模块 配置是否存在
            const customConf = require(configPath); // eslint-disable-line global-require
            if (customConf.getConfig) {
                moduleConf = customConf;
            } else {
                moduleConf = {
                    getConfig() {
                        return customConf;
                    },
                };
            }
        } catch (e) {
            if (moduleName !== 'common' && moduleName !== 'dll') {
                moduleConf = require('../config/webpack.config.base.js'); // eslint-disable-line global-require
            } else {
                moduleConf = require(`../config/webpack.config.${moduleName}.js`);// eslint-disable-line global-require
            }
        }
        return moduleConf;
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
    execBuildPage(webpackConfigs, bundleInfo, leekConfInfo, onEnd) {
        if (webpackConfigs.entry.length < 1) {
            if (onEnd) {
                onEnd();
            }
            return;
        }
        const config = webpackConfigs.entry.shift();
        const configModule = this.getWebpackConfInfo(leekConfInfo,
            bundleInfo.moduleName, config.pageName);
        if (!configModule) {
            print.out(`没有找到对应的配置文件: 模块名 ${config.moduleName} 页面名 ${config.pageName}`);
            return;
        }
        config.jsonpFn = this.getJsonpName(bundleInfo.moduleName, config.pageName);
        const finalConfig = configModule.getConfig(config);
        process.chdir(leekConfInfo.leekConfDir);
        util.startLoading(`开始编译 模块: ${config.moduleName} 页面: ${config.pageName}`, bundleInfo.noLoading);
        const webpack = this.requireModule('webpack', leekConfInfo);
        webpack(finalConfig, (err, stats) => {
            const info = stats.toJson();
            util.stopLoading('编译结束', bundleInfo.noLoading);
            print.out(`编译耗时： ${(info.time / 1000)} s`);
            this.printWebpackError(err, stats, info);
            this.execBuildPage(webpackConfigs, bundleInfo, leekConfInfo, onEnd);
        });
    },
    getCustomConfigModule(clientInfo, moduleName) {
        let res = {};
        let realModuleName = '';
        if (moduleName !== 'common') {
            realModuleName = 'base';
        } else {
            realModuleName = moduleName;
        }
        res = Object.assign({}, clientInfo[realModuleName]);
        return res;
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
            sassIncludePath: '',
            distDir: '',
            manifestDir: '',
            commonJSName: '',
            commonCssName: '',
            cssModulesTypings: false,
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
                jsPath = jsPath.replace(path.sep + srcRepStr + opts.moduleName + path.sep, `.${path.sep}`);
                jsEntryName = path.basename(res.js, path.extname(res.js));
            }
            const finalConfig = {
                // jsEntryName: jsEntryName,
                // jsEntry: jsPath,
                pageName: path.dirname(relRoot.replace(srcRepStr, '').replace(opts.moduleName + path.sep, '').replace(clientInfo.module.pageDir, '')),
                tplPath: relRoot,
                publicPath: path.join(opts.publicPath, pagePath) + path.sep,
                outputDist: path.join(opts.distDir,
                    path.join(clientInfo.module.staticDir, pagePath)),
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
                sassIncludePath: clientInfo[opts.moduleName === 'common' ? 'common' : 'base'].sassIncludePaths,
                assetDir: opts.assetDir,
                pageDist: path.join(opts.distDir,
                    relRoot.replace(srcRepStr, clientInfo.module.viewsDir)),
                commonJSName: opts.commonJSName,
                commonCssName: opts.commonCssName,
                manifestDir: opts.manifestDir,
                template: clientInfo[opts.moduleName === 'common' ? 'common' : 'base'].template,
                cssModulesTypings: opts.cssModulesTypings,
            };
            const cuCnfInfo = this.getCustomConfigModule(clientInfo, opts.moduleName);
            finalConfig.modules = cuCnfInfo.module;
            finalConfig.resolve = cuCnfInfo.resolve;
            finalConfig.plugins = cuCnfInfo.plugins;
            finalConfig.fullCusConf = cuCnfInfo;
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
            print.out('当前模块不包含widget模块:', opts.widgetPath);
            return entrys;
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
    watchNoEntryTpl(watchListFile, dirInfo) {
        const watcher = chokidar.watch(watchListFile, {
            ignored: /(^|[/\\])\../,
        });

        watcher
            .on('ready', () => {
                // todoFixed: rmove
                // console.log('watch启动完成');
                // print.out('没有入口的文件watch 准备完成...');
                watcher
                    .on('change', (filePath) => {
                        const relFile = filePath.replace(dirInfo.srcDir, '');
                        const distFile = path.join(dirInfo.distDir, relFile);
                        // copy file
                        if (fs.existsSync(distFile)) {
                            fse.removeSync(distFile);
                        }
                        if (filePath) {
                            fse.copySync(filePath, distFile);
                        }
                        print.out('编译完成: ', relFile);
                    })
                    .on('unlink', (wPath) => {
                        // delete dist file
                        const relFile = wPath.replace(dirInfo.srcDir, '');
                        const distFile = path.join(dirInfo.distDir, relFile);
                        fse.removeSync(distFile);
                        print.out('编译完成: ', relFile);
                    })
                    .on('error', (err) => {
                        print.red('watch error:', err);
                    });
            });
    },
    // 优先从项目中加载模块，如果没有找到模块，从cli node_modules中加载模块
    requireModule(moduleName, leekConfInfo) {
        if (!module) {
            return null;
        }
        try {
            // project module
            const clientModule = path.join(leekConfInfo.leekClientDir, './node_modules');
            return require(path.join(clientModule, // eslint-disable-line global-require
                moduleName));
        } catch (err) {
            return require(moduleName); // eslint-disable-line global-require
        }
    },
    printWebpackError(err, stats, info) {
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
    },
    getJsonpName(moduleName, pageName) {
        const mn = moduleName || '';
        const pn = pageName || '';
        const funName = `${mn}-${pn}`;
        return `webpackJsonp_${util.hashStr(funName)}`;
    },
};

module.exports = webpackUtil;

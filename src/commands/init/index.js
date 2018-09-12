/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-03-31
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-03-31
 */

const fse = require('fs-extra');
const path = require('path');

const Command = require('../../base/Command');
const conf = require('../../config/conf');
const print = require('../../utils/print');
const util = require('../../utils/util');

// 初始化项目，选择项目的默认配置

// module.exports = {
//     prefix: '',
//     publicPath: '',
//     dist: '',
//     clientAlias: '',
//     isInlineCss: false,
//     leekManifsetDir: './.leek-manifest/',
//     projectType: 'react', // react、 vue、 jquery (第一版仅支持 react)
//     plugin: {
//         babel: {
//             enable: true,
//             options: {}
//         }
//     },
//     dll: {
//         entry: {
//             commonDll: vendors,
//             commonCss: [''],
//         },
//         module: [
//             'jquery',
//             'react',
//             'react-dom',
//         ],
//     },
//     common: {
//         resolveDir: [],
//         extensions: [],
//     },
//     page: {
//         resolveDir: [],
//         extensions: [],
//     },
//     ssr: {
//         ssrDir: '',
//     },
//     includeNodeModules: ['react', '@we-fe/component1'],
//     exclude:['moduleName/pageName'],
//     beforeLoadPage: () => {},
//     afterLoadPage: () => {},
//     beforeBuild: () => {},
//     afterBuild: () => {},
// }

const initCmd = new Command({
    name: 'init',
    description: `初始化${conf.cons.commandName}项目`,
    command: 'init',
    action: () => {
        const init = require('./init'); // eslint-disable-line global-require
        if (!util.getPckageInfo()) {
            print.red(conf.text.pkgNotExist);
            return;
        }
        // 获取leek config 路径
        const confPath = util.getConfigPath();
        if (fse.existsSync(confPath)) {
            print.red(conf.text.init.confExists);
            return;
        }
        print.info(`初始化${conf.cons.commandName}项目`);
        let gloConfig = {};
        init.eachQuestion(init.questionList, (res) => {
            gloConfig = Object.assign({}, gloConfig, res);
        }).then((res) => {
            gloConfig = Object.assign({}, gloConfig, res);
            // print.out('配置完成', gloConfig);
            util.startLoading(conf.text.init.startGenConf);
            const leekConfig = path.resolve(process.cwd(), gloConfig.leekConfig);
            // const distPath = path.resolve(process.cwd(), gloConfig.dist);
            // gloConfig.leekWebpackConfigDir = gloConfig.
            //    leekWebpackConfigDir.replace('{{leekConfig}}', leekConfig);
            const leekWebpackConfigDir = path.resolve(process.cwd(),
                gloConfig.leekWebpackConfigDir.replace('{{leekConfig}}', leekConfig));
            // gloConfig.leekManifsetDir = gloConfig.
            //    leekManifsetDir.replace('{{leekConfig}}', leekConfig);
            const leekManifsetDir = path.resolve(process.cwd(),
                gloConfig.leekManifsetDir.replace('{{leekConfig}}', leekConfig));

            try {
                if (init.isInitToServer(gloConfig)) {
                    gloConfig.configIn = 'server';
                } else {
                    gloConfig.configIn = 'client';
                }
                const confContent = `module.exports = ${JSON.stringify(gloConfig, null, 4)}`;

                // 写入配置文件
                fse.writeFileSync(confPath, confContent, { encoding: 'utf8' });

                // 清空并初始化dist
                // initDir(distPath);

                // 初始化leekconfig
                init.initDir(leekConfig);

                // 创建自定义配置文件目录
                init.initDir(leekWebpackConfigDir);

                // 创建自定义manifest 目录
                init.initDir(leekManifsetDir);
            } catch (e) {
                print.out(conf.text.init.confFailed);
                print.red(e);
            }
            // 创建对应的目录
            util.stopLoading(conf.text.init.endGenConf);
            if (gloConfig.configIn === 'server') {
                print.out('当前配置初始化在server目录');
            } else {
                print.out('当前配置初始化在client目录');
            }
        });
    },
});

initCmd.addHelpSpec(`初始化${conf.cons.commandName}项目`);
initCmd.addHelpExample(`${conf.cons.headerPaddig}${conf.cons.commandName} init`);


module.exports = initCmd;

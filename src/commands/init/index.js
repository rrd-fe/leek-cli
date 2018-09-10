/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-03-31
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-03-31
 */

const inquirer = require('inquirer');
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


function askQuestion(v) {
    const astOpt = Object.assign({}, v);
    return inquirer.prompt(astOpt).then(res => res);
}

const questionList = [
    {
        name: 'projectType',
        message: '项目类型 (当前版本仅支持react)',
        type: 'list',
        default: 0,
        choices: ['react', 'vue', 'raw'],
    },
    {
        name: 'prefix',
        message: '项目访问前缀:',
        default: '',
    },
    {
        name: 'publicPath',
        message: '项目的publicPath:',
        default: '/',
    },
    {
        name: 'dist',
        message: '项目打包输出地址:',
        default: '../../dist',
    },
    {
        name: 'clientAlias',
        message: '项目客户端目录:',
        default: 'client',
    },
    {
        name: 'isInlineCss',
        message: '是否把css打包为内联',
        type: 'list',
        default: 1,
        choices: ['true', 'false'],
    },
    {
        name: 'leekConfig',
        message: 'leek项目配置目录',
        default: './.leekConfig/',
    },
    {
        name: 'leekWebpackConfigDir',
        message: 'leek自定义配置webpack目录',
        default: '{{leekConfig}}/webpack/',
    },
    {
        name: 'leekManifsetDir',
        message: 'leek打包生成的manifest存放的目录',
        default: '{{leekConfig}}/manifest/',
    },
];

function eachQuestion(questions, callback) {
    let prom = Promise.resolve();
    questions.forEach((v) => {
        prom = prom.then((res) => {
            if (callback) {
                callback(res);
            }
            return askQuestion(v);
        });
    });
    return prom;
}

function initDir(distPath) {
    if (fse.existsSync(distPath)) {
        fse.emptyDirSync(distPath);
    } else {
        fse.mkdirpSync(distPath);
    }
}

// 当前运行的目录
function isInitToServer(gloConfig) {
    // 读取当前运行的所有目录，如果包含clientAlias 则运行在server 中 否则运行在 client中 目前仅支持 这两种情况
    // 对于client 如果包含 client 目录的情况，不符合当前的规定，运行则出现异常

    // 检查当前运行环境，是在client 还是 在server
    const dirs = fse.readdirSync(path.resolve(process.cwd()));
    let isServer = false;
    dirs.forEach((v) => {
        if (v) {
            const vdirs = v.split(path.sep);
            if (vdirs[vdirs.length - 1].indexOf(gloConfig.clientAlias) >= 0) {
                isServer = true;
            }
        }
    });
    return isServer;
}

const initCmd = new Command({
    name: 'init',
    description: `初始化${conf.cons.commandName}项目`,
    command: 'init',
    action: () => {
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
        eachQuestion(questionList, (res) => {
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
                if (isInitToServer(gloConfig)) {
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
                initDir(leekConfig);

                // 创建自定义配置文件目录
                initDir(leekWebpackConfigDir);

                // 创建自定义manifest 目录
                initDir(leekManifsetDir);
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

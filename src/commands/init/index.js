/**
 * @Author: dushaobin <rrd>
 * @Date:   2017-03-31
 * @Email:  dushaobin@we.com
 * @Project: wern
 * @Last modified by:   rrd
 * @Last modified time: 2017-03-31
 */

const inquirer = require('inquirer');

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
    return inquirer.prompt(astOpt).then((res) => {
        return res;
    });
}

const questionList = [
    {
        name: 'projectType',
        message: '项目类型?',
        type: 'list',
        default: 0,
        choices: ['react', 'vue', 'raw'],
    },
    {
        name: 'prefix',
        message: '项目访问前缀:',
        default: 'empty string',
    },
    {
        name: 'publicPath',
        message: '项目的publicPath:',
        default: '/',
    },
    {
        name: 'dist',
        message: '项目打包输出地址:',
        default: '{server}/../../dist',
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
        name: 'leekManifsetDir',
        message: 'leek打包生成的manifest存放的目录',
        default: './.leekManifest/',
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


const initCmd = new Command({
    name: 'init',
    description: `初始化${conf.cons.commandName}项目`,
    command: 'init',
    action: () => {
        if (!util.checkProjectEnv()) {
            return;
        }
        print.info(`初始化${conf.cons.commandName}项目`);
        let gloConfig = {};
        eachQuestion(questionList, (res) => {
            gloConfig = Object.assign({}, gloConfig, res);
        }).then((res) => {
            gloConfig = Object.assign({}, gloConfig, res);
            print.out('配置完成', gloConfig);
            util.startLoading('开始生成配置文件');
            // 写入配置文件

            // 创建对应的目录

            setTimeout(() => {
                util.stopLoading('配置文件生成完成');
            }, 10000);
        });
    },
});

initCmd.addHelpSpec(`初始化${conf.cons.commandName}项目`);
initCmd.addHelpExample(`${conf.cons.headerPaddig}${conf.cons.commandName} init`);


module.exports = initCmd;

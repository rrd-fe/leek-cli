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
    pkgNotExist: 'package.json文件不存在，请在项目根目录下运行',
    pkgParseError: 'package.json 文件解析错误！',
    init: {
        startGenConf: '开始生成配置文件',
        endGenConf: '配置文件生成完成',
        confExists: '配置文件已经被创建了',
        confFailed: '配置文件生成失败',
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

module.exports = {
    text,
    cons,
    logo,
};

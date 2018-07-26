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
    usageTitle: `Usage: ${cons.commandName} <{cmd}>[命令] [选项]`,
    commanTitle: '命令:',
    optionsTitle: '选项:',
    currentVersion: '当前版本: ',
    cmdNotReg: '命令未注册:',
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

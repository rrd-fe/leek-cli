#!/usr/bin/env node

// 从文件中安装，grape-rn-cli,在安装之前需要使用babel编译文件到指定目录然后进行安装
var shelljs = require('shelljs');

shelljs.exec('npm run build');
console.log('正在安装项目...');

shelljs.cd('.builded/');
shelljs.exec('npm install');
// 在全局安装
shelljs.exec('npm install -g .');

console.log('安装完成');

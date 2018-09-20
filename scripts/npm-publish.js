#!/usr/bin/env node

var shelljs = require('shelljs');

shelljs.exec('npm run build');

console.log('正在发布项目...');

// 在全局安装
shelljs.exec('npm publish .builded/');

console.log('成功发布到npm');

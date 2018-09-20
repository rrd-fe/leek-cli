#!/usr/bin/env node

var shelljs = require('shelljs');

var buildedDir = './.builded';

console.log('创建安装路径：' + buildedDir);

// 删除已存在的文件
shelljs.rm('-rf', buildedDir);

// 创建新目录
shelljs.mkdir(buildedDir);

console.log('编译文件：开始');

// 编译bin文件
shelljs.exec('./node_modules/babel-cli/bin/babel.js ./bin -d .builded/bin');

// 编译源代码
shelljs.exec('./node_modules/babel-cli/bin/babel.js ./src -d .builded/src');

// 编译cli.js文件
shelljs.exec('./node_modules/babel-cli/bin/babel.js ./cli.js --out-file  .builded/cli.js');

// 复制command 命令
console.log('复制command 文件');
shelljs.cp('-Rf', './src/shell', '.builded/src/shell');

console.log('复制README.md文件');
shelljs.cp('./README.md', '.builded/README.md');

// 复制readme文件
console.log('复制package.json文件');
shelljs.cp('./package.json', '.builded/package.json');

console.log('编译文件：结束');

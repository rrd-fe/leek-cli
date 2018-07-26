# grape rn 命令行工具

## 简介

### grn命令

#### init http://gitlab.we.com/grapecli.git
初始化化项目 指定一个git地址   

1.把指定的git项目克隆到当前目录（不用开发）    
2.设置npm registry到私有地址     
3.安装相关依赖    
4.检查ReactNative cli是否安装，如果没有安装并安装     
5.检查项目配置文件.grnrc文件

打包相关：
bundle：打包

release：发布到线上

qrcode：生成开发的二维码

whoami：当前登录的用户

run-ios: 运行ios项目 需要android 项目

run-android:运行android项目 需要ios 项目

start：打开调试服务器

version：当前的版本

help：帮助


服务管理：    

login：登录    

logout：退出   

app：curd    

deply：curd     

deplyLog：r     


## 开发说明

### 配置文件

1.在发布正式包的时候，采用了多个bundle的方式，RN在bundle的时候会把
每个模块的路径转为数字id,一直向上累加，多次打包都是从零开始，为了解决这个问题
我们需要一个配置文件 .grnrc ,一个json文件格式的配置文件，包含了模块和该模块
的id起始数字的映射关系     
例如：    

```js
//.grnrc文件
{
    "common":[ //业务依赖的内容
        "./src/common.js"
    ],
    "bus":{ //相关业务
        "./src/fof.entry.js":10000,
        "./src/fund.entry.js":20000,
        "./src/p2p.entry.js":30000
    },
    ios:{
        output:"../../RNBundle/",
    },
    android:{
        output:"../../RNBundle/",
    },
    debugIndex:"./src/index.debug.js" //用户开发调试的入口
}
```

### qrcode 二维码
根据二维码打开指定的页面
1.需要开启本地服务
2.传入相应的参数，SDK跟进参数进行相应的动作
3.定义一个指定的scheme，好处不管是浏览器或者APP都可以扫描识别，并打开指定的页面

假如：grn://127.0.0.1:8081/?pageId=123&params=encodeURIComponent("参数")

sdk：解析出来参数进行跳转

### cli 安装
1.从源代码安装     
```
    //先克隆代码
    git clone http://gitlab.we.com/we-tech-fe/grape-rn-cli.git

    //安装依赖
    npm install
    npm install -g babel-cli babel-node-debug

    //安装grn cli
    npm run install-from-local

```

2.从npm 安装    
```
    //安装grn cli 私有的 npm.we.com
    npm install -g grn-cli

```

## 开发环境
对开发环境的分类

### 本机开发环境
为开发人员开发调试使用

### 测试环境
为测试人员提供测试用的

### 预发布环境
测试完成后需要重新验证

### 正式环境
用户正常使用的环境


## TODO: 代码需要重构   

1.重复代码多（完善一部分）    
2.项目结构不够合理（完善一部分）
3.全部改为ES6语法（完善一部分）
4.新增调试命令
5.完善注释和说明

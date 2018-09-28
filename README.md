# leek 命令行工具

## 简介

基于webpack开发的打包工具，为了避免webpack的复杂配置针对公司多页面架构，   
以及 React + webpack + Nodejs的开发栈，如果是简单项目只需在进行init操作，配置基础的   
dll 包含的依赖包就可以完成配置

## 功能说明

在工具是针对多页面的React架构进行开发的，如果项目非该结构，建议直接使用webpack配置，
使用这个工具反而增加了复杂度，虽然也可以满足需求

项目结构(实例)：

```
----project
    ----dist
    ----doc
    ----client  前端代码
        ----config     项目使用配置
        ----doc     项目说明文档
        ----scripts     项目可能用到的脚本
        ----src     项目源代码
            ----common      包含项目通用的代码
                ----page    项目的模板
                    ----layout1     模板
                        ----assets      模板用到资源
                        ----layout.tpl      模板
                        ----layout.js       模板执行的脚本
                        ----layout.scss     模板使用样式文件
                    ----layout2
                ----static      通用的资源，样式库、字体、第三方类库
                ----ui      项目中通用的 React 组件
                ----widget      项目使用的通用 widget
                    ----wgt1      
                        ----wgt.tpl     模板
                    ----wgt2
            ----module1     项目模块
                ----page        模块中的页面
                    ----page1       页面
                        ----assets      页面使用的资源     
                        ----page.tpl    页面模板
                        ----page.js     页面使用脚本
                        ----page.scss   页面用到的样式文件
                    ----page2
                ----ui
                ----widget
            ----module2
        ----vendor
        ----package.json
        ----yarn.lock
    ----src
    ----package.json
    ----yarn.lock
```

1. 支持对指定的模块进行自定义配置
2. 支持对指定页面进行自定义配置
3. 支持对现有配置进行覆盖，需要在配置中完全自定义，如果自定义会覆盖现有的所有配置
4. 支持在server 目录 和 client 目录下进行运行命令

约束：

1. 原则上每个页面下面只能有一个js、jsx、ts、tsx文件， 一个样式文件
2. 页面用使用到资源需要用过js文件来进行引用
3. 每个项目只能配置一个 dll配置
4. 每个项目有一个基础的配置，可以对某些指定的模块进行配置

文件说明：

项目的配置文件默认为: .leek.config.js     
项目生成一文件会放在: .leekConfig/     

自定义webpack 配置 需要修改 .leekConfig/webpack/       
webpack配置文件命名：webpack.config.[模块名].[页面名].js       


## 安装

使用    
npm install -g leek-cli    
yarn install -g leek-clig

## 使用

```
leek                    默认命令
leek init               初始化项目
leek server             服务端命令
leek server build       构建服务端代码
leek server start       启动服务
leek bundle             构建前端代码
leek bundle all         构建前端所有模块
leek debug              调试前端模块 暂未实现
```

命令实例：

````


        :::            ::::::::::     ::::::::::     :::    :::
        :+:            :+:            :+:            :+:   :+:
        +:+            +:+            +:+            +:+  +:+
        +#+            +#++:++#       +#++:++#       +#++:++
        +#+            +#+            +#+            +#+  +#+
        #+#            #+#            #+#            #+#   #+#
        ##########     ##########     ##########     ###    ###

    ===============================================================

    当前版本: 0.0.8
    Leek cli 为leek项目提供快捷易用的命令

命令:
    bundle                                        打包客户端资源
    debug                                         调试应用
    init                                          初始化leek项目
    server                                        后端node服务
选项:
    -v, --version                                 显示当前版本
    -h, --help                                    帮助说明

````

## 配置模板

参考 leek-config-boilerplate 项目


## 开发说明

整个工具命令行是一个树状结构

```
root 命令 
    ---- 命令1
        ---- 命令1-1
        ---- 命令1-2
    ---- 命令2 
    ---- 命令3 
```

每一个命令都对应一个动作，每个动作可以接受指定的参数 参数通过 -[opt] 或则 --[opt] 传入

通常情况下这样没问题，但是有些特殊的参数对应的是一些命令比如 leek -v 或者 leek -h 并不是root跟命令，而是输入 leek的版本号 或者 打印 leek 版本信息


另外 对于正常命令会通过命令树 找对对应的指令并且配置响应的参数，会尽量找最深的命令配置，如果没有找到则说明输入有误。


## 需要优化的内容
1. webpack 多个实例chuunk id优化
2. webpack 增加并行编译

## 已知问题
1. 使用nvm 安装首次 **有可能**  需要关闭 shell 重新打开
2. 在js直接引用css文件使用 
```
improt 'e/b.css';
```
相关链接：
https://github.com/webpack-contrib/mini-css-extract-plugin/issues/27 好像直接引用单个css文件没问题，这个需要重新确认

目前已知的解决方法：
1. 添加sass文件 使用 sass文件引用
2. 使用require();
3. 添加babel插件支持 css导入(正在调研该方法)



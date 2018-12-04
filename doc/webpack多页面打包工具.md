# webpack 多页面打包工具 Leek cli

1. 项目背景
    1. 目前公司项目的现状
        1. 基于fis开发
        2. 固定nodejs 版本
        3. 使用的工具版本？
    2. 目前项目存在的问题
        1. fis 社区能力（离来源社区，比较远，没有升级维护，第三方的开源项目支持不够好，node_modules包机制, ES6模块化规范，非主流，）
        2. 工具的升级
        3. nodejs 版本升级
    3. 项目需要引入新的能力 （暂时不用）
        1. typescript能力
        2. 更通用工具（模板引擎）
        3. 快速开发模式



2. 分析问题

    1. 把问题转化为实际的需求
        1. 跟原有的开发模式不要有太大的变化，学习成本
        2. 使用webpack（整理）
        3. 支持react、es7语法
        4. 支持多页面、多模块
        5. 页面自动引入相应的资源
        6. inlinecss、postcss、cssModules、autoprefixer、高级压缩支持
        7. 图片的自动优化
        8. ssr方案
        9. 扩展性

        期望中的规范，多页面，多模块，=》 规范
        => 支持的能力 =》打包部署结构

        先规范，然后总结要做那些工作

        


    2. 把需求按照 按照技术要素进行归类
        1. 开发规范
            1. 定义概念
                1. 模块
                2. 组件
                3. 页面
                4. 模板
                5. widget
            2. 部署目录
                ```
                ---- view
                ---- static
                ---- modules
                ```
            3. 开发目录
                ```
                ---- client
                     ---- src
                ---- src
                ```
            4. 模块、页面、命名、结构
        2. 模块化开发
            1. 模块定义
            2. 同步、异步支持
            3. 模块引用
            4. 组件化开发
                1. 公共模块
                2. widget
                3. 私有模块
        3. 框架：
            1. 性能优化
                1. css
                2. js
                3. 资源
            2. 项目部署
            3. 开发流程
                1. 项目初始化
                2. 项目配置
            4. 开发工具
                1. style
                2. css
                4. html
                5. file
                6. webpack dev

3. 开发实现

    通过渐进式说明 而不是分解式说明

    1. 使用webpack配置一个简单的页面

    2. 使用webpak配置css支持

    3. 使用webpack配置，图片、字体资源的支持

    4. 使用webpack自动更新html页面资源

    5. 配置多模块支持

    6. 支持部署目录结构

    7. 优化工具



4. 总结

    1. 为什么这么做？
    2. 后续需要的改进




    ==================== 分割线 ==================

    1. 定义实现的功能
        ```
        leek 
        leek init
        leek server 
        leek server build
        leek server run
        leek bundle 
        leek bundle -m [module] -p [page] -w -e [env]
        leek bundle all
        leek bundle all -m [module] -p [page] -w -e [env]
        leek dev (暂无)
        ```
    2. bundle 流程     
        -- 扫描项目    
        -- 找到对应的模块、页面和项目入口     
        -- 配置webpack 并 打包dll     
        -- 配置webpack 并 打包common  
        -- 配置webpack 并 打包页面   

    

6. 问题和优化 （分散到开发实现中）
    1. 问题   
        1. webpack 多实例
        2. webpack html模板
        3. babel package.json
        4. autoprefix 配置
        5. sass http 协议丢失
        6. es6 sideEffect 问题
        7. class-properties 和 decorators
        8. node-sass require version > 4.0.0
        9. module.rules 合并
        10. inline css
    2. 优化
        1. typescript 支持
        2. 并行多线程打包 (暂无)
        3. cache 打包
        4. HRM支持 (暂无)
        5. nodeEnv
        6. watch
        7. stats
        8. tree shaking


## 备注

考虑的技术元素：
1. 开发规范
2. 模块化开发
3. 组件化开发
4. 组件仓库
5. 性能优化
6. 项目部署
7. 开发流程
8. 开发工具


原文结构：

1. 引言，定义需求
2. 需求整理 分类
3. 梳理规范 （语义的开发概念）
    1. 概念定义
    2. 开发目录定义，结合需求
    3. 部署目录定义
4. 解决问题
    1. 解决开发和部署规范的连接
    2. 模块化（模块管理，资源加载，性能优化）
    3. 工具支持（image、css，cli，autoreload，mock）
5. 总结
    1. 设计开发概念，定义开发资源的分类（模块化/非模块化）
    2. 设计开发目录，降低开发、维护成本（开发规范）
    3. 根据运维和业务要求，设计部署规范（部署规范）
    4. 设计工具，完成开发目录和部署目录的转换（开发-部署转换）
    5. 设计模块化框架，兼顾性能优化（开发框架）
    6. 扩展工具，支持开发框架的构建需求（框架构建需求）
    7. 流程整合（开发、测试、联调、上线等流程接入）


过程中引入问题和解决问题





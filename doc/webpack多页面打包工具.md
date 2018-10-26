# webpack 多页面打包工具 Leek cli

1. 项目背景 

2. 面临的问题

3. 解决思路

4. 相关调研

5. 实现思路
    1. 定义项目需求
    2. 定义实现的功能
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
    3. bundle 流程     
        -- 扫描项目    
        -- 找到对应的模块、页面和项目入口     
        -- 配置webpack 并 打包dll     
        -- 配置webpack 并 打包common  
        -- 配置webpack 并 打包页面   
6. 问题和优化
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




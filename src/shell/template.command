#!/usr/bin/env bash

# 启动命令行模板文件

# Set terminal title
echo -en "\033]0;grape rn cli\a"
clear

THIS_DIR=$(dirname "$0")
pushd "$THIS_DIR"
<{cmds}>
popd

echo "Process terminated. Press <enter> to close the window"
read

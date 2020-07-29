#! /usr/bin/env node
/*
1.通过npm init --y初始化一个node项目
2.创建一个JS文件, 并且在JS文件的头部通过
#! /usr/bin/env node告诉系统将来这个文件需要在NodeJS环境下执行
3.在package.json中新增bin的key, 然后这个key的取值中告诉系统需要新增什么指令, 这个指令执行哪个文件
"bin": {
    "nue-cli": "./bin/index.js"
  }
4.通过npm link将本地的包连接到全局
* */
console.log('www.it666.com');
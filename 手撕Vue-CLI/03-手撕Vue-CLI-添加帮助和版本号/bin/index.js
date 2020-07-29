#! /usr/bin/env node
const program = require('commander');
const { version } = require('./const');

// console.log('www.it666.com');
// console.log(process.argv);
// if(process.argv[2] === '--help'){
//     // 输出帮助文档
// }else if(process.argv[2] === '--version'){
//     // 输出当前的版本号
// }
// commander包 --> 能够快速的处理自定义指令传递进来的参数
// 只需要将传递进来的参数直接传递给parse方法, 那么commander包就自动帮我们实现了--help
// program.parse(process.argv);
// 只需要在调用parse方法之前先调用version方法, 告诉它当前的版本号, 那么commander包就自动帮我们实现了--version
// program.version('1.0.0').parse(process.argv);
program.version(version).parse(process.argv);

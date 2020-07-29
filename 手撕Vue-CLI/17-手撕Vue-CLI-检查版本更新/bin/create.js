const axios = require('axios');
const ora = require('ora');  // download进度
const inquirer = require('inquirer');  // 用户选择交互
let DownloadGitRepo = require('download-git-repo');  // 用于下载github仓库的具体项目到本地某个文件夹
// 通过NodeJS的util中的promisify方法, 可以快速的将回调函数的API转换成Promise的API
const { promisify } = require('util');  // nodejs的util有promisfy的方法
const path = require('path');
let ncp = require('ncp'); // 文件夹拷贝包
const shell = require('shelljs');
const chalk = require('chalk');  // 粉笔库，用于修改提示信息的颜色
const fs = require('fs');
let { render } = require('consolidate').ejs;  // 利用用户填写的信息快速编译模板
const updateNotifier = require('update-notifier');  // npm包检查工具，检查包是否存在更新，传给他package.json，自带比对
const pkg = require('../package.json'); // 读取我们的package.json
const boxen = require('boxen'); // 那种圆圈，中间有字的输出

render = promisify(render);  // 回调该promise
const exec = promisify(shell.exec); // 转换shelljs的执行指令
const Metalsmith = require('metalsmith');  // 编译文件的库
const { downloadDirPath } = require('./const');  // 临时存放下载下来的template的目录

ncp = promisify(ncp);
DownloadGitRepo = promisify(DownloadGitRepo);  // 把原来是回调的改造成promise

const getTemplateNames = async () => {
  const { data } = await axios.get('https://api.github.com/orgs/it666-com/repos');
  return data;
};
const getTemplateTags = async (currentTemplateName) => {
  const { data } = await axios.get(`https://api.github.com/repos/it666-com/${currentTemplateName}/tags`);
  return data;
};
const waitLoading = (message, fn) => async (...args) => {
  const spinner = ora(message);
  spinner.start();
  const data = await fn(...args);
  spinner.succeed(`${message} successfully`);
  return data;
};
const downloadTemplate = async (templateName, templateTag) => {
  // 组织机构的名称/模板名称#模板版本号
  // 1.拼接模板在github上的路径
  let url = `it666-com/${templateName}`;
  if (templateTag) {
    url += `#${templateTag}`;
  }
  // 2.拼接存储下载好的模板的路径（每个模板新建一个目录）
  const destPath = `${downloadDirPath}\\${templateName}`;
  // 3.下载模板
  await DownloadGitRepo(url, destPath);
  // 4.将保存模板的路径返回给调用者
  return destPath;
};
const installDependencies = async (projectName) => {
  // 1.进入创建的项目目录
  shell.cd(projectName);  // shelljs指令
  // 2.执行Npm install指令
  await exec('npm install');
};
const checkVersion = () => {
  const notifier = updateNotifier({
    pkg,
    updateCheckInterval: 0,
  });

  const { update } = notifier;  // 如果有更新，update就有值
  if (update) {
    const messages = [];
    messages.push(
      `${chalk.bgYellow.black(' WARNI: ')}  Nue-Cli is not latest.\n`,
    );
    messages.push(
      chalk.grey('current ')
        + chalk.grey(update.current)
        + chalk.grey(' → ')
        + chalk.grey('latest ')
        + chalk.green(update.latest),
    );
    messages.push(
      `${chalk.grey('Up to date ')} npm i -g ${pkg.name}`,
    );

    console.log(boxen(messages.join('\n'), {
      padding: 2,
      margin: 2,
      align: 'center',
      borderColor: 'yellow',
      borderStyle: 'round',
    }));
  }
};

module.exports = async (projectName) => {
  // 0.检查脚手架更新
  checkVersion();
  const destPath = path.resolve(projectName);
  console.log(chalk.green('✨  Creating project in ') + chalk.red(`${destPath}`));
  // 1.拉取所有模板名称
  const data = await waitLoading('downloading template names', getTemplateNames)();
  const templateNames = data.map((obj) => obj.name);

  // 2.让用户选择指定的模板名称
  const { currentTemplateName } = await inquirer.prompt({
    name: 'currentTemplateName',
    type: 'list',
    choices: templateNames,
    message: '请选择要使用哪个模板来创建项目',
  });

  // 3.获取用户指定模板的所有版本号
  const data2 = await waitLoading('downloading template tags', getTemplateTags)(currentTemplateName);
  const templateTags = data2.map((obj) => obj.name);

  // 4.让用户选择使用指定模板的哪一个版本来创建项目
  const { currentTemplateTag } = await inquirer.prompt({
    name: 'currentTemplateTag',
    type: 'list',
    choices: templateTags,
    message: '请选择要使用选择模板的哪一个版本来创建项目',
  });

  // 5.下载用户选择的模板
  console.log(chalk.green('✨  Initializing git repository...'));
  const sourcePath = await waitLoading('downloading template', downloadTemplate)(currentTemplateName, currentTemplateTag);

  const askPath = path.join(sourcePath, 'ask.js');
  if (!fs.existsSync(askPath)) {  // 检查是否存在ask.js编译文件，没有就直接拷贝
    // 6.将用户目录中的模板拷贝到执行指令的路径中
    await waitLoading('copying template', ncp)(sourcePath, destPath);
  } else {
    // 6.将用户目录中的模板编译后再拷贝到执行指令的路径中
    await new Promise((resolve, reject) => {  // promise包装下
      Metalsmith(__dirname) // 这个参数没用，因为我们不是遍历当前目录
        .source(sourcePath) // 告诉Metalsmith真正需要遍历的目录是谁
        .destination(destPath) // 告诉Metalsmith编译完的文件放到什么地方
        .use(async (files, metal, done) => {  // 遍历所有文件
          // 1.让用户填写配置信息
          const config = require(askPath);
          const result = await inquirer.prompt(config); // 注意这里传入的是一个数组，inquirer可以接受对象或数据
          const meta = metal.metadata(); // metal传递参数
          Object.assign(meta, result);
          done();  // 代表这个执行完了
        })
        .use((files, metal, done) => {
          const result = metal.metadata();
          // 2.根据用户填写的配置信息编译模板
          // 2.1遍历拿到所有文件路径
          Reflect.ownKeys(files).forEach(async (filePath) => {
            // 2.2提取我们需要处理的问题
            if (filePath.includes('.js') || filePath.includes('.json')) {
              // 2.3获取当前文件的内容
              const fileContent = files[filePath].contents.toString();
              // 2.4判断当前文件的内容是否需要编译，有ejs模板才需要编译
              if (fileContent.includes('<%')) {
                const resultContent = await render(fileContent, result);
                files[filePath].contents = Buffer.from(resultContent);
              }
            }
          });
          done();
        })
        .build((err) => {  // 调用执行
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
    });
  }

  // 7.安装相关的依赖
  console.log(chalk.green('✨  Initializing dependencies...'));
  await waitLoading('install dependencies', installDependencies)(projectName);

  // 8.显示创建成功之后的提示信息
  console.log(chalk.green(' Successfully created project ') + chalk.red(`${projectName}.`));
  console.log(chalk.green(' Get started with the following commands:'));
  console.log(chalk.magenta(`$ cd ${projectName}`));
  console.log(chalk.magenta('$ npm run serve'));
};

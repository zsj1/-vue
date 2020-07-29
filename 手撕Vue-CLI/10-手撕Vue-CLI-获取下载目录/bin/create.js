const axios = require('axios');
const ora = require('ora');
const inquirer = require('inquirer');

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

module.exports = async (projectName) => {
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
  /*
  1.拿到模板名称和版本号之后应该下载模板
  2.如何下载?下载到什么地方
  官方的Vue-CLI会先将模板下载到'用户目录'中, 然后再拷贝到'执行指令的目录'中
  3.为什么要先下载到用户目录中?
  因为下载好的模板可能还需要进行一些其它操作
  * */
};

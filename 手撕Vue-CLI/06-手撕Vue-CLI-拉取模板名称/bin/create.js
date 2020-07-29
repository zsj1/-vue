const axios = require('axios');
const ora = require('ora');

const getTemplateNames = async () => {
  const { data } = await axios.get('https://api.github.com/orgs/it666-com/repos');
  return data;
};

module.exports = async (projectName) => {
  /*
  1.create指令的本质
  从网络上下载提前准备好的模板,然后再自动安装模板中的相关依赖
  2.所以实现create指令分为两步
  2.1下载指定模板
  2.2安装相关依赖
  * */
  /*
  1.ora包的作用:
  用于在终端中添加loading效果
  1.1安装 npm install ora 并导入 const ora = require('ora');
  1.2通过 ora('message') 创建loading
  1.3.调用start方法显示loading, 调用succeed隐藏loading
  * */
  // console.log('create', projectName);
  const spinner = ora('downloading template names');
  spinner.start();
  const data = await getTemplateNames();
  const templateNames = data.map((obj) => obj.name);
  spinner.succeed('download template names successfully')
  console.log(templateNames);
};

# 小张博客 ZhangBlog  

## 快速上手  
### 先决条件  
- [npm](https://www.npmjs.com/) 以及 [Vercel CLI](https://vercel.com/docs/cli)  
- [MongoDB Compass](https://www.mongodb.com/zh-cn/products/compass)  

### 准备数据库  
1. 在[MongoDB](https://www.mongodb.com/)上创建一个组织（如果有，请跳过；名称随意）  
2. 在组织内创建一个项目（名称随意）  
3. 在项目内创建一个集群（名称随意）  
4. 点击集群上的“Connect”，按照说明使用 MongoDB Compass 连接此集群  
5. 创建一个名为“blog”的数据库  
6. 在数据库内，新建一个名为“about”的集合  
7. 按照自己的实际情况，修改本项目下的 `db/about.json` 文件内容，随后将其导入到“about”集合中  
8. 回到第四步，点击“Connect”，点击 “Drivers”，并记录下面给出的连接地址（后面有用）  

### 准备 GitHub OAuth  
1. 登录 [GitHub](https://github.com/)，创建一个 OAuth App，并记录得到的客户端ID和密钥（后面有用）

### 部署项目  
1. 使用 Vercel CLI 将此项目部署到 Vercel 上  
2. 打开 Vercel 项目设置，为此项目分别添加下面的环境变量：
   1. `MONGODB_URI` : 对应“准备数据库”第八步的连接地址  
   2. `GITHUB_OAUTH_ID`: 对应“准备 GitHub OAuth”第一步的客户端ID  
   3. `GITHUB_OAUTH_SECRET` : 对应“准备 GitHub OAuth”第一部的客户端密钥  
   4. `AES_KEY` : 请随意输入一个比较长的字符串，请严格保密  

3. 重新部署此项目  
4. 尽情使用吧！  

### 常用URL  
- 登录：/login  
- 控制台：/admin  

## 注意  
- 项目尚未完工，仅有基本功能，不喜勿喷  
- 本项目许可证为 `Apache-2.0`  
# 加密货币新闻后端

这个项目是一个用于收集、分析和提供加密货币新闻的后端服务。它从 CryptoCompare 获取最新新闻，筛选其相关性和价值，进行 AI 驱动的分析，并将结果存储在 MongoDB 数据库中。

## 功能特点

- 每5分钟获取一次最新的加密货币新闻
- 筛选新闻的相关性和潜在交易价值
- 对有价值的新闻项目进行深度 AI 分析
- 将处理后的新闻存储在 MongoDB 中
- 提供用于检索新闻数据的 API 端点
- 自动清理旧的新闻项目

## 项目结构

- `app.js`：主应用程序文件，设置 Express 服务器和 MongoDB 连接
- `apiRoutes.js`：定义用于检索新闻数据的 API 路由
- `newsCollector.js`：管理新闻收集过程
- `newsScreening.js`：筛选新闻项目的相关性和价值
- `newsAnalysis.js`：对有价值的新闻项目进行深度 AI 分析
- `package.json`：定义项目依赖和脚本
- `.env`：包含环境变量（不包含在代码仓库中）

## 前提条件

- Node.js（v14 或更高版本）
- npm
- MongoDB Atlas 账户
- CryptoCompare API 密钥
- 智谱 AI API 密钥

## 设置

1. 克隆代码仓库：
   ```
   git clone https://github.com/0xrikt/crypto-news-backend.git
   cd crypto-news-backend
   ```

2. 安装依赖：
   ```
   npm install
   ```

3. 在根目录创建一个 `.env` 文件，内容如下：
   ```
   MONGODB_URI=你的mongodb连接字符串
   CRYPTOCOMPARE_API_KEY=你的cryptocompare_api密钥
   ZHIPU_API_KEY=你的智谱api密钥
   PORT=3000
   ```

   用你的实际凭证和所需的端口号替换占位符值。

## 运行应用程序

要启动服务器：

```
npm start
```

对于开发环境，文件更改时自动重启：

```
npm run dev
```

## API 端点

- `GET /api/news`：检索最新的新闻项目
- `GET /api/news/:id`：通过 ID 检索特定的新闻项目

## 部署

这个后端设计用于部署在云平台上，如阿里云或腾讯云。确保在你的部署环境中设置环境变量。

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 许可证

本项目采用 MIT 许可证。

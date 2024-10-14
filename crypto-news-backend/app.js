const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { collectNews } = require('./newsCollector');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 连接到 MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    // 启动新闻收集
    collectNews();
    // 设置定时任务，每5分钟执行一次新闻收集
    setInterval(collectNews, 5 * 60 * 1000);
  })
  .catch(err => console.error('Could not connect to MongoDB', err));

// 导入路由
const apiRoutes = require('./apiRoutes');

// 使用路由
app.use('/api', apiRoutes);

// 欢迎路由
app.get('/', (req, res) => {
  res.send('Welcome to the Crypto News API');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});
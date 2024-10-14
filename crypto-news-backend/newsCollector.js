const { screenNews } = require('./newsScreening');
const { analyzeNews } = require('./newsAnalysis');
require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

// 定义新闻模型
const NewsSchema = new mongoose.Schema({
  title: String,
  body: String,
  published_on: Date,
  source: String,
  categories: [String],
  cryptocurrencies: [String],
  is_valuable: Boolean,
  analysis: {
    title: String,
    content: String,
    relatedCryptocurrencies: [{
      name: String,
      direction: String
    }]
  }
});

const News = mongoose.model('News', NewsSchema);

// CryptoCompare API 配置
const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY;
const CRYPTOCOMPARE_API_URL = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

// MongoDB 连接
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

async function fetchLatestNews() {
  try {
    console.log('Fetching news from CryptoCompare...');
    const response = await axios.get(CRYPTOCOMPARE_API_URL, {
      headers: {
        'authorization': `Apikey ${CRYPTOCOMPARE_API_KEY}`
      }
    });

    if (response.data && response.data.Data) {
      const currentTime = new Date();
      const fiveMinutesAgo = new Date(currentTime - 5 * 60 * 1000);  // 改回5分钟

      const recentNews = response.data.Data.filter(item => {
        const newsDate = new Date(item.published_on * 1000);
        return newsDate >= fiveMinutesAgo;  // 使用5分钟前的时间
      });

      console.log(`Total news items received: ${response.data.Data.length}`);
      console.log(`News items in the last 5 minutes: ${recentNews.length}`);  // 更新日志消息

      return recentNews;
    } else {
      console.error('Unexpected API response structure:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching news from CryptoCompare:', error);
    return [];
  }
}

async function processAndSaveNews(newsItems) {
  console.log(`Processing ${newsItems.length} news items...`);
  for (const item of newsItems) {
    try {
      const existingNews = await News.findOne({ title: item.title });
      if (!existingNews) {
        console.log('Screening news:', item.title);
        const screeningResult = await screenNews(item);
        console.log('Screening result:', screeningResult);
        
        if (screeningResult && screeningResult.isValuable) {
          console.log('Analyzing news:', item.title);
          const analysisResult = await analyzeNews(item);
          if (analysisResult) {
            console.log('Analysis result:', analysisResult);
            
            const news = new News({
              title: item.title,
              body: item.body,
              published_on: new Date(item.published_on * 1000),
              source: item.source,
              categories: item.categories,
              cryptocurrencies: screeningResult.relatedCryptocurrencies,
              is_valuable: screeningResult.isValuable,
              analysis: {
                title: analysisResult.title,
                content: analysisResult.analysis,
                relatedCryptocurrencies: analysisResult.relatedCryptocurrencies
              }
            });

            await news.save();
            console.log(`Saved, screened, and analyzed news: ${news.title}`);
          } else {
            console.log('Failed to analyze news, skipping...');
            continue; // 跳过这条新闻，继续处理下一条
          }
        } else {
          console.log(`Skipped non-valuable news: ${item.title}`);
        }
      } else {
        console.log(`Skipped existing news: ${item.title}`);
      }
    } catch (error) {
      console.error(`Error processing news item: ${item.title}`, error);
    }
  }
  console.log('Finished processing news items.');
}

async function cleanupOldNews() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await News.deleteMany({ published_on: { $lt: thirtyDaysAgo } });
    console.log('Cleaned up old news');
  } catch (error) {
    console.error('Error cleaning up old news:', error);
  }
}

async function collectNews() {
  try {
    const latestNews = await fetchLatestNews();
    await processAndSaveNews(latestNews);
    await cleanupOldNews();
  } catch (error) {
    console.error('Error in collectNews:', error);
  }
}

// 立即执行一次，以便测试
collectNews();

// 导出函数，以便在其他文件中使用
module.exports = { collectNews };

// 如果直接运行此文件，则启动定时任务
if (require.main === module) {
  // 设置定时任务，每5分钟执行一次
  const interval = setInterval(collectNews, 5 * 60 * 1000);

  // 处理进程退出
  process.on('SIGINT', async () => {
    clearInterval(interval);
    await mongoose.connection.close();
    console.log('Application terminated. MongoDB connection closed.');
    process.exit(0);
  });
}

module.exports = { collectNews, News };
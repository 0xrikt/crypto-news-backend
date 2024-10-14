const express = require('express');
const router = express.Router();
const { News } = require('./newsCollector');

// 获取最新新闻列表
router.get('/news', async (req, res) => {
  try {
    const news = await News.find({ is_valuable: true })
      .sort({ published_on: -1 })
      .limit(50)
      .select('title analysis.title analysis.relatedCryptocurrencies published_on');
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取特定新闻详情
router.get('/news/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (news) {
      res.json(news);
    } else {
      res.status(404).json({ message: 'News not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
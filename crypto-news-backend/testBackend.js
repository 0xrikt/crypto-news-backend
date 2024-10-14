const axios = require('axios');

async function testBackend() {
  try {
    // 测试获取新闻列表
    console.log('Testing news list endpoint...');
    const listResponse = await axios.get('http://localhost:3000/api/news');
    console.log(`Received ${listResponse.data.length} news items.`);
    
    if (listResponse.data.length > 0) {
      const firstNewsId = listResponse.data[0]._id;
      
      // 测试获取单个新闻详情
      console.log(`\nTesting news detail endpoint for news ID: ${firstNewsId}`);
      const detailResponse = await axios.get(`http://localhost:3000/api/news/${firstNewsId}`);
      
      console.log('News Detail:');
      console.log('Title:', detailResponse.data.analysis.title);
      console.log('Published on:', new Date(detailResponse.data.published_on).toLocaleString());
      console.log('Related Cryptocurrencies:');
      detailResponse.data.analysis.relatedCryptocurrencies.forEach(crypto => {
        console.log(`- ${crypto.name}: ${crypto.direction}`);
      });
      console.log('\nAnalysis Content:');
      console.log(detailResponse.data.analysis.content);
    } else {
      console.log('No news items found. Make sure the news collection process has run.');
    }
  } catch (error) {
    console.error('Error during test:', error.message);
  }
}

testBackend();
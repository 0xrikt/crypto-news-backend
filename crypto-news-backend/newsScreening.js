const axios = require('axios');
require('dotenv').config();

const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

async function screenNews(newsItem) {
  console.log('Starting to screen news:', newsItem.title);
  
  const prompt = `
作为一位专业的加密货币新闻分析专家，请仔细分析以下新闻：

标题：${newsItem.title}
内容：${newsItem.body}

请回答以下问题：

1. 这条新闻与哪些真实存在的加密货币相关？请只列出确实存在的加密货币名称或代币符号，如"BTC"。如果新闻中没有提到任何特定的加密货币，请将数组留空。

2. 这条新闻是否能带来有价值的加密货币交易机会？请根据新闻内容对市场可能产生的影响来判断，并回答"是"或"否"。你需要维持高标准，如果只是一般有价值，视为否。

请严格按照以下JSON格式回答，不要添加任何额外的解释或评论：

{
  "relatedCryptocurrencies": ["币名1", "币名2", ...],
  "hasTradeValue": true/false
}

注意：
- 只包含真实存在的加密货币，不要包括公司名称、项目名称或其他非加密货币的名称。
- 如果新闻中提到的是一般性的"加密货币"或"代币"，而没有指定具体名称，请不要在 relatedCryptocurrencies 中列出任何内容。
- hasTradeValue 应该基于新闻内容对加密货币后续价格的潜在影响来判断，而不仅仅是因为提到了某个加密货币。
`;

  try {
    console.log('Preparing to call Zhipu API...');
    console.log('API URL:', ZHIPU_API_URL);
    console.log('API Key (first 5 chars):', ZHIPU_API_KEY.substring(0, 5) + '...');

    const response = await axios.post(ZHIPU_API_URL, {
      model: "glm-4",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      top_p: 0.7,
      max_tokens: 1024
    }, {
      headers: {
        'Authorization': `Bearer ${ZHIPU_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('API response received. Status:', response.status);
    console.log('Response headers:', JSON.stringify(response.headers, null, 2));
    console.log('Response data:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      const content = response.data.choices[0].message.content;
      console.log('API response content:', content);
      
      try {
        // 尝试提取 JSON 部分
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonContent = jsonMatch ? jsonMatch[0] : null;
        
        if (jsonContent) {
          const result = JSON.parse(jsonContent);
          console.log('Parsed result:', JSON.stringify(result, null, 2));
          return {
            relatedCryptocurrencies: result.relatedCryptocurrencies,
            isValuable: result.hasTradeValue
          };
        } else {
          console.error('No valid JSON found in the response');
          console.log('Full content:', content);
          return null;
        }
      } catch (parseError) {
        console.error('Error parsing API response content:', parseError);
        console.log('Failed to parse content:', content);
        return null;
      }
    } else {
      console.error('Unexpected API response structure:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    console.error('Error calling Zhipu API:', error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Request:', error.request);
    } else {
      console.error('Error setting up the request:', error.message);
    }
    console.error('Error config:', JSON.stringify(error.config, null, 2));
    return null;
  }
}

module.exports = { screenNews };
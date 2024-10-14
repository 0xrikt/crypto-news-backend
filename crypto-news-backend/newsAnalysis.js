const axios = require('axios');
require('dotenv').config();

const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

async function analyzeNews(newsItem) {
  console.log('Starting to analyze news:', newsItem.title);
  
  const prompt = `
作为一位专业的加密货币新闻分析专家，请仔细分析以下新闻：

标题：${newsItem.title}
内容：${newsItem.body}

请按照以下要求进行分析并给出结果：

1. 精炼概括新闻，生成一个新的标题。
2. 对新闻进行深度分析，生成一段连贯的内容。内容包括以下方面：
   - 简要解读
   - 基本面分析
   - 市场情绪分析
   - 历史经验（历史上发生这种事情对标的后续价格的影响）
   - 行业趋势分析
   - 竞争格局分析
   最后给出交易建议。
   注意，如果从有些角度的分析不合逻辑就不分析该角度，直接跳过。确保最终结论的合理性。
3. 给出新闻的关联加密货币，及其对应的看涨/看跌方向。注意，是新闻本身关联的加密货币，不是你分析中提及的加密货币。

请严格按照以下JSON格式回答，不要添加任何额外的解释或评论：

{
  "title": "新生成的标题",
  "analysis": "完整的分析文章",
  "relatedCryptocurrencies": [
    {
      "name": "币名1",
      "direction": "看涨/看跌"
    },
    {
      "name": "币名2",
      "direction": "看涨/看跌"
    }
  ]
}
`;

  try {
    const response = await axios.post(ZHIPU_API_URL, {
      model: "glm-4-flash",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      top_p: 0.8,
      max_tokens: 2048
    }, {
      headers: {
        'Authorization': `Bearer ${ZHIPU_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      const content = response.data.choices[0].message.content;
      console.log('API response content:', content);
      
      try {
        // 清理内容中的控制字符
        const cleanedContent = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
        
        // 尝试提取 JSON 部分
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        const jsonContent = jsonMatch ? jsonMatch[0] : null;
        
        if (jsonContent) {
          const result = JSON.parse(jsonContent);
          console.log('Parsed result:', JSON.stringify(result, null, 2));
          return result;
        } else {
          console.error('No valid JSON found in the response');
          console.log('Full content:', cleanedContent);
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

module.exports = { analyzeNews };
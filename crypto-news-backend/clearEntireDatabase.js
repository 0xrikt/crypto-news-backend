const mongoose = require('mongoose');
require('dotenv').config();

const NewsSchema = new mongoose.Schema({
  title: String,
  body: String,
  published_on: Date,
  source: String,
  categories: [String],
  cryptocurrencies: [String],
  is_valuable: Boolean
});

const News = mongoose.model('News', NewsSchema);

async function clearDatabase(confirmClear = false) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    
    console.log('Connected to MongoDB');

    const totalCount = await News.countDocuments();
    console.log(`Total documents in the collection: ${totalCount}`);

    if (confirmClear) {
      const result = await News.deleteMany({});
      console.log(`Cleared ${result.deletedCount} documents from the database`);
    } else {
      console.log('Dry run completed. No data was deleted.');
      console.log('To clear the database, run the script with confirmClear = true');
    }

    const remainingCount = await News.countDocuments();
    console.log(`Remaining documents in the collection: ${remainingCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// 默认进行干运行，不删除数据
clearDatabase(true);

// 要实际清空数据库，将参数改为 true
// clearDatabase(true);
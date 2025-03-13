require('dotenv').config();
const { NotionClient } = require('./notion/client');
const { OpenAIClient } = require('./ai/openai');

/**
 * Main entry point for the n8n_notion_ai integration
 */
async function main() {
  console.log('Starting n8n_notion_ai integration...');
  
  try {
    // Initialize clients
    const notionClient = new NotionClient(process.env.NOTION_API_KEY);
    const aiClient = new OpenAIClient(process.env.OPENAI_API_KEY);
    
    // Example: Get data from Notion
    const databaseId = process.env.NOTION_DATABASE_ID;
    const notionData = await notionClient.queryDatabase(databaseId);
    
    // Example: Process with AI
    const enhancedData = await aiClient.enhanceContent(notionData);
    
    // Example: Update Notion with processed data
    await notionClient.updateDatabase(databaseId, enhancedData);
    
    console.log('Integration completed successfully');
  } catch (error) {
    console.error('Error in integration:', error);
  }
}

// Run the integration if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { main };